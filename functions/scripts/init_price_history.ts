/**
 * price_history コレクションの初期化スクリプト
 * 既存のプラン情報を Price-Ladder 形式に変換して初期データを作成
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";
import { PriceHistoryRecord } from "../src/types/pricing";

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Firebase Admin初期化
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function initializePriceHistory() {
  console.log("🚀 price_history コレクションの初期化を開始します...");

  try {
    // 初期価格レコードを作成
    const initialPriceRecord: PriceHistoryRecord = {
      priceId: process.env.CURRENT_PRICE_ID || "price_tier_000",
      lookupKey: "tier_000",
      maxSubscribers: 100,              // 最初の100人まで
      amount: 4980,                     // ¥4,980
      currency: "jpy",
      createdAt: admin.firestore.Timestamp.now(),
      isActive: true,
      metadata: {
        tier: "tier_000",
        createdBy: "migration",
        maxSubscribers: "100",
      },
    };

    // price_history コレクションに追加
    const docRef = db.collection("price_history").doc();
    await docRef.set(initialPriceRecord);

    console.log("✅ 初期価格レコードを作成しました:");
    console.log(JSON.stringify(initialPriceRecord, null, 2));

    // Firestoreルールを更新するためのindex更新
    console.log("📝 Firestore インデックスが必要です:");
    console.log("  - price_history: createdAt (desc)");
    console.log("  - price_history: isActive, maxSubscribers");

    // 既存のプランコレクションを無効化（必要に応じて）
    console.log("⚠️  既存のplansコレクションは保持されますが、新システムでは使用されません");

  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

// 実行
initializePriceHistory()
  .then(() => {
    console.log("✨ price_history の初期化が完了しました");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 初期化に失敗しました:", error);
    process.exit(1);
  });