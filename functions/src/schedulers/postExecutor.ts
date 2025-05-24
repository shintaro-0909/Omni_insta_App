import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import { postToInstagram } from "../api/instagram"; // 直接実装のため未使用
import { updateNextRunAfterExecution } from "../utils/scheduleUtils";
import { sendPostSuccessNotification, sendPostFailureNotification } from "../utils/notifications";
import { proxyFetch, getAccountProxyConfig } from "../utils/proxyFetch";

const db = admin.firestore();

// 実行ログの型定義
interface ExecutionLog {
  scheduleId: string;
  igAccountId: string;
  contentId: string;
  status: "success" | "failed" | "retrying";
  error?: string;
  instagramPostId?: string;
  executedAt: admin.firestore.Timestamp;
  retryCount: number;
  nextRetryAt?: admin.firestore.Timestamp;
}

// 最大リトライ回数
const MAX_RETRY_COUNT = 3;

// リトライ間隔（分）
const RETRY_INTERVALS = [5, 15, 60]; // 5分、15分、1時間後

/**
 * 実行予定のスケジュールを取得
 */
async function getPendingSchedules(): Promise<admin.firestore.QueryDocumentSnapshot[]> {
  const now = admin.firestore.Timestamp.now();
  
  // 実行時刻が現在時刻以前で、アクティブなスケジュールを取得
  const schedulesSnapshot = await db
    .collection("schedules")
    .where("status", "==", "active")
    .where("nextRunAt", "<=", now)
    .limit(50) // 一度に処理する最大件数
    .get();

  return schedulesSnapshot.docs;
}

/**
 * スケジュールを実行
 */
async function executeSchedule(scheduleDoc: admin.firestore.QueryDocumentSnapshot): Promise<void> {
  const scheduleData = scheduleDoc.data();
  const scheduleId = scheduleDoc.id;

  console.log(`Executing schedule: ${scheduleId}`);

  try {
    // 関連データを取得
    const [igAccountDoc, contentDoc] = await Promise.all([
      db.collection("users")
        .doc(scheduleData.ownerUid)
        .collection("igAccounts")
        .doc(scheduleData.igAccountId)
        .get(),
      db.collection("posts")
        .doc(scheduleData.contentId)
        .get()
    ]);

    if (!igAccountDoc.exists) {
      throw new Error("Instagram account not found");
    }

    if (!contentDoc.exists) {
      throw new Error("Content not found");
    }

    const igAccountData = igAccountDoc.data()!;
    const contentData = contentDoc.data()!;

    // アクセストークンの有効期限チェック
    const tokenExpiresAt = igAccountData.tokenExpiresAt.toDate();
    if (tokenExpiresAt <= new Date()) {
      throw new Error("Instagram access token has expired");
    }

    // Instagram投稿を実行
    const postResult = await executeInstagramPost(
      scheduleData.igAccountId,
      contentData.mediaUrls,
      contentData.caption,
      scheduleData.ownerUid
    );

    // 投稿成功の処理
    await handleExecutionSuccess(scheduleDoc, postResult.postId);

    // 成功通知を送信
    await sendPostSuccessNotification(
      scheduleData.ownerUid,
      scheduleData.title,
      postResult.postId,
      igAccountData.username
    );

    console.log(`Schedule ${scheduleId} executed successfully. Post ID: ${postResult.postId}`);

  } catch (error: any) {
    console.error(`Schedule ${scheduleId} execution failed:`, error.message);
    
    // 投稿失敗の処理
    await handleExecutionFailure(scheduleDoc, error.message);

    // 失敗通知を送信
    try {
      const igAccountDoc = await db.collection("users")
        .doc(scheduleData.ownerUid)
        .collection("igAccounts")
        .doc(scheduleData.igAccountId)
        .get();
      
      const igAccountUsername = igAccountDoc.exists ? igAccountDoc.data()!.username : "Unknown";
      const currentRetryCount = scheduleData.retryCount || 0;

      await sendPostFailureNotification(
        scheduleData.ownerUid,
        scheduleData.title,
        error.message,
        igAccountUsername,
        currentRetryCount
      );
    } catch (notificationError) {
      console.error("Failed to send failure notification:", notificationError);
    }
  }
}

/**
 * Instagram投稿を実行（認証コンテキストなしで実行）
 */
async function executeInstagramPost(
  igAccountId: string,
  mediaUrls: string[],
  caption: string,
  ownerUid: string
): Promise<{ postId: string }> {
  // IGアカウント情報を取得
  const igAccountDoc = await db
    .collection("users")
    .doc(ownerUid)
    .collection("igAccounts")
    .doc(igAccountId)
    .get();

  if (!igAccountDoc.exists) {
    throw new Error("Instagram account not found");
  }

  const igAccountData = igAccountDoc.data()!;
  const accessToken = igAccountData.accessToken;
  const instagramUserId = igAccountData.instagramUserId;

  // Instagram Graph APIを直接呼び出し
  const INSTAGRAM_API_BASE = "https://graph.facebook.com/v18.0";
  
  // プロキシ設定を取得
  const proxyConfig = await getAccountProxyConfig(ownerUid, igAccountId);

  let creationId: string;

  if (mediaUrls.length === 1) {
    // 単一メディア投稿
    const uploadResponse = await proxyFetch(
      `${INSTAGRAM_API_BASE}/${instagramUserId}/media`,
      proxyConfig,
      {
        method: 'POST',
        params: {
          image_url: mediaUrls[0],
          caption: caption,
          access_token: accessToken,
        },
      }
    );

    if (uploadResponse.error) {
      throw new Error(`Instagram API Error: ${uploadResponse.error.message}`);
    }

    creationId = uploadResponse.id;
  } else {
    // カルーセル投稿
    const mediaIds: string[] = [];

    // 各メディアをアップロード
    for (const mediaUrl of mediaUrls) {
      const uploadResponse = await proxyFetch(
        `${INSTAGRAM_API_BASE}/${instagramUserId}/media`,
        proxyConfig,
        {
          method: 'POST',
          params: {
            image_url: mediaUrl,
            access_token: accessToken,
          },
        }
      );

      if (uploadResponse.error) {
        throw new Error(`Instagram API Error: ${uploadResponse.error.message}`);
      }

      mediaIds.push(uploadResponse.id);
    }

    // カルーセルを作成
    const carouselResponse = await proxyFetch(
      `${INSTAGRAM_API_BASE}/${instagramUserId}/media`,
      proxyConfig,
      {
        method: 'POST',
        params: {
          media_type: "CAROUSEL",
          children: mediaIds.join(","),
          caption: caption,
          access_token: accessToken,
        },
      }
    );

    if (carouselResponse.error) {
      throw new Error(`Instagram API Error: ${carouselResponse.error.message}`);
    }

    creationId = carouselResponse.id;
  }

  // メディアを公開
  const publishResponse = await proxyFetch(
    `${INSTAGRAM_API_BASE}/${instagramUserId}/media_publish`,
    proxyConfig,
    {
      method: 'POST',
      params: {
        creation_id: creationId,
        access_token: accessToken,
      },
    }
  );

  if (publishResponse.error) {
    throw new Error(`Instagram API Error: ${publishResponse.error.message}`);
  }

  return { postId: publishResponse.id };
}

/**
 * 投稿成功時の処理
 */
async function handleExecutionSuccess(
  scheduleDoc: admin.firestore.QueryDocumentSnapshot,
  instagramPostId: string
): Promise<void> {
  const scheduleData = scheduleDoc.data();
  const scheduleId = scheduleDoc.id;
  const batch = db.batch();

  // 実行ログを記録
  const executionLog: ExecutionLog = {
    scheduleId: scheduleId,
    igAccountId: scheduleData.igAccountId,
    contentId: scheduleData.contentId,
    status: "success",
    instagramPostId: instagramPostId,
    executedAt: admin.firestore.Timestamp.now(),
    retryCount: 0,
  };

  const logRef = db.collection("executionLogs").doc();
  batch.set(logRef, executionLog);

  // スケジュールの更新
  const scheduleRef = scheduleDoc.ref;
  const updateData: any = {
    lastRunAt: admin.firestore.Timestamp.now(),
    runCount: admin.firestore.FieldValue.increment(1),
    retryCount: 0,
    updatedAt: admin.firestore.Timestamp.now(),
  };

  // 次回実行時刻を計算
  try {
    const nextRunAt = updateNextRunAfterExecution(scheduleData as any);
    if (nextRunAt) {
      updateData.nextRunAt = admin.firestore.Timestamp.fromDate(nextRunAt);
    } else {
      // 一回限りの投稿の場合は完了状態に
      updateData.status = "completed";
      updateData.nextRunAt = admin.firestore.FieldValue.delete();
    }
  } catch (error) {
    // 次回実行時刻の計算に失敗した場合は完了状態に
    updateData.status = "completed";
    updateData.nextRunAt = admin.firestore.FieldValue.delete();
  }

  batch.update(scheduleRef, updateData);

  // 投稿回数をインクリメント
  const postRef = db.collection("posts").doc(scheduleData.contentId);
  batch.update(postRef, {
    timesPosted: admin.firestore.FieldValue.increment(1),
    updatedAt: admin.firestore.Timestamp.now(),
  });

  await batch.commit();
}

/**
 * 投稿失敗時の処理
 */
async function handleExecutionFailure(
  scheduleDoc: admin.firestore.QueryDocumentSnapshot,
  errorMessage: string
): Promise<void> {
  const scheduleData = scheduleDoc.data();
  const scheduleId = scheduleDoc.id;
  const currentRetryCount = scheduleData.retryCount || 0;
  const batch = db.batch();

  // 実行ログを記録
  const executionLog: ExecutionLog = {
    scheduleId: scheduleId,
    igAccountId: scheduleData.igAccountId,
    contentId: scheduleData.contentId,
    status: currentRetryCount < MAX_RETRY_COUNT ? "retrying" : "failed",
    error: errorMessage,
    executedAt: admin.firestore.Timestamp.now(),
    retryCount: currentRetryCount,
  };

  // 次回リトライ時刻を設定
  if (currentRetryCount < MAX_RETRY_COUNT) {
    const retryInterval = RETRY_INTERVALS[currentRetryCount] || RETRY_INTERVALS[RETRY_INTERVALS.length - 1];
    const nextRetryAt = new Date(Date.now() + retryInterval * 60 * 1000);
    executionLog.nextRetryAt = admin.firestore.Timestamp.fromDate(nextRetryAt);
  }

  const logRef = db.collection("executionLogs").doc();
  batch.set(logRef, executionLog);

  // スケジュールの更新
  const scheduleRef = scheduleDoc.ref;
  const updateData: any = {
    retryCount: currentRetryCount + 1,
    updatedAt: admin.firestore.Timestamp.now(),
  };

  if (currentRetryCount < MAX_RETRY_COUNT) {
    // リトライする場合
    const retryInterval = RETRY_INTERVALS[currentRetryCount] || RETRY_INTERVALS[RETRY_INTERVALS.length - 1];
    const nextRetryAt = new Date(Date.now() + retryInterval * 60 * 1000);
    updateData.nextRunAt = admin.firestore.Timestamp.fromDate(nextRetryAt);
  } else {
    // 最大リトライ回数に達した場合はエラー状態に
    updateData.status = "error";
    updateData.nextRunAt = admin.firestore.FieldValue.delete();
  }

  batch.update(scheduleRef, updateData);
  await batch.commit();
}

/**
 * 期限切れのスケジュールをクリーンアップ
 */
async function cleanupExpiredSchedules(): Promise<void> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const expiredTimestamp = admin.firestore.Timestamp.fromDate(oneWeekAgo);

  // 1週間以上前に完了したスケジュールを削除
  const expiredSchedulesSnapshot = await db
    .collection("schedules")
    .where("status", "==", "completed")
    .where("lastRunAt", "<=", expiredTimestamp)
    .limit(100)
    .get();

  if (expiredSchedulesSnapshot.empty) {
    return;
  }

  const batch = db.batch();
  expiredSchedulesSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Cleaned up ${expiredSchedulesSnapshot.docs.length} expired schedules`);
}

/**
 * メインの自動投稿実行関数（Cloud Schedulerから呼び出される）
 */
export const executeScheduledPosts = functions.pubsub
  .schedule("every 1 minutes")
  .timeZone("Asia/Tokyo")
  .onRun(async (context) => {
    console.log("Starting scheduled posts execution...");

    try {
      // 実行予定のスケジュールを取得
      const pendingSchedules = await getPendingSchedules();

      if (pendingSchedules.length === 0) {
        console.log("No pending schedules found");
        return;
      }

      console.log(`Found ${pendingSchedules.length} pending schedules`);

      // 各スケジュールを並行実行（最大5件まで）
      const executionPromises = pendingSchedules
        .slice(0, 5)
        .map((scheduleDoc) => executeSchedule(scheduleDoc));

      await Promise.allSettled(executionPromises);

      // 期限切れスケジュールのクリーンアップ（1時間に1回）
      const currentMinute = new Date().getMinutes();
      if (currentMinute === 0) {
        await cleanupExpiredSchedules();
      }

      console.log("Scheduled posts execution completed");

    } catch (error: any) {
      console.error("Scheduled posts execution error:", error);
      throw error;
    }
  });

/**
 * 手動でスケジュール実行をトリガーする関数（開発・テスト用）
 */
export const triggerScheduleExecution = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { scheduleId } = data;

  if (!scheduleId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "scheduleId is required"
    );
  }

  try {
    // スケジュールを取得
    const scheduleDoc = await db.collection("schedules").doc(scheduleId).get();

    if (!scheduleDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Schedule not found"
      );
    }

    const scheduleData = scheduleDoc.data()!;

    // 所有者チェック
    if (scheduleData.ownerUid !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You don't have permission to execute this schedule"
      );
    }

    // スケジュールを実行
    await executeSchedule(scheduleDoc as admin.firestore.QueryDocumentSnapshot);

    return {
      success: true,
      scheduleId: scheduleId,
      executedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Manual schedule execution error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to execute schedule: ${error.message}`
    );
  }
});

/**
 * 実行ログを取得する関数
 */
export const getExecutionLogs = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { scheduleId, limit = 20, lastLogId } = data;

  try {
    let query = db.collection("executionLogs")
      .orderBy("executedAt", "desc")
      .limit(limit);

    if (scheduleId) {
      query = query.where("scheduleId", "==", scheduleId);
    }

    if (lastLogId) {
      const lastLogDoc = await db.collection("executionLogs").doc(lastLogId).get();
      if (lastLogDoc.exists) {
        query = query.startAfter(lastLogDoc);
      }
    }

    const logsSnapshot = await query.get();

    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      logs: logs,
      hasMore: logsSnapshot.docs.length === limit,
      lastLogId: logsSnapshot.docs.length > 0 ? logsSnapshot.docs[logsSnapshot.docs.length - 1].id : null,
    };

  } catch (error: any) {
    console.error("Get execution logs error:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get execution logs: ${error.message}`
    );
  }
}); 