/**
 * 既存データをGrandfather Pricing + Price-Ladder システムに移行
 * 
 * 実行手順:
 * 1. 現在のアクティブサブスクリプション数をカウント
 * 2. stats/global コレクションを初期化
 * 3. price_history に初期価格レコードを作成
 * 4. 既存ユーザーをGrandfathered価格で移行
 * 5. 環境変数の確認と更新指示
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";
import { GlobalStats, PriceHistoryRecord } from "../src/types/pricing";
import { PRICING_CONFIG } from "../src/config/pricing";

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Firebase Admin初期化
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface MigrationReport {
  totalUsers: number;
  activeSubscriptions: number;
  freeUsers: number;
  migratedUsers: number;
  errors: string[];
  warnings: string[];
}

async function migrateToGrandfatherPricing(): Promise<MigrationReport> {
  console.log("🚀 Grandfather Pricing + Price-Ladder システムへの移行を開始します...");
  
  const report: MigrationReport = {
    totalUsers: 0,
    activeSubscriptions: 0,
    freeUsers: 0,
    migratedUsers: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Step 1: 現在のデータを分析
    console.log("📊 現在のデータを分析中...");
    
    // 全ユーザー数をカウント
    const usersSnapshot = await db.collection("users").get();
    report.totalUsers = usersSnapshot.size;
    
    // アクティブサブスクリプション数をカウント
    const activeSubscriptionsSnapshot = await db
      .collection("subscriptions")
      .where("status", "==", "active")
      .get();
    report.activeSubscriptions = activeSubscriptionsSnapshot.size;
    
    console.log(`👥 総ユーザー数: ${report.totalUsers}`);
    console.log(`💳 アクティブサブスクリプション数: ${report.activeSubscriptions}`);

    // Step 2: stats/global を初期化
    console.log("🔧 stats/global コレクションを初期化中...");
    
    const initialStats: GlobalStats = {
      currentSubscribers: report.activeSubscriptions,
      peakSubscribers: report.activeSubscriptions, // 初期値として現在値を設定
      currentPriceId: process.env.CURRENT_PRICE_ID || "price_tier_000",
      lastUpdated: admin.firestore.Timestamp.now(),
    };
    
    await db.collection("stats").doc("global").set(initialStats, { merge: true });
    console.log("✅ stats/global を初期化しました");

    // Step 3: price_history に初期レコードを作成
    console.log("💰 price_history に初期価格レコードを作成中...");
    
    const initialPriceRecord: PriceHistoryRecord = {
      priceId: initialStats.currentPriceId,
      lookupKey: "tier_000",
      maxSubscribers: Math.max(100, report.activeSubscriptions), // 最低100人分を確保
      amount: PRICING_CONFIG.startPriceAmount,
      currency: PRICING_CONFIG.currency,
      createdAt: admin.firestore.Timestamp.now(),
      isActive: true,
      metadata: {
        tier: "tier_000",
        createdBy: "migration",
        maxSubscribers: Math.max(100, report.activeSubscriptions).toString(),
      },
    };
    
    await db.collection("price_history").add(initialPriceRecord);
    console.log("✅ 初期価格レコードを作成しました");

    // Step 4: 既存ユーザーを移行
    console.log("👤 既存ユーザーデータを移行中...");
    
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestoreのバッチ制限
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      const currentPlan = userData.currentPlan || {};
      const planId = currentPlan.planId || "free";
      
      if (planId === "free") {
        // Freeユーザーはそのまま
        report.freeUsers++;
        continue;
      }
      
      // 有料プランユーザーをGrandfather価格で移行
      const updatedPlan = {
        planId: "subscription", // 新システムでは統一
        priceTier: "tier_000",  // 既存ユーザーは最初のティア価格
        status: currentPlan.status || "active",
        subscriptionId: currentPlan.subscriptionId || null,
        originalPrice: PRICING_CONFIG.startPriceAmount, // Grandfather価格
        isGrandfathered: true,  // 既存ユーザーは全てGrandfathered
      };
      
      batch.update(userDoc.ref, {
        currentPlan: updatedPlan,
        migratedAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });
      
      batchCount++;
      report.migratedUsers++;
      
      // バッチサイズに達したらコミット
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`📦 ${batchCount}件のユーザーデータを更新しました`);
        batchCount = 0;
      }
    }
    
    // 残りのバッチをコミット
    if (batchCount > 0) {
      await batch.commit();
      console.log(`📦 残り${batchCount}件のユーザーデータを更新しました`);
    }

    // Step 5: 既存サブスクリプションデータの更新
    console.log("🔄 既存サブスクリプションデータを更新中...");
    
    const subscriptionBatch = db.batch();
    let subBatchCount = 0;
    
    for (const subDoc of activeSubscriptionsSnapshot.docs) {
      const subData = subDoc.data();
      
      const updatedSubscription = {
        ...subData,
        priceTier: "tier_000",
        originalPrice: PRICING_CONFIG.startPriceAmount,
        isGrandfathered: true,
        migratedAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      subscriptionBatch.update(subDoc.ref, updatedSubscription);
      subBatchCount++;
      
      if (subBatchCount >= BATCH_SIZE) {
        await subscriptionBatch.commit();
        console.log(`📦 ${subBatchCount}件のサブスクリプションを更新しました`);
        subBatchCount = 0;
      }
    }
    
    if (subBatchCount > 0) {
      await subscriptionBatch.commit();
      console.log(`📦 残り${subBatchCount}件のサブスクリプションを更新しました`);
    }

    // Step 6: 環境変数チェック
    console.log("🔍 環境変数を確認中...");
    
    const requiredEnvVars = [
      "STRIPE_PRODUCT_ID",
      "CURRENT_PRICE_ID",
      "PRICING_STEP_SIZE",
      "PRICING_INCREMENT",
      "PRICING_START_AMOUNT",
      "PRICING_MAX_AMOUNT",
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        report.warnings.push(`環境変数 ${envVar} が設定されていません`);
      }
    }
    
    console.log("✅ 移行が完了しました!");
    return report;

  } catch (error: any) {
    console.error("❌ 移行中にエラーが発生しました:", error);
    report.errors.push(error.message);
    throw error;
  }
}

/**
 * 移行の検証
 */
async function validateMigration(): Promise<void> {
  console.log("🔍 移行結果を検証中...");
  
  try {
    // stats/global の存在確認
    const statsDoc = await db.collection("stats").doc("global").get();
    if (!statsDoc.exists) {
      throw new Error("stats/global ドキュメントが存在しません");
    }
    
    // price_history の存在確認
    const priceHistorySnapshot = await db
      .collection("price_history")
      .where("isActive", "==", true)
      .get();
    
    if (priceHistorySnapshot.empty) {
      throw new Error("アクティブなprice_historyレコードが存在しません");
    }
    
    // 移行されたユーザー数の確認
    const migratedUsersSnapshot = await db
      .collection("users")
      .where("currentPlan.isGrandfathered", "==", true)
      .get();
    
    console.log(`✅ ${migratedUsersSnapshot.size}人のユーザーがGrandfathered価格で移行されました`);
    console.log("✅ 移行の検証が完了しました");

  } catch (error) {
    console.error("❌ 移行の検証に失敗しました:", error);
    throw error;
  }
}

/**
 * レポート表示
 */
function displayReport(report: MigrationReport): void {
  console.log("\n" + "=".repeat(60));
  console.log("📋 移行レポート");
  console.log("=".repeat(60));
  console.log(`👥 総ユーザー数: ${report.totalUsers}`);
  console.log(`💳 アクティブサブスクリプション数: ${report.activeSubscriptions}`);
  console.log(`🆓 Freeユーザー数: ${report.freeUsers}`);
  console.log(`🔄 移行されたユーザー数: ${report.migratedUsers}`);
  
  if (report.warnings.length > 0) {
    console.log("\n⚠️  警告:");
    report.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
  }
  
  if (report.errors.length > 0) {
    console.log("\n❌ エラー:");
    report.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  console.log("\n🎯 次のステップ:");
  console.log("1. .env ファイルに必要な環境変数を設定");
  console.log("2. Stripe で新しい Price を作成し、CURRENT_PRICE_ID を更新");
  console.log("3. Cloud Functions をデプロイ");
  console.log("4. 価格ローテーション機能をテスト");
  console.log("=".repeat(60));
}

// 実行
async function main() {
  try {
    const report = await migrateToGrandfatherPricing();
    await validateMigration();
    displayReport(report);
    
    console.log("🎉 移行が正常に完了しました!");
    process.exit(0);
  } catch (error) {
    console.error("💥 移行に失敗しました:", error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

export { migrateToGrandfatherPricing, validateMigration };