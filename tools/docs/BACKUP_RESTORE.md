# Omniy バックアップ・リストア手順書

最終更新日: 2025年1月27日

## 🎯 概要

本文書は、Omniy Instagram自動投稿サービスのデータバックアップ・災害復旧手順を定義します。データ損失ゼロとサービス継続性を確保するため、自動化されたバックアップ戦略と迅速な復旧プロセスを確立します。

## 📊 バックアップ戦略

### RTO/RPO 目標

| データタイプ | RTO (復旧目標時間) | RPO (データ損失許容時間) | バックアップ頻度 |
|--------------|-------------------|------------------------|------------------|
| **ユーザーデータ** | 4時間 | 1時間 | 1時間毎 |
| **投稿コンテンツ** | 2時間 | 30分 | 30分毎 |
| **投稿履歴** | 8時間 | 4時間 | 4時間毎 |
| **設定・メタデータ** | 1時間 | 15分 | 15分毎 |
| **アプリケーションコード** | 30分 | 0分 | Git push毎 |

### バックアップの3-2-1ルール

- **3つのコピー**: 本番・プライマリバックアップ・セカンダリバックアップ
- **2つの異なるメディア**: Cloud Storage・BigQuery
- **1つのオフサイト**: 異なるリージョンでの保管

---

## 🗄️ Firestore バックアップ

### 1. 自動バックアップ設定

#### 1.1 Cloud Scheduler設定
```bash
# 毎時バックアップのスケジューラー作成
gcloud scheduler jobs create http firestore-backup-hourly \
  --location=asia-northeast1 \
  --schedule="0 * * * *" \
  --uri="https://us-central1-omniy-prod.cloudfunctions.net/firestoreBackup" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --message-body='{"collections": ["users", "schedules", "posts", "igAccounts"]}'
```

#### 1.2 バックアップ関数実装
```javascript
// functions/src/backup/firestoreBackup.ts
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const projectId = 'omniy-prod';

export async function firestoreBackup(req: any, res: any) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputUriPrefix = `gs://omniy-backups/firestore/${timestamp}`;
    
    // Firestore Export実行
    const operation = await admin.firestore().export({
      databaseId: '(default)',
      outputUriPrefix: outputUriPrefix,
      collectionIds: req.body.collections || []
    });

    // バックアップメタデータ保存
    await saveBackupMetadata({
      timestamp,
      type: 'firestore-full',
      status: 'running',
      operationName: operation.name,
      outputUri: outputUriPrefix,
      collections: req.body.collections
    });

    res.json({ 
      message: 'Backup started',
      operationName: operation.name,
      outputUri: outputUriPrefix
    });
  } catch (error) {
    console.error('Backup failed:', error);
    res.status(500).json({ error: 'Backup failed' });
  }
}

async function saveBackupMetadata(metadata: any) {
  await admin.firestore()
    .collection('_system')
    .doc('backups')
    .collection('history')
    .doc(metadata.timestamp)
    .set(metadata);
}
```

#### 1.3 差分バックアップ実装
```javascript
// 増分バックアップ関数
export async function incrementalBackup(req: any, res: any) {
  try {
    const lastBackup = await getLastBackupTimestamp();
    const timestamp = new Date().toISOString();
    
    // 差分データの抽出
    const changes = await extractChanges(lastBackup, timestamp);
    
    // Cloud Storage に保存
    const backupData = {
      timestamp,
      type: 'incremental',
      since: lastBackup,
      changes: changes
    };

    const bucket = storage.bucket('omniy-backups');
    const file = bucket.file(`incremental/${timestamp}.json`);
    
    await file.save(JSON.stringify(backupData, null, 2), {
      metadata: { contentType: 'application/json' }
    });

    res.json({ message: 'Incremental backup completed', timestamp });
  } catch (error) {
    console.error('Incremental backup failed:', error);
    res.status(500).json({ error: 'Incremental backup failed' });
  }
}

async function extractChanges(since: string, until: string) {
  const changes: any[] = [];
  const collections = ['users', 'schedules', 'posts', 'igAccounts'];

  for (const collection of collections) {
    const snapshot = await admin.firestore()
      .collection(collection)
      .where('updatedAt', '>', since)
      .where('updatedAt', '<=', until)
      .get();

    snapshot.docs.forEach(doc => {
      changes.push({
        collection,
        docId: doc.id,
        data: doc.data(),
        operation: doc.data().deletedAt ? 'delete' : 'upsert'
      });
    });
  }

  return changes;
}
```

### 2. バックアップ監視

#### 2.1 バックアップ成功/失敗の監視
```javascript
// バックアップ監視関数
export async function monitorBackups(req: any, res: any) {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const backups = await admin.firestore()
      .collection('_system')
      .doc('backups')
      .collection('history')
      .where('timestamp', '>', last24Hours.toISOString())
      .orderBy('timestamp', 'desc')
      .get();

    const backupStatus = {
      total: backups.size,
      successful: 0,
      failed: 0,
      running: 0,
      lastSuccessful: null,
      failures: []
    };

    backups.docs.forEach(doc => {
      const data = doc.data();
      switch (data.status) {
        case 'completed':
          backupStatus.successful++;
          if (!backupStatus.lastSuccessful || data.timestamp > backupStatus.lastSuccessful) {
            backupStatus.lastSuccessful = data.timestamp;
          }
          break;
        case 'failed':
          backupStatus.failed++;
          backupStatus.failures.push({
            timestamp: data.timestamp,
            error: data.error
          });
          break;
        case 'running':
          backupStatus.running++;
          break;
      }
    });

    // アラート送信
    if (backupStatus.failed > 0 || backupStatus.successful === 0) {
      await sendBackupAlert(backupStatus);
    }

    res.json(backupStatus);
  } catch (error) {
    console.error('Backup monitoring failed:', error);
    res.status(500).json({ error: 'Monitoring failed' });
  }
}
```

---

## 🔄 Cloud Storage バックアップ

### 1. ファイルバックアップ設定

#### 1.1 バージョニング有効化
```bash
# バケットでバージョニング有効化
gsutil versioning set on gs://omniy-user-uploads
gsutil versioning set on gs://omniy-backups

# ライフサイクル設定
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
        "condition": {"age": 30}
      },
      {
        "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
        "condition": {"age": 90}
      },
      {
        "action": {"type": "Delete"},
        "condition": {"age": 365}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://omniy-user-uploads
```

#### 1.2 レプリケーション設定
```bash
# 異なるリージョンへのレプリケーション
gcloud storage buckets create gs://omniy-backups-us \
  --location=us-central1 \
  --storage-class=standard

# Transfer Service でのクロスリージョンコピー
gcloud transfer jobs create \
  --source-gcs-bucket=omniy-backups \
  --sink-gcs-bucket=omniy-backups-us \
  --schedule-repeats-every=24h \
  --schedule-repeats-until=2026-01-01
```

### 2. アプリケーションファイルの同期

```javascript
// ユーザーアップロードファイルのバックアップ
export async function backupUserFiles(req: any, res: any) {
  try {
    const sourceBucket = storage.bucket('omniy-user-uploads');
    const backupBucket = storage.bucket('omniy-backups');
    
    const [files] = await sourceBucket.getFiles();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    for (const file of files) {
      const backupPath = `files/${timestamp}/${file.name}`;
      await file.copy(backupBucket.file(backupPath));
    }

    res.json({ 
      message: 'File backup completed',
      fileCount: files.length,
      timestamp
    });
  } catch (error) {
    console.error('File backup failed:', error);
    res.status(500).json({ error: 'File backup failed' });
  }
}
```

---

## 📝 BigQuery データウェアハウス

### 1. 分析用データバックアップ

#### 1.1 BigQuery Export設定
```javascript
// Firestore → BigQuery Export
export async function exportToBigQuery(req: any, res: any) {
  try {
    const { BigQuery } = require('@google-cloud/bigquery');
    const bigquery = new BigQuery({ projectId: 'omniy-prod' });
    
    const dataset = bigquery.dataset('analytics');
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    // ユーザー分析データ
    await exportCollectionToBigQuery('users', `users_${timestamp}`, dataset);
    await exportCollectionToBigQuery('schedules', `schedules_${timestamp}`, dataset);
    await exportCollectionToBigQuery('posts', `posts_${timestamp}`, dataset);
    
    res.json({ message: 'BigQuery export completed', date: timestamp });
  } catch (error) {
    console.error('BigQuery export failed:', error);
    res.status(500).json({ error: 'BigQuery export failed' });
  }
}

async function exportCollectionToBigQuery(collectionName: string, tableName: string, dataset: any) {
  const docs = await admin.firestore().collection(collectionName).get();
  const rows = docs.docs.map(doc => ({
    id: doc.id,
    data: JSON.stringify(doc.data()),
    timestamp: new Date().toISOString()
  }));

  const table = dataset.table(tableName);
  await table.insert(rows);
}
```

#### 1.2 データ保持ポリシー
```sql
-- BigQuery テーブル作成（パーティション・クラスタリング）
CREATE TABLE `omniy-prod.analytics.users`
(
  id STRING,
  data JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
PARTITION BY DATE(created_at)
CLUSTER BY id
OPTIONS(
  partition_expiration_days=2555,  -- 7年間保持
  require_partition_filter=true
);
```

---

## 🔧 復旧手順

### 1. 完全災害復旧

#### 1.1 新環境構築
```bash
#!/bin/bash
# disaster-recovery.sh

set -e

PROJECT_ID="omniy-recovery"
BACKUP_BUCKET="omniy-backups"
LATEST_BACKUP=$(gsutil ls gs://${BACKUP_BUCKET}/firestore/ | tail -1)

echo "Starting disaster recovery process..."
echo "Latest backup: ${LATEST_BACKUP}"

# 1. Firebase プロジェクト作成
gcloud projects create ${PROJECT_ID}
gcloud config set project ${PROJECT_ID}

# 2. Firebase 初期化
firebase use ${PROJECT_ID}
firebase setup:emulators:firestore

# 3. Firestore 復元
gcloud firestore operations list
gcloud firestore import ${LATEST_BACKUP} --database='(default)'

# 4. Cloud Functions デプロイ
cd functions
npm install
npm run build
firebase deploy --only functions

# 5. Hosting デプロイ  
cd ../frontend
npm install
npm run build
firebase deploy --only hosting

echo "Disaster recovery completed!"
```

#### 1.2 段階的復旧プロセス
```markdown
## Disaster Recovery Process

### Phase 1: Critical Systems (0-2 hours)
1. [ ] Firestore データベース復元
2. [ ] 認証システム復旧
3. [ ] 基本API機能復旧
4. [ ] 緊急告知ページ表示

### Phase 2: Core Features (2-8 hours)
1. [ ] Instagram投稿機能復旧
2. [ ] スケジューラー復旧
3. [ ] 決済システム復旧
4. [ ] ユーザーダッシュボード復旧

### Phase 3: Advanced Features (8-24 hours)
1. [ ] 履歴・分析機能復旧
2. [ ] 通知システム復旧
3. [ ] 全機能テスト実行
4. [ ] 監視・アラート復旧
```

### 2. 部分復旧手順

#### 2.1 特定データの復旧
```javascript
// 特定ユーザーデータの復旧
export async function restoreUserData(req: any, res: any) {
  try {
    const { userId, backupTimestamp } = req.body;
    
    // バックアップからデータ取得
    const backupPath = `firestore/${backupTimestamp}`;
    const userData = await getBackupData(backupPath, 'users', userId);
    
    if (!userData) {
      return res.status(404).json({ error: 'Backup data not found' });
    }

    // 現在のデータをバックアップ
    const currentData = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (currentData.exists) {
      await saveRestorePoint(userId, currentData.data());
    }

    // データ復元
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .set(userData);

    res.json({ 
      message: 'User data restored successfully',
      userId,
      backupTimestamp
    });
  } catch (error) {
    console.error('User data restore failed:', error);
    res.status(500).json({ error: 'Restore failed' });
  }
}

async function saveRestorePoint(userId: string, data: any) {
  const timestamp = new Date().toISOString();
  await admin.firestore()
    .collection('_system')
    .doc('restores')
    .collection('points')
    .doc(`${userId}_${timestamp}`)
    .set({
      userId,
      data,
      timestamp,
      type: 'pre-restore-backup'
    });
}
```

#### 2.2 データ整合性チェック
```javascript
// 復旧後のデータ整合性チェック
export async function validateDataIntegrity(req: any, res: any) {
  try {
    const issues: any[] = [];
    
    // ユーザー ↔ スケジュール整合性
    const users = await admin.firestore().collection('users').get();
    for (const user of users.docs) {
      const schedules = await admin.firestore()
        .collection('schedules')
        .where('userId', '==', user.id)
        .get();
      
      const userScheduleCount = user.data().scheduleCount || 0;
      if (schedules.size !== userScheduleCount) {
        issues.push({
          type: 'schedule_count_mismatch',
          userId: user.id,
          expected: userScheduleCount,
          actual: schedules.size
        });
      }
    }

    // IGアカウント ↔ スケジュール整合性
    const igAccounts = await admin.firestore().collection('igAccounts').get();
    for (const account of igAccounts.docs) {
      const schedules = await admin.firestore()
        .collection('schedules')
        .where('igAccountId', '==', account.id)
        .get();
        
      for (const schedule of schedules.docs) {
        if (schedule.data().userId !== account.data().userId) {
          issues.push({
            type: 'account_user_mismatch',
            scheduleId: schedule.id,
            accountUserId: account.data().userId,
            scheduleUserId: schedule.data().userId
          });
        }
      }
    }

    res.json({
      valid: issues.length === 0,
      issues,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Data integrity check failed:', error);
    res.status(500).json({ error: 'Integrity check failed' });
  }
}
```

---

## 🧪 バックアップテスト

### 1. 定期復旧テスト

#### 1.1 月次復旧テスト手順
```bash
#!/bin/bash
# monthly-restore-test.sh

RECOVERY_PROJECT="omniy-test-recovery"
TEST_DATE=$(date +%Y%m%d)
LATEST_BACKUP=$(gsutil ls gs://omniy-backups/firestore/ | tail -1)

echo "Starting monthly restore test: ${TEST_DATE}"

# テスト環境作成
gcloud projects create ${RECOVERY_PROJECT}-${TEST_DATE}
gcloud config set project ${RECOVERY_PROJECT}-${TEST_DATE}

# バックアップ復元テスト
gcloud firestore import ${LATEST_BACKUP} --database='(default)'

# 基本機能テスト
npm run test:restore -- --project=${RECOVERY_PROJECT}-${TEST_DATE}

# 性能テスト
npm run test:performance -- --project=${RECOVERY_PROJECT}-${TEST_DATE}

# レポート生成
generate_restore_test_report ${TEST_DATE}

# テスト環境クリーンアップ
gcloud projects delete ${RECOVERY_PROJECT}-${TEST_DATE} --quiet

echo "Monthly restore test completed: ${TEST_DATE}"
```

#### 1.2 自動テストスクリプト
```javascript
// restore-test.js
const admin = require('firebase-admin');
const { expect } = require('chai');

describe('Restore Validation Tests', () => {
  before(async () => {
    admin.initializeApp({
      projectId: process.env.TEST_PROJECT_ID
    });
  });

  it('should have all required collections', async () => {
    const collections = ['users', 'schedules', 'posts', 'igAccounts'];
    
    for (const collection of collections) {
      const snapshot = await admin.firestore().collection(collection).limit(1).get();
      expect(snapshot.empty).to.be.false;
    }
  });

  it('should maintain data relationships', async () => {
    const users = await admin.firestore().collection('users').limit(10).get();
    
    for (const user of users.docs) {
      const schedules = await admin.firestore()
        .collection('schedules')
        .where('userId', '==', user.id)
        .get();
      
      for (const schedule of schedules.docs) {
        expect(schedule.data().userId).to.equal(user.id);
      }
    }
  });

  it('should have recent data', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentSchedules = await admin.firestore()
      .collection('schedules')
      .where('createdAt', '>', yesterday)
      .get();
    
    expect(recentSchedules.size).to.be.greaterThan(0);
  });
});
```

### 2. バックアップ品質チェック

```javascript
// バックアップ品質検証
export async function validateBackupQuality(req: any, res: any) {
  try {
    const { backupTimestamp } = req.body;
    const issues: any[] = [];
    
    // 1. データ完全性チェック
    const backupMetadata = await getBackupMetadata(backupTimestamp);
    const expectedCollections = ['users', 'schedules', 'posts', 'igAccounts'];
    
    for (const collection of expectedCollections) {
      const count = await getBackupCollectionCount(backupTimestamp, collection);
      if (count === 0) {
        issues.push({
          type: 'empty_collection',
          collection,
          count
        });
      }
    }

    // 2. データ整合性チェック
    const dataConsistency = await checkBackupConsistency(backupTimestamp);
    issues.push(...dataConsistency);

    // 3. サイズ妥当性チェック
    const backupSize = await getBackupSize(backupTimestamp);
    const previousBackupSize = await getPreviousBackupSize();
    
    if (backupSize < previousBackupSize * 0.8) {
      issues.push({
        type: 'unexpected_size_decrease',
        currentSize: backupSize,
        previousSize: previousBackupSize,
        ratio: backupSize / previousBackupSize
      });
    }

    res.json({
      valid: issues.length === 0,
      issues,
      backupTimestamp,
      validatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Backup validation failed:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
}
```

---

## 📋 運用チェックリスト

### 日次確認事項
```markdown
## Daily Backup Checklist

### Morning (9:00 AM)
- [ ] 前日の自動バックアップ成功確認
- [ ] バックアップサイズの妥当性チェック
- [ ] 異常なエラーログの確認
- [ ] バックアップストレージ使用量確認

### Evening (6:00 PM)
- [ ] 当日のバックアップ状況確認
- [ ] 翌日のメンテナンス予定確認
- [ ] 週次/月次テストスケジュール確認
```

### 週次確認事項
```markdown
## Weekly Backup Review

### Every Monday
- [ ] 週次バックアップ品質レポート確認
- [ ] バックアップ保持ポリシー遵守確認
- [ ] 復旧テスト結果レビュー
- [ ] バックアップコスト最適化チェック

### Every Friday  
- [ ] 来週のバックアップスケジュール確認
- [ ] 重要変更予定とバックアップ計画調整
- [ ] 月次復旧テスト準備（該当週のみ）
```

### 月次確認事項
```markdown
## Monthly Backup Audit

### First Monday of Month
- [ ] 完全災害復旧テスト実行
- [ ] バックアップ戦略見直し
- [ ] RTO/RPO目標達成状況確認
- [ ] バックアップコスト分析

### Third Monday of Month  
- [ ] バックアップ自動化スクリプト更新
- [ ] 保持ポリシー最適化検討
- [ ] 災害復旧手順書更新
- [ ] チーム研修・ドリル実施
```

---

## 🔗 関連ドキュメント

- [障害対応手順書](./INCIDENT_RESPONSE.md)
- [監視・アラート設定](./MONITORING_SETUP.md)
- [運用手順書](./OPERATIONS.md)
- [技術仕様書](./TECHNICAL_SPECIFICATIONS.md)

---

**作成者**: インフラチーム  
**承認者**: CTO  
**次回見直し**: 2025年4月27日