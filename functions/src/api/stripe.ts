import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { GlobalStats, CheckoutMetadata } from "../types/pricing";
import { PRICING_CONFIG, calculatePriceForSubscribers, generateLookupKey } from "../config/pricing";

const db = admin.firestore();

// Stripe初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

/**
 * Stripe Checkout セッション作成
 */
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { successUrl, cancelUrl } = data;
  const userId = context.auth.uid;

  if (!successUrl || !cancelUrl) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "successUrl and cancelUrl are required"
    );
  }

  try {
    // グローバル統計を取得して現在の価格を決定
    const statsDoc = await db.collection("stats").doc("global").get();
    
    if (!statsDoc.exists) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "System not initialized. Please run initialization scripts."
      );
    }

    const stats = statsDoc.data() as GlobalStats;
    const currentPriceId = stats.currentPriceId;
    
    // 価格履歴から現在の価格情報を取得
    const priceHistoryQuery = await db
      .collection("price_history")
      .where("priceId", "==", currentPriceId)
      .where("isActive", "==", true)
      .limit(1)
      .get();
      
    if (priceHistoryQuery.empty) {
      throw new functions.https.HttpsError(
        "not-found",
        "Current price configuration not found"
      );
    }

    const priceRecord = priceHistoryQuery.docs[0].data();

    // ユーザー情報を取得
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data()!;

    // Stripeカスタマーを取得または作成
    let customerId = userData.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.profile.email,
        metadata: {
          userId: userId,
        },
      });
      
      customerId = customer.id;
      
      // ユーザードキュメントにカスタマーIDを保存
      await db.collection("users").doc(userId).update({
        stripeCustomerId: customerId,
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }

    // Checkout メタデータを準備
    const checkoutMetadata: CheckoutMetadata = {
      priceLookupKey: priceRecord.lookupKey,
      peakSubscribersAtCheckout: stats.peakSubscribers,
      checkoutTimestamp: new Date().toISOString(),
    };

    // Checkout セッション作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: currentPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        priceLookupKey: checkoutMetadata.priceLookupKey,
        peakSubscribersAtCheckout: checkoutMetadata.peakSubscribersAtCheckout.toString(),
        checkoutTimestamp: checkoutMetadata.checkoutTimestamp,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          priceLookupKey: checkoutMetadata.priceLookupKey,
          originalPrice: priceRecord.amount.toString(),
        },
      },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };

  } catch (error: any) {
    console.error("Failed to create checkout session:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to create checkout session: ${error.message}`
    );
  }
});

/**
 * サブスクリプション情報取得
 */
export const getSubscription = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const userId = context.auth.uid;

  try {
    // サブスクリプション情報を取得
    const subscriptionDoc = await db
      .collection("subscriptions")
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (subscriptionDoc.empty) {
      // Freeプランとして返す
      return {
        success: true,
        subscription: {
          planId: "free",
          priceTier: "tier_000",
          status: "active",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          originalPrice: 0,
          isGrandfathered: false,
        },
      };
    }

    const subscription = subscriptionDoc.docs[0].data();

    return {
      success: true,
      subscription: {
        planId: subscription.planId || "legacy",
        priceTier: subscription.priceTier || "unknown",
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        originalPrice: subscription.originalPrice || 0,
        isGrandfathered: subscription.isGrandfathered || false,
      },
    };

  } catch (error: any) {
    console.error("Failed to get subscription:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get subscription: ${error.message}`
    );
  }
});

/**
 * サブスクリプションキャンセル
 */
export const cancelSubscription = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const userId = context.auth.uid;

  try {
    // アクティブなサブスクリプションを取得
    const subscriptionQuery = await db
      .collection("subscriptions")
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (subscriptionQuery.empty) {
      throw new functions.https.HttpsError(
        "not-found",
        "Active subscription not found"
      );
    }

    const subscriptionDoc = subscriptionQuery.docs[0];
    const subscription = subscriptionDoc.data();

    // Stripeでサブスクリプションを期間終了時にキャンセル
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Firestoreを更新
    await subscriptionDoc.ref.update({
      cancelAtPeriodEnd: true,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      message: "Subscription will be canceled at the end of the current period",
    };

  } catch (error: any) {
    console.error("Failed to cancel subscription:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to cancel subscription: ${error.message}`
    );
  }
});

/**
 * サブスクリプション再開
 */
export const resumeSubscription = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const userId = context.auth.uid;

  try {
    // キャンセル予定のサブスクリプションを取得
    const subscriptionQuery = await db
      .collection("subscriptions")
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .where("cancelAtPeriodEnd", "==", true)
      .limit(1)
      .get();

    if (subscriptionQuery.empty) {
      throw new functions.https.HttpsError(
        "not-found",
        "Cancelable subscription not found"
      );
    }

    const subscriptionDoc = subscriptionQuery.docs[0];
    const subscription = subscriptionDoc.data();

    // Stripeでキャンセルを取り消し
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Firestoreを更新
    await subscriptionDoc.ref.update({
      cancelAtPeriodEnd: false,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      message: "Subscription cancellation has been reversed",
    };

  } catch (error: any) {
    console.error("Failed to resume subscription:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to resume subscription: ${error.message}`
    );
  }
});

/**
 * 決済履歴取得
 */
export const getPaymentHistory = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const userId = context.auth.uid;
  const { limit = 10, startAfter } = data;

  try {
    let query = db
      .collection("paymentHistory")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const snapshot = await query.get();
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      payments: payments,
      hasMore: snapshot.docs.length === limit,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
    };

  } catch (error: any) {
    console.error("Failed to get payment history:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get payment history: ${error.message}`
    );
  }
});

/**
 * プラン一覧取得
 */
export const getPlans = functions.https.onCall(async (data, context) => {
  try {
    const plansSnapshot = await db
      .collection("plans")
      .where("isActive", "==", true)
      .orderBy("price", "asc")
      .get();

    const plans = plansSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      plans: plans,
    };

  } catch (error: any) {
    console.error("Failed to get plans:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get plans: ${error.message}`
    );
  }
}); 