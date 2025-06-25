/**
 * フロントエンド向け価格システムAPI
 * Grandfather Pricing + Price-Ladder システムの情報を提供
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GlobalStats, PriceHistoryRecord } from "../types/pricing";
import { calculatePriceForSubscribers, generateLookupKey, isMaxPriceReached } from "../config/pricing";

const db = admin.firestore();

interface CurrentPricingResponse {
  globalStats: GlobalStats;
  currentPrice: PriceHistoryRecord;
  nextTierInfo: {
    amount: number;
    remainingUsers: number;
  } | null;
}

/**
 * 現在の価格システム情報を取得（フロントエンド用）
 */
export const getCurrentPricing = functions.https.onCall(async (data, context) => {
  try {
    // stats/global を取得
    const statsDoc = await db.collection("stats").doc("global").get();
    
    if (!statsDoc.exists) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Pricing system not initialized"
      );
    }

    const globalStats = statsDoc.data() as GlobalStats;

    // 現在の価格情報を取得
    const currentPriceQuery = await db
      .collection("price_history")
      .where("priceId", "==", globalStats.currentPriceId)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (currentPriceQuery.empty) {
      throw new functions.https.HttpsError(
        "not-found",
        "Current price information not found"
      );
    }

    const currentPrice = currentPriceQuery.docs[0].data() as PriceHistoryRecord;

    // 次のティアの情報を計算
    let nextTierInfo: { amount: number; remainingUsers: number } | null = null;
    
    if (!isMaxPriceReached(currentPrice.amount)) {
      const remainingUsers = Math.max(0, currentPrice.maxSubscribers - globalStats.peakSubscribers);
      const nextTierAmount = calculatePriceForSubscribers(currentPrice.maxSubscribers + 1);
      
      nextTierInfo = {
        amount: nextTierAmount,
        remainingUsers: remainingUsers,
      };
    }

    const response: CurrentPricingResponse = {
      globalStats,
      currentPrice,
      nextTierInfo,
    };

    return {
      success: true,
      data: response,
    };

  } catch (error: any) {
    console.error("Failed to get current pricing:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get pricing information: ${error.message}`
    );
  }
});

/**
 * 価格履歴を取得（管理者用）
 */
export const getPriceHistory = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { limit = 10 } = data;

  try {
    const priceHistorySnapshot = await db
      .collection("price_history")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const priceHistory = priceHistorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      priceHistory,
    };

  } catch (error: any) {
    console.error("Failed to get price history:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get price history: ${error.message}`
    );
  }
});

/**
 * 価格統計情報を取得（ダッシュボード用）
 */
export const getPricingStats = functions.https.onCall(async (data, context) => {
  try {
    // stats/global を取得
    const statsDoc = await db.collection("stats").doc("global").get();
    
    if (!statsDoc.exists) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Pricing system not initialized"
      );
    }

    const globalStats = statsDoc.data() as GlobalStats;

    // アクティブサブスクリプション数の実際値を取得
    const activeSubscriptionsSnapshot = await db
      .collection("subscriptions")
      .where("status", "==", "active")
      .get();

    const actualActiveSubscriptions = activeSubscriptionsSnapshot.size;

    // 過去30日間の加入者推移を取得（実装は簡略化）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSubscriptionsSnapshot = await db
      .collection("subscriptions")
      .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .orderBy("createdAt", "desc")
      .get();

    // 統計情報をまとめる
    const stats = {
      currentSubscribers: globalStats.currentSubscribers,
      peakSubscribers: globalStats.peakSubscribers,
      actualActiveSubscriptions,
      recentGrowth: recentSubscriptionsSnapshot.size,
      currentPriceId: globalStats.currentPriceId,
      lastUpdated: globalStats.lastUpdated,
      systemStatus: {
        dataConsistency: globalStats.currentSubscribers === actualActiveSubscriptions,
        priceSystemActive: true,
      },
    };

    return {
      success: true,
      stats,
    };

  } catch (error: any) {
    console.error("Failed to get pricing stats:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get pricing stats: ${error.message}`
    );
  }
});