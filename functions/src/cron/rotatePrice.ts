/**
 * 価格ローテーション機能
 * Grandfather Pricing + Price-Ladder システムの自動価格調整
 * 
 * 重要な仕様:
 * - peakSubscribers は絶対に減算しない（値下げ防止）
 * - 値上げのみ実行（一方向の価格上昇）
 * - 100人ごとに¥500値上げ、上限¥14,800
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { GlobalStats, PriceHistoryRecord } from "../types/pricing";
import { 
  PRICING_CONFIG, 
  calculatePriceForSubscribers, 
  generateLookupKey,
  calculateMaxSubscribersForTier,
  isMaxPriceReached 
} from "../config/pricing";

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

/**
 * 価格ローテーション処理（Cloud Scheduler: 1分間隔）
 * 
 * 処理フロー:
 * 1. peakSubscribers を更新（値下げ防止）
 * 2. 新しい価格が必要かチェック
 * 3. 必要に応じてStripeでPrice作成
 * 4. price_historyとstats更新
 */
export const rotatePriceHandler = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async (context) => {
    console.log("🔄 Price rotation check started");

    try {
      await rotatePrice();
      console.log("✅ Price rotation check completed");
    } catch (error) {
      console.error("❌ Price rotation failed:", error);
      throw error;
    }
  });

/**
 * 価格ローテーションのメイン処理
 * Webhookからも呼び出される
 */
export async function rotatePrice(): Promise<void> {
  // グローバル統計を取得
  const statsDoc = await db.collection("stats").doc("global").get();
  
  if (!statsDoc.exists) {
    throw new Error("stats/global document not found. Please run initialization.");
  }

  const stats = statsDoc.data() as GlobalStats;
  
  // Step A: peakSubscribers を更新（値下げ防止の核心）
  // 現在の加入者数 + 1（Checkout完了予定ユーザー）と比較
  const newPeakSubscribers = Math.max(
    stats.peakSubscribers, 
    stats.currentSubscribers + 1
  );
  
  console.log(`📊 Subscribers: current=${stats.currentSubscribers}, peak=${stats.peakSubscribers}, newPeak=${newPeakSubscribers}`);

  // 現在の価格設定を取得
  const currentPriceQuery = await db
    .collection("price_history")
    .where("priceId", "==", stats.currentPriceId)
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (currentPriceQuery.empty) {
    throw new Error(`Current price record not found: ${stats.currentPriceId}`);
  }

  const currentPriceRecord = currentPriceQuery.docs[0].data() as PriceHistoryRecord;
  
  // Step B: 値上げ判定
  let needsNewPrice = false;
  let targetPrice = currentPriceRecord.amount;
  
  // 新しいピーク加入者数が現在の価格の上限を超えているかチェック
  if (newPeakSubscribers > currentPriceRecord.maxSubscribers) {
    needsNewPrice = true;
    targetPrice = calculatePriceForSubscribers(newPeakSubscribers);
    
    console.log(`💰 Price increase needed: ${currentPriceRecord.amount} → ${targetPrice} (peak: ${newPeakSubscribers})`);
  }

  // 既に最大価格に達している場合は何もしない
  if (isMaxPriceReached(currentPriceRecord.amount) && targetPrice > currentPriceRecord.amount) {
    console.log(`⚠️  Maximum price reached: ${currentPriceRecord.amount}`);
    needsNewPrice = false;
    targetPrice = currentPriceRecord.amount;
  }

  // 新しい価格が必要な場合のみ作成
  if (needsNewPrice && targetPrice > currentPriceRecord.amount) {
    await createNewPriceAndUpdate(targetPrice, newPeakSubscribers);
  }

  // peakSubscribers を更新（値下げ防止）
  if (newPeakSubscribers > stats.peakSubscribers) {
    await db.collection("stats").doc("global").update({
      peakSubscribers: newPeakSubscribers,
      lastUpdated: admin.firestore.Timestamp.now(),
    });
    
    console.log(`📈 Peak subscribers updated: ${stats.peakSubscribers} → ${newPeakSubscribers}`);
  }
}

/**
 * 新しい価格をStripeで作成し、price_historyとstatsを更新
 */
async function createNewPriceAndUpdate(targetPrice: number, peakSubscribers: number): Promise<void> {
  const lookupKey = generateLookupKey(targetPrice);
  const maxSubscribers = calculateMaxSubscribersForTier(peakSubscribers);
  
  console.log(`🚀 Creating new price: ${targetPrice} JPY (${lookupKey})`);

  try {
    // Stripeで新しいPriceを作成
    const stripePrice = await stripe.prices.create({
      unit_amount: targetPrice,
      currency: PRICING_CONFIG.currency,
      recurring: {
        interval: "month",
      },
      product: PRICING_CONFIG.productId,
      lookup_key: lookupKey,
      metadata: {
        tier: lookupKey,
        maxSubscribers: maxSubscribers.toString(),
        createdBy: "auto_rotate",
        createdAt: new Date().toISOString(),
      },
    });

    console.log(`✅ Stripe price created: ${stripePrice.id}`);

    // 現在の価格レコードを非アクティブに
    const currentPriceQuery = await db
      .collection("price_history")
      .where("isActive", "==", true)
      .get();

    const batch = db.batch();
    
    currentPriceQuery.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });

    // 新しい価格レコードを追加
    const newPriceRecord: PriceHistoryRecord = {
      priceId: stripePrice.id,
      lookupKey: lookupKey,
      maxSubscribers: maxSubscribers,
      amount: targetPrice,
      currency: PRICING_CONFIG.currency,
      createdAt: admin.firestore.Timestamp.now(),
      isActive: true,
      metadata: {
        tier: lookupKey,
        createdBy: "auto_rotate",
        maxSubscribers: maxSubscribers.toString(),
      },
    };

    const newPriceRef = db.collection("price_history").doc();
    batch.set(newPriceRef, newPriceRecord);

    // stats/global の currentPriceId を更新
    const statsRef = db.collection("stats").doc("global");
    batch.update(statsRef, {
      currentPriceId: stripePrice.id,
      lastUpdated: admin.firestore.Timestamp.now(),
    });

    await batch.commit();
    
    console.log(`✅ Price rotation completed: ${stripePrice.id} (${targetPrice} JPY)`);

  } catch (error) {
    console.error("❌ Failed to create new price:", error);
    throw error;
  }
}

/**
 * 手動での価格ローテーション実行（管理者用）
 */
export const manualRotatePrice = functions.https.onCall(async (data, context) => {
  // 管理者認証チェック（実装に応じて調整）
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  // TODO: 管理者権限チェックを追加
  // const userDoc = await db.collection("users").doc(context.auth.uid).get();
  // if (!userDoc.exists || !userDoc.data()?.isAdmin) {
  //   throw new functions.https.HttpsError("permission-denied", "Admin access required");
  // }

  try {
    await rotatePrice();
    
    return {
      success: true,
      message: "Price rotation executed successfully",
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Manual price rotation failed:", error);
    
    throw new functions.https.HttpsError(
      "internal",
      `Price rotation failed: ${error.message}`
    );
  }
});