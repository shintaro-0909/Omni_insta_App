import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { GlobalStats } from "../types/pricing";
import { rotatePrice } from "../cron/rotatePrice";

const db = admin.firestore();

// Stripe初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Stripe Webhook処理
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    // Webhook署名を検証
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    // イベントタイプに応じて処理
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Webhook処理ログを記録
    await db.collection("stripeWebhookLogs").add({
      eventId: event.id,
      eventType: event.type,
      processed: true,
      createdAt: admin.firestore.Timestamp.now(),
    });

    res.status(200).send("Webhook processed successfully");

  } catch (error: any) {
    console.error("Webhook processing error:", error);

    // エラーログを記録
    await db.collection("stripeWebhookLogs").add({
      eventId: event.id,
      eventType: event.type,
      processed: false,
      error: error.message,
      createdAt: admin.firestore.Timestamp.now(),
    });

    res.status(500).send("Webhook processing failed");
  }
});

/**
 * Checkout完了処理（新システム）
 * 課金者数をカウントし、価格ローテーションをトリガー
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const priceLookupKey = session.metadata?.priceLookupKey;
  
  if (!userId) {
    throw new Error("Missing userId in checkout session metadata");
  }

  console.log(`🎉 Checkout completed for user ${userId}`);

  // stats/global の currentSubscribers をインクリメント
  await db.runTransaction(async (transaction) => {
    const statsRef = db.collection("stats").doc("global");
    const statsDoc = await transaction.get(statsRef);
    
    if (!statsDoc.exists) {
      throw new Error("stats/global document not found");
    }
    
    const stats = statsDoc.data() as GlobalStats;
    const newCurrentSubscribers = stats.currentSubscribers + 1;
    
    transaction.update(statsRef, {
      currentSubscribers: newCurrentSubscribers,
      lastUpdated: admin.firestore.Timestamp.now(),
    });
    
    console.log(`📊 Current subscribers: ${stats.currentSubscribers} → ${newCurrentSubscribers}`);
  });

  // 価格ローテーションをトリガー
  try {
    await rotatePrice();
    console.log(`🔄 Price rotation triggered after checkout completion`);
  } catch (error) {
    console.error("Price rotation failed after checkout:", error);
    // 価格ローテーションエラーでもCheckout処理は継続
  }
}

/**
 * サブスクリプション作成処理（更新版）
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const priceLookupKey = subscription.metadata.priceLookupKey;
  const originalPrice = subscription.metadata.originalPrice;

  if (!userId) {
    throw new Error("Missing userId in subscription metadata");
  }

  // 現在の価格情報を取得
  const priceId = subscription.items.data[0].price.id;
  const amount = subscription.items.data[0].price.unit_amount || 0;

  // サブスクリプション情報をFirestoreに保存（新フィールド追加）
  await db.collection("subscriptions").add({
    userId: userId,
    planId: "subscription", // 新システムでは固定値
    priceTier: priceLookupKey || "unknown",
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    status: subscription.status,
    originalPrice: parseInt(originalPrice || "0", 10),
    currentPrice: amount,
    isGrandfathered: true, // 新規契約時は全てGrandfathered価格
    currentPeriodStart: admin.firestore.Timestamp.fromDate(
      new Date(subscription.current_period_start * 1000)
    ),
    currentPeriodEnd: admin.firestore.Timestamp.fromDate(
      new Date(subscription.current_period_end * 1000)
    ),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  });

  // ユーザーの現在のプラン情報を更新
  await db.collection("users").doc(userId).update({
    "currentPlan.planId": "subscription",
    "currentPlan.priceTier": priceLookupKey || "unknown",
    "currentPlan.status": "active",
    "currentPlan.subscriptionId": subscription.id,
    "currentPlan.originalPrice": parseInt(originalPrice || "0", 10),
    "currentPlan.isGrandfathered": true,
    updatedAt: admin.firestore.Timestamp.now(),
  });

  // カスタムクレームを更新
  await admin.auth().setCustomUserClaims(userId, {
    planId: "subscription",
    priceTier: priceLookupKey || "unknown",
  });

  console.log(`Subscription created for user ${userId}, tier ${priceLookupKey}, price ${amount}`);
}

/**
 * サブスクリプション更新処理
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;

  if (!userId) {
    throw new Error("Missing userId in subscription metadata");
  }

  // 既存のサブスクリプションを更新
  const subscriptionQuery = await db
    .collection("subscriptions")
    .where("stripeSubscriptionId", "==", subscription.id)
    .limit(1)
    .get();

  if (!subscriptionQuery.empty) {
    const subscriptionDoc = subscriptionQuery.docs[0];
    
    await subscriptionDoc.ref.update({
      status: subscription.status,
      currentPeriodStart: admin.firestore.Timestamp.fromDate(
        new Date(subscription.current_period_start * 1000)
      ),
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(
        new Date(subscription.current_period_end * 1000)
      ),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    // ユーザーの現在のプラン状態を更新
    await db.collection("users").doc(userId).update({
      "currentPlan.status": subscription.status,
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }

  console.log(`Subscription updated for user ${userId}`);
}

/**
 * サブスクリプション削除処理（更新版）
 * 課金者数をデクリメント（注意: peakSubscribersは減算しない）
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;

  if (!userId) {
    throw new Error("Missing userId in subscription metadata");
  }

  // サブスクリプション状態を更新
  const subscriptionQuery = await db
    .collection("subscriptions")
    .where("stripeSubscriptionId", "==", subscription.id)
    .limit(1)
    .get();

  if (!subscriptionQuery.empty) {
    const subscriptionDoc = subscriptionQuery.docs[0];
    
    await subscriptionDoc.ref.update({
      status: "canceled",
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }

  // stats/global の currentSubscribers をデクリメント
  // 重要: peakSubscribers は絶対に減算しない（値下げ防止）
  await db.runTransaction(async (transaction) => {
    const statsRef = db.collection("stats").doc("global");
    const statsDoc = await transaction.get(statsRef);
    
    if (statsDoc.exists) {
      const stats = statsDoc.data() as GlobalStats;
      const newCurrentSubscribers = Math.max(0, stats.currentSubscribers - 1);
      
      transaction.update(statsRef, {
        currentSubscribers: newCurrentSubscribers,
        lastUpdated: admin.firestore.Timestamp.now(),
      });
      
      console.log(`📊 Current subscribers: ${stats.currentSubscribers} → ${newCurrentSubscribers} (peak: ${stats.peakSubscribers} unchanged)`);
    }
  });

  // ユーザーをFreeプランに戻す
  await db.collection("users").doc(userId).update({
    "currentPlan.planId": "free",
    "currentPlan.priceTier": "tier_000",
    "currentPlan.status": "active",
    "currentPlan.subscriptionId": null,
    "currentPlan.originalPrice": 0,
    "currentPlan.isGrandfathered": false,
    updatedAt: admin.firestore.Timestamp.now(),
  });

  // カスタムクレームを更新
  await admin.auth().setCustomUserClaims(userId, {
    planId: "free",
    priceTier: "tier_000",
  });

  console.log(`Subscription canceled for user ${userId}, reverted to free plan`);
}

/**
 * 支払い成功処理（更新版）
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = invoice.subscription as string;
  
  // サブスクリプション情報を取得
  const subscriptionData = await stripe.subscriptions.retrieve(subscription);
  const userId = subscriptionData.metadata.userId;
  const priceLookupKey = subscriptionData.metadata.priceLookupKey;

  if (!userId) {
    throw new Error("Missing userId in subscription metadata");
  }

  // 決済履歴を記録（新フィールド追加）
  await db.collection("paymentHistory").add({
    userId: userId,
    stripePaymentIntentId: invoice.payment_intent as string,
    stripeSubscriptionId: subscription,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: "succeeded",
    priceTier: priceLookupKey || "unknown",
    description: `Subscription payment for ${priceLookupKey || 'unknown tier'}`,
    isGrandfatheredPayment: true, // 全てGrandfathered価格での支払い
    createdAt: admin.firestore.Timestamp.now(),
  });

  // 使用量をリセット（月次課金の場合）
  await db.collection("users").doc(userId).update({
    "usage.monthlyPostCount": 0,
    "usage.lastResetDate": admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  });

  console.log(`Payment succeeded for user ${userId}, amount: ${invoice.amount_paid}, tier: ${priceLookupKey}`);
}

/**
 * 支払い失敗処理
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = invoice.subscription as string;
  
  // サブスクリプション情報を取得
  const subscriptionData = await stripe.subscriptions.retrieve(subscription);
  const userId = subscriptionData.metadata.userId;
  const planId = subscriptionData.metadata.planId;

  if (!userId || !planId) {
    throw new Error("Missing userId or planId in subscription metadata");
  }

  // 決済履歴を記録
  await db.collection("paymentHistory").add({
    userId: userId,
    stripePaymentIntentId: invoice.payment_intent as string,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: "failed",
    planId: planId,
    description: `${planId} plan subscription payment failed`,
    createdAt: admin.firestore.Timestamp.now(),
  });

  // 通知を送信（支払い失敗）
  await db.collection("notifications").add({
    userId: userId,
    type: "payment_failed",
    title: "決済に失敗しました",
    message: "サブスクリプションの決済に失敗しました。決済方法を確認してください。",
    read: false,
    createdAt: admin.firestore.Timestamp.now(),
  });

  console.log(`Payment failed for user ${userId}, amount: ${invoice.amount_due}`);
} 