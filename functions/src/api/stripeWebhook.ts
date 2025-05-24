import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

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
 * サブスクリプション作成処理
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const planId = subscription.metadata.planId;

  if (!userId || !planId) {
    throw new Error("Missing userId or planId in subscription metadata");
  }

  // サブスクリプション情報をFirestoreに保存
  await db.collection("subscriptions").add({
    userId: userId,
    planId: planId,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
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

  // ユーザーの現在のプランを更新
  await db.collection("users").doc(userId).update({
    "currentPlan.planId": planId,
    "currentPlan.status": "active",
    "currentPlan.subscriptionId": subscription.id,
    updatedAt: admin.firestore.Timestamp.now(),
  });

  // カスタムクレームを更新
  await admin.auth().setCustomUserClaims(userId, {
    planId: planId,
  });

  console.log(`Subscription created for user ${userId}, plan ${planId}`);
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
 * サブスクリプション削除処理
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

  // ユーザーをFreeプランに戻す
  await db.collection("users").doc(userId).update({
    "currentPlan.planId": "free",
    "currentPlan.status": "active",
    "currentPlan.subscriptionId": null,
    updatedAt: admin.firestore.Timestamp.now(),
  });

  // カスタムクレームを更新
  await admin.auth().setCustomUserClaims(userId, {
    planId: "free",
  });

  console.log(`Subscription canceled for user ${userId}, reverted to free plan`);
}

/**
 * 支払い成功処理
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
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
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: "succeeded",
    planId: planId,
    description: `${planId} plan subscription payment`,
    createdAt: admin.firestore.Timestamp.now(),
  });

  // 使用量をリセット（月次課金の場合）
  await db.collection("users").doc(userId).update({
    "usage.monthlyPostCount": 0,
    "usage.lastResetDate": admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  });

  console.log(`Payment succeeded for user ${userId}, amount: ${invoice.amount_paid}`);
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