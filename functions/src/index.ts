import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Firebase Admin SDK初期化
admin.initializeApp();

// Firestore参照
export const db = admin.firestore();

// Posts API
export {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from "./api/posts";

// Instagram Accounts API
export {
  getInstagramUserInfo,
  addInstagramAccount,
  getInstagramAccounts,
  deleteInstagramAccount,
  refreshInstagramToken,
} from "./api/igAccounts";

// Schedules API
export {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
} from "./api/schedules";

// Instagram API
export {
  postToInstagram,
  checkInstagramPostStatus,
  deleteInstagramPost,
} from "./api/instagram";

// Schedulers
export {
  executeScheduledPosts,
  triggerScheduleExecution,
  getExecutionLogs,
} from "./schedulers/postExecutor";

// Notifications
export {
  updateNotificationSettings,
  registerFCMToken,
  getInAppNotifications,
  markNotificationAsRead,
} from "./utils/notifications";

// Authentication
export {
  setCustomClaims,
  updateUserClaims,
  resendEmailVerification,
  sendPasswordResetEmail,
  disableUser,
  enableUser,
  updateUserSession,
  getUserInfo,
} from "./api/auth";

// Stripe Payment
export {
  createCheckoutSession,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  getPaymentHistory,
  getPlans,
} from "./api/stripe";

// Stripe Webhook
export {
  stripeWebhook,
} from "./api/stripeWebhook";

// Plan Limits
export {
  getUserLimitsAndUsage,
  checkInstagramAccountLimit,
  checkPostExecutionLimit,
  checkDailyPostLimitForAccount,
  checkScheduleCreationLimit,
  checkFeatureAvailability,
  incrementUserPostUsage,
  incrementUserPostUsageForAccount,
} from "./api/planLimits";

// 基本的なヘルスチェック関数
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Omniy Cloud Functions is running",
  });
});

// 認証が必要なテスト関数
export const authTest = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const uid = context.auth.uid;
  const email = context.auth.token.email;

  return {
    message: "Authentication successful",
    uid: uid,
    email: email,
    timestamp: new Date().toISOString(),
  };
});

// ユーザー作成時のトリガー関数
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    // ユーザードキュメントの初期化
    await db.collection("users").doc(user.uid).set({
      profile: {
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
      },
      currentPlan: {
        planId: "free",
        status: "active",
        instagramAccountLimit: 1,
        monthlyPostLimit: 10,
      },
      settings: {
        timeZone: "Asia/Tokyo",
        notifications: {
          email: true,
          postSuccess: true,
          postFailure: true,
        },
      },
      usage: {
        monthlyPostCount: 0,
        lastResetDate: admin.firestore.FieldValue.serverTimestamp(),
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`User document created for ${user.uid}`);
  } catch (error) {
    console.error("Error creating user document:", error);
  }
});

// ユーザー削除時のクリーンアップ関数
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  try {
    const batch = db.batch();

    // ユーザードキュメントの削除
    const userRef = db.collection("users").doc(user.uid);
    batch.delete(userRef);

    // サブコレクションの削除（IGアカウント、投稿など）
    const igAccountsSnapshot = await db
      .collection("users")
      .doc(user.uid)
      .collection("igAccounts")
      .get();

    igAccountsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 投稿コンテンツの削除
    const postsSnapshot = await db
      .collection("posts")
      .where("ownerUid", "==", user.uid)
      .get();

    postsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`User data cleaned up for ${user.uid}`);
  } catch (error) {
    console.error("Error cleaning up user data:", error);
  }
});

// 開発用：Firestoreデータ取得テスト
export const testFirestore = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  try {
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    
    if (!userDoc.exists) {
      return {
        message: "User document not found",
        uid: context.auth.uid,
      };
    }

    return {
      message: "Firestore access successful",
      userData: userDoc.data(),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Firestore test error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to access Firestore"
    );
  }
});

// TODO: Sprint 1で実装予定の関数をコメントアウトで記載
/*
// Instagram アカウント管理
export const addInstagramAccount = functions.https.onCall(async (data, context) => {
  // T06: IGアカウント登録・管理API
});

// 投稿スケジュール管理
export const createSchedule = functions.https.onCall(async (data, context) => {
  // T01: schedules CRUD API
});

// 自動投稿実行
export const executeScheduledPosts = functions.pubsub.schedule("every 1 minutes").onRun(async (context) => {
  // T07: 自動投稿Worker
});

// Instagram Graph API投稿
export const postToInstagram = functions.https.onCall(async (data, context) => {
  // T08: IG Graph API投稿処理
});

// Stripe決済処理
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  // T11: Stripe Checkout
});

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  // T11: Stripe Webhook処理
});
*/ 