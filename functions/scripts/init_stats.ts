/**
 * Firestore stats/global コレクションの初期化スクリプト
 * Grandfather Pricing + Price-Ladder モデル用の統計情報を初期化
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

interface GlobalStats {
  currentSubscribers: number;  // 現在の課金者数
  peakSubscribers: number;     // 過去最大課金者数
  currentPriceId: string;      // 現在適用中の価格ID
  lastUpdated: admin.firestore.Timestamp;
}

async function initializeStats() {
  console.log("🚀 stats/global コレクションの初期化を開始します...");

  try {
    // 現在のサブスクリプション数をカウント
    const subscriptionsSnapshot = await db
      .collection("subscriptions")
      .where("status", "==", "active")
      .get();
    
    const currentSubscribers = subscriptionsSnapshot.size;
    console.log(`📊 現在のアクティブサブスクリプション数: ${currentSubscribers}`);

    // 初期価格IDを設定（環境変数から取得、なければデフォルト値）
    const currentPriceId = process.env.CURRENT_PRICE_ID || "price_tier_000";
    
    // stats/global ドキュメントの初期化
    const statsData: GlobalStats = {
      currentSubscribers,
      peakSubscribers: currentSubscribers, // 初期値として現在値を設定
      currentPriceId,
      lastUpdated: admin.firestore.Timestamp.now(),
    };

    await db.collection("stats").doc("global").set(statsData, { merge: true });
    
    console.log("✅ stats/global を初期化しました:");
    console.log(JSON.stringify(statsData, null, 2));

    // 検証: 書き込みが成功したか確認
    const verifyDoc = await db.collection("stats").doc("global").get();
    if (verifyDoc.exists) {
      console.log("✅ 検証成功: stats/global ドキュメントが正常に作成されました");
    } else {
      throw new Error("stats/global ドキュメントの作成に失敗しました");
    }

  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

// 実行
initializeStats()
  .then(() => {
    console.log("✨ 初期化が完了しました");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 初期化に失敗しました:", error);
    process.exit(1);
  });