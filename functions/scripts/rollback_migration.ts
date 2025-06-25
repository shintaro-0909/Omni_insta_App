/**
 * Grandfather Pricing移行のロールバックスクリプト
 * 
 * 注意: このスクリプトは移行に問題があった場合の緊急用です
 * 本番環境では慎重に実行してください
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Firebase Admin初期化
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface RollbackReport {
  usersRolledBack: number;
  subscriptionsRolledBack: number;
  errors: string[];
}

async function rollbackMigration(): Promise<RollbackReport> {
  console.log("🔄 Grandfather Pricing移行のロールバックを開始します...");
  console.log("⚠️  警告: この操作は元に戻せません!");
  
  const report: RollbackReport = {
    usersRolledBack: 0,
    subscriptionsRolledBack: 0,
    errors: [],
  };

  try {
    // Step 1: 移行されたユーザーを元に戻す
    console.log("👤 移行されたユーザーをロールバック中...");
    
    const migratedUsersSnapshot = await db
      .collection("users")
      .where("migratedAt", ">", new Date(0))
      .get();
    
    const userBatch = db.batch();
    let userBatchCount = 0;
    const BATCH_SIZE = 500;
    
    for (const userDoc of migratedUsersSnapshot.docs) {
      const userData = userDoc.data();
      
      // プラン情報を削除（または元の形式に戻す）
      const updates: any = {
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      // migratedAt フィールドを削除
      updates.migratedAt = admin.firestore.FieldValue.delete();
      
      // 新システムのフィールドを削除
      if (userData.currentPlan?.isGrandfathered !== undefined) {
        updates["currentPlan.isGrandfathered"] = admin.firestore.FieldValue.delete();
      }
      if (userData.currentPlan?.priceTier !== undefined) {
        updates["currentPlan.priceTier"] = admin.firestore.FieldValue.delete();
      }
      if (userData.currentPlan?.originalPrice !== undefined) {
        updates["currentPlan.originalPrice"] = admin.firestore.FieldValue.delete();
      }
      
      userBatch.update(userDoc.ref, updates);
      userBatchCount++;
      report.usersRolledBack++;
      
      if (userBatchCount >= BATCH_SIZE) {
        await userBatch.commit();
        console.log(`📦 ${userBatchCount}件のユーザーをロールバックしました`);
        userBatchCount = 0;
      }
    }
    
    if (userBatchCount > 0) {
      await userBatch.commit();
      console.log(`📦 残り${userBatchCount}件のユーザーをロールバックしました`);
    }

    // Step 2: サブスクリプションデータをロールバック
    console.log("🔄 サブスクリプションデータをロールバック中...");
    
    const migratedSubscriptionsSnapshot = await db
      .collection("subscriptions")
      .where("migratedAt", ">", new Date(0))
      .get();
    
    const subBatch = db.batch();
    let subBatchCount = 0;
    
    for (const subDoc of migratedSubscriptionsSnapshot.docs) {
      const subData = subDoc.data();
      
      const updates: any = {
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      // 新システムのフィールドを削除
      updates.migratedAt = admin.firestore.FieldValue.delete();
      if (subData.priceTier !== undefined) {
        updates.priceTier = admin.firestore.FieldValue.delete();
      }
      if (subData.originalPrice !== undefined) {
        updates.originalPrice = admin.firestore.FieldValue.delete();
      }
      if (subData.isGrandfathered !== undefined) {
        updates.isGrandfathered = admin.firestore.FieldValue.delete();
      }
      
      subBatch.update(subDoc.ref, updates);
      subBatchCount++;
      report.subscriptionsRolledBack++;
      
      if (subBatchCount >= BATCH_SIZE) {
        await subBatch.commit();
        console.log(`📦 ${subBatchCount}件のサブスクリプションをロールバックしました`);
        subBatchCount = 0;
      }
    }
    
    if (subBatchCount > 0) {
      await subBatch.commit();
      console.log(`📦 残り${subBatchCount}件のサブスクリプションをロールバックしました`);
    }

    // Step 3: 新システム用コレクションを削除（オプション）
    console.log("⚠️  新システム用コレクションの削除は手動で行ってください:");
    console.log("  - stats/global ドキュメント");
    console.log("  - price_history コレクション");
    
    console.log("✅ ロールバックが完了しました");
    return report;

  } catch (error: any) {
    console.error("❌ ロールバック中にエラーが発生しました:", error);
    report.errors.push(error.message);
    throw error;
  }
}

function displayRollbackReport(report: RollbackReport): void {
  console.log("\n" + "=".repeat(60));
  console.log("📋 ロールバックレポート");
  console.log("=".repeat(60));
  console.log(`👥 ロールバックされたユーザー数: ${report.usersRolledBack}`);
  console.log(`💳 ロールバックされたサブスクリプション数: ${report.subscriptionsRolledBack}`);
  
  if (report.errors.length > 0) {
    console.log("\n❌ エラー:");
    report.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  console.log("\n🔧 手動で削除が必要:");
  console.log("1. stats/global ドキュメント");
  console.log("2. price_history コレクション");
  console.log("3. 新しいCloud Functions のデプロイ解除");
  console.log("=".repeat(60));
}

// 実行
async function main() {
  try {
    // 確認プロンプト
    console.log("⚠️  これはGrandfather Pricing移行のロールバックです");
    console.log("⚠️  本当に実行しますか？ (この操作は元に戻せません)");
    console.log("⚠️  実行する場合は、このスクリプトを直接実行してください");
    
    const report = await rollbackMigration();
    displayRollbackReport(report);
    
    console.log("🎉 ロールバックが正常に完了しました!");
    process.exit(0);
  } catch (error) {
    console.error("💥 ロールバックに失敗しました:", error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

export { rollbackMigration };