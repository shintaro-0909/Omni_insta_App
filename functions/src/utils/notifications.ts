import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// 通知タイプの定義
export type NotificationType = "post_success" | "post_failure" | "token_expiring" | "plan_limit_reached";

// 通知データの型定義
export interface NotificationData {
  type: NotificationType;
  userId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
}

// 通知チャンネルの型定義
export type NotificationChannel = "email" | "push" | "webhook" | "in_app";

// 通知設定の型定義
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  webhook?: {
    enabled: boolean;
    url: string;
    secret?: string;
  };
  postSuccess: boolean;
  postFailure: boolean;
  tokenExpiring: boolean;
  planLimitReached: boolean;
}

/**
 * ユーザーの通知設定を取得
 */
async function getUserNotificationSettings(userId: string): Promise<NotificationSettings> {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      // デフォルト設定を返す
      return {
        email: true,
        push: true,
        postSuccess: true,
        postFailure: true,
        tokenExpiring: true,
        planLimitReached: true,
      };
    }

    const userData = userDoc.data()!;
    const settings = userData.settings?.notifications || {};

    return {
      email: settings.email !== false,
      push: settings.push !== false,
      webhook: settings.webhook,
      postSuccess: settings.postSuccess !== false,
      postFailure: settings.postFailure !== false,
      tokenExpiring: settings.tokenExpiring !== false,
      planLimitReached: settings.planLimitReached !== false,
    };
  } catch (error) {
    console.error("Failed to get notification settings:", error);
    // エラー時はデフォルト設定を返す
    return {
      email: true,
      push: true,
      postSuccess: true,
      postFailure: true,
      tokenExpiring: true,
      planLimitReached: true,
    };
  }
}

/**
 * メール通知を送信
 */
async function sendEmailNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    // ユーザー情報を取得
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data()!;
    const email = userData.profile?.email;

    if (!email) {
      console.warn(`No email address found for user ${userId}`);
      return;
    }

    // メール送信ログを記録（実際のメール送信は外部サービスを使用）
    await db.collection("emailLogs").add({
      userId: userId,
      email: email,
      title: title,
      message: message,
      data: data || {},
      status: "pending",
      createdAt: admin.firestore.Timestamp.now(),
    });

    console.log(`Email notification queued for ${email}: ${title}`);

    // TODO: 実際のメール送信処理（SendGrid、AWS SES等を使用）
    // await sendEmailViaSendGrid(email, title, message, data);

  } catch (error) {
    console.error("Failed to send email notification:", error);
  }
}

/**
 * プッシュ通知を送信
 */
async function sendPushNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    // ユーザーのFCMトークンを取得
    const tokensSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("fcmTokens")
      .where("active", "==", true)
      .get();

    if (tokensSnapshot.empty) {
      console.warn(`No FCM tokens found for user ${userId}`);
      return;
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    // プッシュ通知を送信
    const payload = {
      notification: {
        title: title,
        body: message,
      },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ) : {},
    };

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: payload.notification,
      data: payload.data
    });

    // 無効なトークンを削除
    const invalidTokens: string[] = [];
    response.responses.forEach((result: any, index: number) => {
      if (result.error) {
        const errorCode = result.error.code;
        if (errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered") {
          invalidTokens.push(tokens[index]);
        }
      }
    });

    // 無効なトークンを削除
    if (invalidTokens.length > 0) {
      const batch = db.batch();
      for (const token of invalidTokens) {
        const tokenQuery = await db
          .collection("users")
          .doc(userId)
          .collection("fcmTokens")
          .where("token", "==", token)
          .get();
        
        tokenQuery.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      }
      await batch.commit();
    }

    console.log(`Push notification sent to ${tokens.length} devices for user ${userId}`);

  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
}

/**
 * Webhook通知を送信
 */
async function sendWebhookNotification(
  webhookConfig: { url: string; secret?: string },
  notificationData: NotificationData
): Promise<void> {
  try {
    const axios = require("axios");
    const crypto = require("crypto");

    const payload = {
      type: notificationData.type,
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      timestamp: new Date().toISOString(),
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Omniy-Webhook/1.0",
    };

    // シークレットが設定されている場合は署名を追加
    if (webhookConfig.secret) {
      const signature = crypto
        .createHmac("sha256", webhookConfig.secret)
        .update(JSON.stringify(payload))
        .digest("hex");
      headers["X-Omniy-Signature"] = `sha256=${signature}`;
    }

    const response = await axios.post(webhookConfig.url, payload, {
      headers: headers,
      timeout: 10000, // 10秒タイムアウト
    });

    console.log(`Webhook notification sent to ${webhookConfig.url}, status: ${response.status}`);

  } catch (error: any) {
    console.error("Failed to send webhook notification:", error.message);
  }
}

/**
 * アプリ内通知を作成
 */
async function createInAppNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    await db.collection("users").doc(userId).collection("notifications").add({
      title: title,
      message: message,
      data: data || {},
      read: false,
      createdAt: admin.firestore.Timestamp.now(),
    });

    console.log(`In-app notification created for user ${userId}`);

  } catch (error) {
    console.error("Failed to create in-app notification:", error);
  }
}

/**
 * 通知を送信するメイン関数
 */
export async function sendNotification(notificationData: NotificationData): Promise<void> {
  try {
    const { userId, type, title, message, data, channels } = notificationData;

    // ユーザーの通知設定を取得
    const settings = await getUserNotificationSettings(userId);

    // 通知タイプが有効かチェック
    const isTypeEnabled = (() => {
      switch (type) {
        case "post_success":
          return settings.postSuccess;
        case "post_failure":
          return settings.postFailure;
        case "token_expiring":
          return settings.tokenExpiring;
        case "plan_limit_reached":
          return settings.planLimitReached;
        default:
          return true;
      }
    })();

    if (!isTypeEnabled) {
      console.log(`Notification type ${type} is disabled for user ${userId}`);
      return;
    }

    // 各チャンネルで通知を送信
    const promises: Promise<void>[] = [];

    if (channels.includes("email") && settings.email) {
      promises.push(sendEmailNotification(userId, title, message, data));
    }

    if (channels.includes("push") && settings.push) {
      promises.push(sendPushNotification(userId, title, message, data));
    }

    if (channels.includes("webhook") && settings.webhook?.enabled && settings.webhook.url) {
      promises.push(sendWebhookNotification(settings.webhook, notificationData));
    }

    if (channels.includes("in_app")) {
      promises.push(createInAppNotification(userId, title, message, data));
    }

    await Promise.allSettled(promises);

    console.log(`Notification sent to user ${userId} via ${channels.join(", ")}`);

  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}

/**
 * 投稿成功通知
 */
export async function sendPostSuccessNotification(
  userId: string,
  scheduleTitle: string,
  instagramPostId: string,
  igAccountUsername: string
): Promise<void> {
  const notificationData: NotificationData = {
    type: "post_success",
    userId: userId,
    title: "投稿が完了しました",
    message: `「${scheduleTitle}」がInstagramに投稿されました（@${igAccountUsername}）`,
    data: {
      scheduleTitle: scheduleTitle,
      instagramPostId: instagramPostId,
      igAccountUsername: igAccountUsername,
    },
    channels: ["email", "push", "in_app"],
  };

  await sendNotification(notificationData);
}

/**
 * 投稿失敗通知
 */
export async function sendPostFailureNotification(
  userId: string,
  scheduleTitle: string,
  errorMessage: string,
  igAccountUsername: string,
  retryCount: number
): Promise<void> {
  const isRetrying = retryCount < 3;
  const title = isRetrying ? "投稿に失敗しました（リトライ中）" : "投稿に失敗しました";
  const message = isRetrying
    ? `「${scheduleTitle}」の投稿に失敗しました。自動でリトライします（@${igAccountUsername}）`
    : `「${scheduleTitle}」の投稿に失敗しました。手動で確認してください（@${igAccountUsername}）`;

  const notificationData: NotificationData = {
    type: "post_failure",
    userId: userId,
    title: title,
    message: message,
    data: {
      scheduleTitle: scheduleTitle,
      errorMessage: errorMessage,
      igAccountUsername: igAccountUsername,
      retryCount: retryCount,
      isRetrying: isRetrying,
    },
    channels: ["email", "push", "in_app"],
  };

  await sendNotification(notificationData);
}

/**
 * トークン期限切れ間近通知
 */
export async function sendTokenExpiringNotification(
  userId: string,
  igAccountUsername: string,
  expiresAt: Date
): Promise<void> {
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const notificationData: NotificationData = {
    type: "token_expiring",
    userId: userId,
    title: "アクセストークンの期限が近づいています",
    message: `@${igAccountUsername}のアクセストークンが${daysUntilExpiry}日後に期限切れになります。更新してください。`,
    data: {
      igAccountUsername: igAccountUsername,
      expiresAt: expiresAt.toISOString(),
      daysUntilExpiry: daysUntilExpiry,
    },
    channels: ["email", "push", "in_app"],
  };

  await sendNotification(notificationData);
}

/**
 * プラン制限到達通知
 */
export async function sendPlanLimitReachedNotification(
  userId: string,
  currentPlan: string,
  limitType: "posts" | "accounts",
  currentUsage: number,
  limit: number
): Promise<void> {
  const limitTypeText = limitType === "posts" ? "月間投稿数" : "アカウント数";
  
  const notificationData: NotificationData = {
    type: "plan_limit_reached",
    userId: userId,
    title: "プラン制限に達しました",
    message: `${currentPlan}プランの${limitTypeText}制限（${limit}）に達しました。プランのアップグレードを検討してください。`,
    data: {
      currentPlan: currentPlan,
      limitType: limitType,
      currentUsage: currentUsage,
      limit: limit,
    },
    channels: ["email", "push", "in_app"],
  };

  await sendNotification(notificationData);
}

/**
 * 通知設定を更新
 */
export const updateNotificationSettings = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { settings } = data;

  if (!settings || typeof settings !== "object") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Valid settings object is required"
    );
  }

  try {
    await db.collection("users").doc(context.auth.uid).update({
      "settings.notifications": settings,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      message: "Notification settings updated successfully",
    };

  } catch (error: any) {
    console.error("Failed to update notification settings:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to update notification settings: ${error.message}`
    );
  }
});

/**
 * FCMトークンを登録
 */
export const registerFCMToken = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { token, deviceId } = data;

  if (!token || !deviceId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "token and deviceId are required"
    );
  }

  try {
    const tokenRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("fcmTokens")
      .doc(deviceId);

    await tokenRef.set({
      token: token,
      deviceId: deviceId,
      active: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      message: "FCM token registered successfully",
    };

  } catch (error: any) {
    console.error("Failed to register FCM token:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to register FCM token: ${error.message}`
    );
  }
});

/**
 * アプリ内通知を取得
 */
export const getInAppNotifications = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { limit = 20, lastNotificationId } = data;

  try {
    let query = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (lastNotificationId) {
      const lastNotificationDoc = await db
        .collection("users")
        .doc(context.auth.uid)
        .collection("notifications")
        .doc(lastNotificationId)
        .get();

      if (lastNotificationDoc.exists) {
        query = query.startAfter(lastNotificationDoc);
      }
    }

    const notificationsSnapshot = await query.get();

    const notifications = notificationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      notifications: notifications,
      hasMore: notificationsSnapshot.docs.length === limit,
      lastNotificationId: notificationsSnapshot.docs.length > 0 
        ? notificationsSnapshot.docs[notificationsSnapshot.docs.length - 1].id 
        : null,
    };

  } catch (error: any) {
    console.error("Failed to get in-app notifications:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get notifications: ${error.message}`
    );
  }
});

/**
 * 通知を既読にする
 */
export const markNotificationAsRead = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { notificationId } = data;

  if (!notificationId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "notificationId is required"
    );
  }

  try {
    await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("notifications")
      .doc(notificationId)
      .update({
        read: true,
        readAt: admin.firestore.Timestamp.now(),
      });

    return {
      success: true,
      message: "Notification marked as read",
    };

  } catch (error: any) {
    console.error("Failed to mark notification as read:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to mark notification as read: ${error.message}`
    );
  }
}); 