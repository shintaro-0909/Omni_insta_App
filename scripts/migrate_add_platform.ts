/**
 * 🔄 Firestore Platform Migration Script
 * 
 * [DATA-001] 既存schedules documentにplatformフィールドを追加
 * - 既存Instagram投稿に 'instagram' を設定
 * - 新しいplatform対応スキーマへの移行
 * - バックアップ・ロールバック対応
 */
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Firebase Admin初期化
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../functions/.runtimeconfig.json'), 'utf8')
);

initializeApp({
  credential: serviceAccount,
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'omniy-dev'
});

const db = getFirestore();

interface ScheduleDocument {
  id: string;
  platform?: string;
  type: string;
  status: string;
  igAccountId?: string;
  content: any;
  nextRunAt: any;
  createdAt: any;
  updatedAt: any;
}

interface MigrationResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

/**
 * 既存scheduleにplatformフィールドを追加
 */
async function migrateSchedulesAddPlatform(): Promise<MigrationResult> {
  console.log('🔄 Starting platform migration for schedules...');
  
  const result: MigrationResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  try {
    // 全scheduleドキュメントを取得
    const schedulesSnapshot = await db.collectionGroup('schedules').get();
    
    console.log(`📋 Found ${schedulesSnapshot.size} schedule documents`);
    
    // バッチ処理（Firestoreの制限: 500操作/バッチ）
    const batchSize = 400;
    const batches: any[][] = [];
    
    schedulesSnapshot.docs.forEach((doc, index) => {
      const batchIndex = Math.floor(index / batchSize);
      if (!batches[batchIndex]) {
        batches[batchIndex] = [];
      }
      batches[batchIndex].push(doc);
    });

    console.log(`📦 Processing ${batches.length} batches of ${batchSize} documents each`);

    // 各バッチを処理
    for (let i = 0; i < batches.length; i++) {
      console.log(`🔄 Processing batch ${i + 1}/${batches.length}...`);
      
      const batch = db.batch();
      const docs = batches[i];

      for (const doc of docs) {
        try {
          const data = doc.data() as ScheduleDocument;
          
          // 既にplatformフィールドがある場合はスキップ
          if (data.platform) {
            result.skipped++;
            continue;
          }

          // platformフィールドを追加
          const updatedData = {
            ...data,
            platform: 'instagram', // デフォルトでInstagram
            migrationVersion: 1,
            migratedAt: new Date()
          };

          batch.update(doc.ref, updatedData);
          result.success++;

        } catch (error) {
          console.error(`❌ Error processing document ${doc.id}:`, error);
          result.failed++;
          result.errors.push(`${doc.id}: ${error}`);
        }
      }

      // バッチ実行
      if (result.success > 0) {
        await batch.commit();
        console.log(`✅ Batch ${i + 1} completed: ${docs.length} documents processed`);
      }
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }

  return result;
}

/**
 * Migration結果を検証
 */
async function validateMigration(): Promise<void> {
  console.log('🔍 Validating migration results...');
  
  // platform フィールドがない schedule をチェック
  const unmigrated = await db.collectionGroup('schedules')
    .where('platform', '==', null)
    .get();
    
  if (unmigrated.size > 0) {
    console.warn(`⚠️  Found ${unmigrated.size} documents without platform field`);
  } else {
    console.log('✅ All schedules have platform field');
  }

  // platform分布を確認
  const platforms = await db.collectionGroup('schedules')
    .get();
    
  const platformCounts: Record<string, number> = {};
  platforms.docs.forEach(doc => {
    const platform = doc.data().platform || 'unknown';
    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
  });

  console.log('📊 Platform distribution:', platformCounts);
}

/**
 * ロールバック機能（緊急時用）
 */
async function rollbackMigration(): Promise<void> {
  console.log('🔄 Rolling back platform migration...');
  
  const migratedDocs = await db.collectionGroup('schedules')
    .where('migrationVersion', '==', 1)
    .get();

  console.log(`📋 Found ${migratedDocs.size} migrated documents to rollback`);

  const batch = db.batch();
  let count = 0;

  migratedDocs.docs.forEach(doc => {
    // migration関連フィールドを削除
    batch.update(doc.ref, {
      platform: db.FieldValue.delete(),
      migrationVersion: db.FieldValue.delete(),
      migratedAt: db.FieldValue.delete()
    });
    count++;

    // バッチサイズ制限
    if (count >= 400) {
      console.log('⚠️  Batch size limit reached. Consider running rollback in chunks.');
      return;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Rollback completed: ${count} documents restored`);
  }
}

/**
 * メイン実行関数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'migrate':
        const result = await migrateSchedulesAddPlatform();
        console.log('\n📊 Migration Results:');
        console.log(`✅ Success: ${result.success}`);
        console.log(`⏭️  Skipped: ${result.skipped}`);
        console.log(`❌ Failed: ${result.failed}`);
        
        if (result.errors.length > 0) {
          console.log('\n❌ Errors:');
          result.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        await validateMigration();
        break;

      case 'validate':
        await validateMigration();
        break;

      case 'rollback':
        if (process.env.CONFIRM_ROLLBACK !== 'yes') {
          console.error('❌ Rollback requires CONFIRM_ROLLBACK=yes environment variable');
          process.exit(1);
        }
        await rollbackMigration();
        break;

      default:
        console.log('📖 Usage:');
        console.log('  npm run migrate:platform migrate    # Add platform field to all schedules');
        console.log('  npm run migrate:platform validate   # Check migration status');
        console.log('  CONFIRM_ROLLBACK=yes npm run migrate:platform rollback  # Rollback changes');
        break;
    }

  } catch (error) {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

export { migrateSchedulesAddPlatform, validateMigration, rollbackMigration };