import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { updateNextRunAfterExecution } from "../utils/scheduleUtils";
import { RetryManager, RetryConfig } from "./modules/RetryManager";
import { ExecutionLogger, ExecutionLog } from "./modules/ExecutionLogger";
import { InstagramExecutor, InstagramPostData } from "./modules/InstagramExecutor";

const db = admin.firestore();

// パフォーマンス設定
const BATCH_SIZE = 10;
const MAX_CONCURRENT_EXECUTIONS = 3;

// モジュール初期化
const retryManager = new RetryManager();
const executionLogger = new ExecutionLogger();
const instagramExecutor = new InstagramExecutor();

// データベース接続最適化
let dbConnectionInitialized = false;
const initializeDbConnection = () => {
  if (!dbConnectionInitialized) {
    db.settings({
      ignoreUndefinedProperties: true,
      merge: true
    });
    dbConnectionInitialized = true;
  }
};

// キャッシュ設定
const accountCache = new Map<string, any>();
const contentCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5分

/**
 * メイン投稿実行関数（リファクタリング版）
 */
export const executeScheduledPostsRefactored = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "1GB"
  })
  .pubsub
  .schedule("every 1 minutes")
  .onRun(async (context) => {
    initializeDbConnection();
    
    console.log("🚀 投稿実行開始 (リファクタリング版)");
    
    try {
      // 実行待ちのスケジュールを取得
      const pendingSchedules = await getPendingSchedules();
      
      if (pendingSchedules.length === 0) {
        console.log("実行待ちのスケジュールはありません");
        return null;
      }

      console.log(`${pendingSchedules.length}件の投稿を実行します`);

      // バッチ処理で実行
      const results = await processSchedulesInBatches(pendingSchedules);
      
      // 結果をログ出力
      logBatchResults(results);
      
      return { processed: results.length };

    } catch (error) {
      console.error("投稿実行エラー:", error);
      throw error;
    }
  });

/**
 * 実行待ちスケジュールを取得
 */
async function getPendingSchedules(): Promise<any[]> {
  const now = admin.firestore.Timestamp.now();
  
  const schedulesSnapshot = await db
    .collectionGroup("schedules")
    .where("status", "==", "active")
    .where("nextRunAt", "<=", now)
    .limit(BATCH_SIZE)
    .get();

  return schedulesSnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.ref.parent.parent!.id,
    ...doc.data()
  }));
}

/**
 * スケジュールをバッチ処理
 */
async function processSchedulesInBatches(schedules: any[]): Promise<any[]> {
  const results = [];
  
  for (let i = 0; i < schedules.length; i += MAX_CONCURRENT_EXECUTIONS) {
    const batch = schedules.slice(i, i + MAX_CONCURRENT_EXECUTIONS);
    
    const batchResults = await Promise.allSettled(
      batch.map(schedule => processSchedule(schedule))
    );
    
    results.push(...batchResults);
    
    // バッチ間での短い待機（レート制限対策）
    if (i + MAX_CONCURRENT_EXECUTIONS < schedules.length) {
      await sleep(1000); // 1秒待機
    }
  }
  
  return results;
}

/**
 * 単一スケジュールの処理
 */
async function processSchedule(schedule: any): Promise<any> {
  const startTime = Date.now();
  let logId: string | null = null;

  try {
    // 実行ログ開始
    logId = await executionLogger.logExecutionStart(
      schedule.id,
      schedule.igAccountId,
      schedule.contentId,
      schedule.userId
    );

    // アカウントとコンテンツ情報を取得
    const { accountData, contentData } = await getAccountAndContent(
      schedule.userId,
      schedule.igAccountId,
      schedule.contentId
    );

    // 投稿データを準備
    const postData: InstagramPostData = {
      caption: contentData.caption || "",
      mediaUrls: contentData.mediaUrls || [],
      mediaType: contentData.mediaType || "photo"
    };

    // Instagram への投稿実行
    const result = await instagramExecutor.executePost(
      schedule.igAccountId,
      postData,
      schedule.userId
    );

    if (result.success) {
      // 成功時の処理
      await handleSuccessfulExecution(
        schedule,
        result.instagramPostId!,
        logId,
        result.executionTime,
        result.metadata
      );
      
      return { status: 'success', scheduleId: schedule.id };
    } else {
      // 失敗時の処理
      return await handleFailedExecution(
        schedule,
        result.error!,
        logId
      );
    }

  } catch (error: any) {
    console.error(`スケジュール ${schedule.id} の実行エラー:`, error);
    
    return await handleFailedExecution(
      schedule,
      error.message || String(error),
      logId
    );
  }
}

/**
 * アカウントとコンテンツ情報の取得（キャッシュ付き）
 */
async function getAccountAndContent(
  userId: string,
  igAccountId: string,
  contentId: string
): Promise<{ accountData: any; contentData: any }> {
  const accountCacheKey = `${userId}_${igAccountId}`;
  const contentCacheKey = `${userId}_${contentId}`;

  // キャッシュチェック
  let accountData = accountCache.get(accountCacheKey);
  let contentData = contentCache.get(contentCacheKey);

  // アカウントデータ取得
  if (!accountData) {
    const accountDoc = await db
      .collection("users")
      .doc(userId)
      .collection("igAccounts")
      .doc(igAccountId)
      .get();

    if (!accountDoc.exists) {
      throw new Error(`Instagram account ${igAccountId} not found`);
    }

    accountData = accountDoc.data();
    accountCache.set(accountCacheKey, accountData);
    
    // キャッシュの有効期限設定
    setTimeout(() => accountCache.delete(accountCacheKey), CACHE_TTL);
  }

  // コンテンツデータ取得
  if (!contentData) {
    const contentDoc = await db
      .collection("users")
      .doc(userId)
      .collection("contents")
      .doc(contentId)
      .get();

    if (!contentDoc.exists) {
      throw new Error(`Content ${contentId} not found`);
    }

    contentData = contentDoc.data();
    contentCache.set(contentCacheKey, contentData);
    
    // キャッシュの有効期限設定
    setTimeout(() => contentCache.delete(contentCacheKey), CACHE_TTL);
  }

  return { accountData, contentData };
}

/**
 * 成功時の処理
 */
async function handleSuccessfulExecution(
  schedule: any,
  instagramPostId: string,
  logId: string,
  executionTime?: number,
  metadata?: any
): Promise<void> {
  // 実行ログを更新
  await executionLogger.logExecutionSuccess(
    logId,
    instagramPostId,
    executionTime,
    metadata
  );

  // スケジュールの次回実行時間を更新
  await updateNextRunAfterExecution(
    schedule.userId,
    schedule.id
  );

  console.log(`✅ 投稿成功: ${schedule.id} -> ${instagramPostId}`);
}

/**
 * 失敗時の処理
 */
async function handleFailedExecution(
  schedule: any,
  error: string,
  logId: string | null
): Promise<any> {
  if (!logId) {
    console.error("ログIDが見つかりません");
    return { status: 'error', scheduleId: schedule.id, error };
  }

  // 現在のリトライ回数を取得
  const currentRetryCount = schedule.retryCount || 0;
  
  // リトライ判定
  const shouldRetry = retryManager.shouldRetryError({ message: error, response: { status: 500 } });
  
  if (shouldRetry) {
    const retryInfo = retryManager.calculateRetryInfo(currentRetryCount);
    
    if (retryInfo.shouldRetry) {
      // リトライ予定として記録
      await executionLogger.logExecutionFailure(
        logId,
        error,
        retryInfo.retryCount,
        retryInfo.nextRetryAt
      );

      // スケジュールにリトライ情報を更新
      await db
        .collection("users")
        .doc(schedule.userId)
        .collection("schedules")
        .doc(schedule.id)
        .update({
          retryCount: retryInfo.retryCount,
          nextRunAt: retryInfo.nextRetryAt,
          lastError: error
        });

      console.log(`🔄 リトライ予定: ${schedule.id} (${retryInfo.retryCount}/${retryManager['config'].maxRetryCount})`);
      return { status: 'retry', scheduleId: schedule.id, retryCount: retryInfo.retryCount };
    }
  }

  // 最終失敗として記録
  await executionLogger.logExecutionFailure(logId, error, currentRetryCount);

  // スケジュールを非アクティブ化
  await db
    .collection("users")
    .doc(schedule.userId)
    .collection("schedules")
    .doc(schedule.id)
    .update({
      status: "failed",
      lastError: error,
      failedAt: admin.firestore.Timestamp.now()
    });

  console.log(`❌ 投稿失敗（最終）: ${schedule.id} - ${error}`);
  return { status: 'failed', scheduleId: schedule.id, error };
}

/**
 * バッチ結果のログ出力
 */
function logBatchResults(results: any[]): void {
  const summary = results.reduce((acc, result) => {
    if (result.status === 'fulfilled') {
      const value = result.value;
      acc[value.status] = (acc[value.status] || 0) + 1;
    } else {
      acc.error = (acc.error || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  console.log("📊 実行結果:", summary);
}

/**
 * ユーティリティ: スリープ関数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 古いログのクリーンアップ（週次実行）
 */
export const cleanupExecutionLogs = functions
  .pubsub
  .schedule("0 2 * * 0") // 毎週日曜日 2:00
  .onRun(async () => {
    console.log("🧹 古いログのクリーンアップを開始");
    
    const deletedCount = await executionLogger.cleanupOldLogs(90); // 90日前のログを削除
    
    console.log(`🧹 ${deletedCount}件のログをクリーンアップしました`);
    return { deletedCount };
  });