import * as admin from "firebase-admin";

const db = admin.firestore();

// プラン制限の型定義
export interface PlanLimits {
  instagramAccountLimit: number; // -1 = 無制限
  monthlyPostLimit: number; // -1 = 無制限
  scheduledPosts: boolean;
  recurringPosts: boolean;
  randomPosts: boolean;
  proxySupport: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

// 使用量の型定義
export interface Usage {
  instagramAccountCount: number;
  monthlyPostCount: number;
  lastResetDate: admin.firestore.Timestamp;
}

/**
 * ユーザーの現在のプラン制限を取得
 */
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  try {
    // ユーザー情報を取得
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data()!;
    const planId = userData.currentPlan?.planId || "free";

    // プラン情報を取得
    const planDoc = await db.collection("plans").doc(planId).get();
    
    if (!planDoc.exists) {
      // デフォルトでFreeプランの制限を返す
      return {
        instagramAccountLimit: 1,
        monthlyPostLimit: 10,
        scheduledPosts: true,
        recurringPosts: false,
        randomPosts: false,
        proxySupport: false,
        prioritySupport: false,
        apiAccess: false,
      };
    }

    const planData = planDoc.data()!;
    return planData.features as PlanLimits;

  } catch (error) {
    console.error("Failed to get user plan limits:", error);
    throw error;
  }
}

/**
 * ユーザーの現在の使用量を取得
 */
export async function getUserUsage(userId: string): Promise<Usage> {
  try {
    // ユーザー情報を取得
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      throw new Error("User not found");
    }

    const userData = userDoc.data()!;
    
    // Instagramアカウント数を取得
    const igAccountsSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("igAccounts")
      .get();

    const instagramAccountCount = igAccountsSnapshot.size;

    // 月間投稿数を取得（使用量リセット日をチェック）
    const usage = userData.usage || {};
    const lastResetDate = usage.lastResetDate || admin.firestore.Timestamp.now();
    const monthlyPostCount = usage.monthlyPostCount || 0;

    // 月が変わっている場合はリセット
    const now = new Date();
    const resetDate = lastResetDate.toDate();
    const shouldReset = now.getMonth() !== resetDate.getMonth() || 
                       now.getFullYear() !== resetDate.getFullYear();

    if (shouldReset) {
      // 使用量をリセット
      await db.collection("users").doc(userId).update({
        "usage.monthlyPostCount": 0,
        "usage.lastResetDate": admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });

      return {
        instagramAccountCount,
        monthlyPostCount: 0,
        lastResetDate: admin.firestore.Timestamp.now(),
      };
    }

    return {
      instagramAccountCount,
      monthlyPostCount,
      lastResetDate,
    };

  } catch (error) {
    console.error("Failed to get user usage:", error);
    throw error;
  }
}

/**
 * Instagramアカウント追加可能かチェック
 */
export async function canAddInstagramAccount(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount: number;
  limit: number;
}> {
  try {
    const [limits, usage] = await Promise.all([
      getUserPlanLimits(userId),
      getUserUsage(userId)
    ]);

    const allowed = limits.instagramAccountLimit === -1 || 
                   usage.instagramAccountCount < limits.instagramAccountLimit;

    return {
      allowed,
      reason: allowed ? undefined : "Instagram account limit reached",
      currentCount: usage.instagramAccountCount,
      limit: limits.instagramAccountLimit,
    };

  } catch (error) {
    console.error("Failed to check Instagram account limit:", error);
    return {
      allowed: false,
      reason: "Failed to check account limit",
      currentCount: 0,
      limit: 0,
    };
  }
}

/**
 * 投稿実行可能かチェック
 */
export async function canExecutePost(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentCount: number;
  limit: number;
}> {
  try {
    const [limits, usage] = await Promise.all([
      getUserPlanLimits(userId),
      getUserUsage(userId)
    ]);

    const allowed = limits.monthlyPostLimit === -1 || 
                   usage.monthlyPostCount < limits.monthlyPostLimit;

    return {
      allowed,
      reason: allowed ? undefined : "Monthly post limit reached",
      currentCount: usage.monthlyPostCount,
      limit: limits.monthlyPostLimit,
    };

  } catch (error) {
    console.error("Failed to check post limit:", error);
    return {
      allowed: false,
      reason: "Failed to check post limit",
      currentCount: 0,
      limit: 0,
    };
  }
}

/**
 * スケジュール作成可能かチェック
 */
export async function canCreateSchedule(
  userId: string, 
  scheduleType: "one-time" | "recurring" | "random"
): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  try {
    const limits = await getUserPlanLimits(userId);

    // 基本的な予約投稿機能チェック
    if (!limits.scheduledPosts) {
      return {
        allowed: false,
        reason: "Scheduled posts not available in current plan",
      };
    }

    // 繰り返し投稿チェック
    if (scheduleType === "recurring" && !limits.recurringPosts) {
      return {
        allowed: false,
        reason: "Recurring posts not available in current plan",
      };
    }

    // ランダム投稿チェック
    if (scheduleType === "random" && !limits.randomPosts) {
      return {
        allowed: false,
        reason: "Random posts not available in current plan",
      };
    }

    return { allowed: true };

  } catch (error) {
    console.error("Failed to check schedule creation:", error);
    return {
      allowed: false,
      reason: "Failed to check schedule creation permissions",
    };
  }
}

/**
 * 投稿実行後の使用量更新
 */
export async function incrementPostUsage(userId: string): Promise<void> {
  try {
    const userRef = db.collection("users").doc(userId);
    
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const userData = userDoc.data()!;
      const currentCount = userData.usage?.monthlyPostCount || 0;

      transaction.update(userRef, {
        "usage.monthlyPostCount": currentCount + 1,
        updatedAt: admin.firestore.Timestamp.now(),
      });
    });

    console.log(`Post usage incremented for user ${userId}`);

  } catch (error) {
    console.error("Failed to increment post usage:", error);
    throw error;
  }
}

/**
 * プラン機能の利用可能性チェック
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof PlanLimits
): Promise<boolean> {
  try {
    const limits = await getUserPlanLimits(userId);
    
    if (typeof limits[feature] === "boolean") {
      return limits[feature] as boolean;
    }
    
    // 数値制限の場合は-1（無制限）または正の値をチェック
    if (typeof limits[feature] === "number") {
      return (limits[feature] as number) !== 0;
    }

    return false;

  } catch (error) {
    console.error("Failed to check feature access:", error);
    return false;
  }
} 