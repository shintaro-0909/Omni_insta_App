import * as admin from "firebase-admin";
import { sendPostSuccessNotification, sendPostFailureNotification } from "../../utils/notifications";

export interface ExecutionLog {
  scheduleId: string;
  igAccountId: string;
  contentId: string;
  status: "success" | "failed" | "retrying";
  error?: string;
  instagramPostId?: string;
  executedAt: admin.firestore.Timestamp;
  retryCount: number;
  nextRetryAt?: admin.firestore.Timestamp;
  userId: string;
  executionTime?: number; // 実行時間（ms）
  metadata?: {
    userAgent?: string;
    proxyUsed?: boolean;
    mediaCount?: number;
  };
}

export class ExecutionLogger {
  private db: admin.firestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  /**
   * 実行開始をログ
   */
  async logExecutionStart(
    scheduleId: string,
    igAccountId: string,
    contentId: string,
    userId: string
  ): Promise<string> {
    const logData: Partial<ExecutionLog> = {
      scheduleId,
      igAccountId,
      contentId,
      userId,
      status: "retrying", // 実行中
      executedAt: admin.firestore.Timestamp.now(),
      retryCount: 0
    };

    const logRef = await this.db.collection("executionLogs").add(logData);
    return logRef.id;
  }

  /**
   * 実行成功をログ
   */
  async logExecutionSuccess(
    logId: string,
    instagramPostId: string,
    executionTime?: number,
    metadata?: ExecutionLog['metadata']
  ): Promise<void> {
    const updateData: Partial<ExecutionLog> = {
      status: "success",
      instagramPostId,
      executionTime,
      metadata
    };

    await this.db.collection("executionLogs").doc(logId).update(updateData);

    // 成功通知を送信
    try {
      const logDoc = await this.db.collection("executionLogs").doc(logId).get();
      const logData = logDoc.data() as ExecutionLog;
      await sendPostSuccessNotification(logData.userId, {
        scheduleId: logData.scheduleId,
        instagramPostId,
        executedAt: new Date()
      });
    } catch (notificationError) {
      console.warn("Failed to send success notification:", notificationError);
    }
  }

  /**
   * 実行失敗をログ
   */
  async logExecutionFailure(
    logId: string,
    error: string,
    retryCount: number,
    nextRetryAt?: admin.firestore.Timestamp
  ): Promise<void> {
    const updateData: Partial<ExecutionLog> = {
      status: nextRetryAt ? "retrying" : "failed",
      error,
      retryCount,
      nextRetryAt
    };

    await this.db.collection("executionLogs").doc(logId).update(updateData);

    // 最終失敗時の通知
    if (!nextRetryAt) {
      try {
        const logDoc = await this.db.collection("executionLogs").doc(logId).get();
        const logData = logDoc.data() as ExecutionLog;
        await sendPostFailureNotification(logData.userId, {
          scheduleId: logData.scheduleId,
          error,
          finalAttempt: true
        });
      } catch (notificationError) {
        console.warn("Failed to send failure notification:", notificationError);
      }
    }
  }

  /**
   * 実行統計を取得
   */
  async getExecutionStats(userId: string, period: 'day' | 'week' | 'month' = 'day') {
    const now = new Date();
    const periodMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    const startTime = new Date(now.getTime() - periodMs[period]);
    
    const logsSnapshot = await this.db
      .collection("executionLogs")
      .where("userId", "==", userId)
      .where("executedAt", ">=", admin.firestore.Timestamp.fromDate(startTime))
      .get();

    const logs = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ExecutionLog[];

    return {
      total: logs.length,
      successful: logs.filter(log => log.status === "success").length,
      failed: logs.filter(log => log.status === "failed").length,
      retrying: logs.filter(log => log.status === "retrying").length,
      averageExecutionTime: this.calculateAverageExecutionTime(logs),
      errorSummary: this.summarizeErrors(logs)
    };
  }

  /**
   * 平均実行時間を計算
   */
  private calculateAverageExecutionTime(logs: ExecutionLog[]): number {
    const logsWithTime = logs.filter(log => log.executionTime && log.status === "success");
    if (logsWithTime.length === 0) return 0;

    const totalTime = logsWithTime.reduce((sum, log) => sum + (log.executionTime || 0), 0);
    return Math.round(totalTime / logsWithTime.length);
  }

  /**
   * エラーサマリーを作成
   */
  private summarizeErrors(logs: ExecutionLog[]): Record<string, number> {
    const errorCounts: Record<string, number> = {};
    
    logs
      .filter(log => log.status === "failed" && log.error)
      .forEach(log => {
        // エラーメッセージを分類
        const errorType = this.categorizeError(log.error!);
        errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
      });

    return errorCounts;
  }

  /**
   * エラーを分類
   */
  private categorizeError(error: string): string {
    if (error.includes("401") || error.includes("unauthorized")) return "認証エラー";
    if (error.includes("429") || error.includes("rate limit")) return "レート制限";
    if (error.includes("400") || error.includes("bad request")) return "リクエストエラー";
    if (error.includes("500") || error.includes("internal server")) return "サーバーエラー";
    if (error.includes("timeout") || error.includes("TIMEOUT")) return "タイムアウト";
    if (error.includes("network") || error.includes("NETWORK")) return "ネットワークエラー";
    return "その他";
  }

  /**
   * 古いログをクリーンアップ
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const oldLogsSnapshot = await this.db
      .collection("executionLogs")
      .where("executedAt", "<", admin.firestore.Timestamp.fromDate(cutoffDate))
      .limit(100) // バッチサイズ制限
      .get();

    if (oldLogsSnapshot.empty) {
      return 0;
    }

    const batch = this.db.batch();
    oldLogsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return oldLogsSnapshot.size;
  }
}