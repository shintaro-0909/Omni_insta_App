import * as functions from "firebase-functions";
import {
  getUserPlanLimits,
  getUserUsage,
  canAddInstagramAccount,
  canExecutePost,
  canExecutePostForAccount,
  canCreateSchedule,
  checkFeatureAccess,
  incrementPostUsage,
  incrementPostUsageForAccount,
} from "../utils/planLimits";

/**
 * ユーザーの使用量と制限情報を取得
 */
export const getUserLimitsAndUsage = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const userId = context.auth.uid;

  try {
    const [limits, usage] = await Promise.all([
      getUserPlanLimits(userId),
      getUserUsage(userId)
    ]);

    return {
      success: true,
      limits,
      usage,
      percentages: {
        instagramAccounts: limits.instagramAccountLimit === -1 
          ? 0 
          : Math.round((usage.instagramAccountCount / limits.instagramAccountLimit) * 100),
        monthlyPosts: limits.monthlyPostLimit === -1 
          ? 0 
          : Math.round((usage.monthlyPostCount / limits.monthlyPostLimit) * 100),
      },
    };

  } catch (error: any) {
    console.error("Failed to get user limits and usage:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to get limits and usage: ${error.message}`
    );
  }
});

/**
 * Instagramアカウント追加可能性チェック
 */
export const checkInstagramAccountLimit = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const userId = context.auth.uid;

  try {
    const result = await canAddInstagramAccount(userId);

    return {
      success: true,
      ...result,
    };

  } catch (error: any) {
    console.error("Failed to check Instagram account limit:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to check account limit: ${error.message}`
    );
  }
});

/**
 * 投稿実行可能性チェック
 */
export const checkPostExecutionLimit = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const userId = context.auth.uid;

  try {
    const result = await canExecutePost(userId);

    return {
      success: true,
      ...result,
    };

  } catch (error: any) {
    console.error("Failed to check post execution limit:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to check post limit: ${error.message}`
    );
  }
});

/**
 * スケジュール作成可能性チェック
 */
export const checkScheduleCreationLimit = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { scheduleType } = data;
  const userId = context.auth.uid;

  if (!scheduleType || !["one-time", "recurring", "random"].includes(scheduleType)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Valid scheduleType is required (one-time, recurring, random)"
    );
  }

  try {
    const result = await canCreateSchedule(userId, scheduleType);

    return {
      success: true,
      ...result,
    };

  } catch (error: any) {
    console.error("Failed to check schedule creation limit:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to check schedule creation: ${error.message}`
    );
  }
});

/**
 * 機能アクセス権限チェック
 */
export const checkFeatureAvailability = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { feature } = data;
  const userId = context.auth.uid;

  if (!feature) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Feature name is required"
    );
  }

  try {
    const available = await checkFeatureAccess(userId, feature);

    return {
      success: true,
      feature,
      available,
    };

  } catch (error: any) {
    console.error("Failed to check feature availability:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to check feature availability: ${error.message}`
    );
  }
});

/**
 * IGアカウント別日次投稿制限チェック
 */
export const checkDailyPostLimitForAccount = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { igAccountId } = data;
  const userId = context.auth.uid;

  if (!igAccountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Instagram account ID is required"
    );
  }

  try {
    const result = await canExecutePostForAccount(userId, igAccountId);

    return {
      success: true,
      ...result,
    };

  } catch (error: any) {
    console.error("Failed to check daily post limit for account:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to check daily post limit: ${error.message}`
    );
  }
});

/**
 * 投稿使用量を増加（内部使用）
 */
export const incrementUserPostUsage = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const userId = context.auth.uid;

  try {
    await incrementPostUsage(userId);

    return {
      success: true,
      message: "Post usage incremented successfully",
    };

  } catch (error: any) {
    console.error("Failed to increment post usage:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to increment post usage: ${error.message}`
    );
  }
});

/**
 * IGアカウント別投稿使用量を増加（内部使用）
 */
export const incrementUserPostUsageForAccount = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { igAccountId } = data;
  const userId = context.auth.uid;

  if (!igAccountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Instagram account ID is required"
    );
  }

  try {
    await incrementPostUsageForAccount(userId, igAccountId);

    return {
      success: true,
      message: "Post usage incremented successfully for account",
    };

  } catch (error: any) {
    console.error("Failed to increment post usage for account:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to increment post usage for account: ${error.message}`
    );
  }
}); 