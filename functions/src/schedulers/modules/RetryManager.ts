import * as admin from "firebase-admin";

export interface RetryConfig {
  maxRetryCount: number;
  retryIntervals: number[]; // in minutes
}

export interface RetryInfo {
  retryCount: number;
  nextRetryAt?: admin.firestore.Timestamp;
  shouldRetry: boolean;
}

export class RetryManager {
  private config: RetryConfig;

  constructor(config: RetryConfig = {
    maxRetryCount: 3,
    retryIntervals: [5, 15, 60] // 5分、15分、1時間後
  }) {
    this.config = config;
  }

  /**
   * リトライ情報を計算
   */
  calculateRetryInfo(currentRetryCount: number): RetryInfo {
    const shouldRetry = currentRetryCount < this.config.maxRetryCount;
    
    if (!shouldRetry) {
      return {
        retryCount: currentRetryCount,
        shouldRetry: false
      };
    }

    const nextRetryDelay = this.config.retryIntervals[currentRetryCount] || 
                          this.config.retryIntervals[this.config.retryIntervals.length - 1];
    
    const nextRetryAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + nextRetryDelay * 60 * 1000)
    );

    return {
      retryCount: currentRetryCount + 1,
      nextRetryAt,
      shouldRetry: true
    };
  }

  /**
   * リトライが必要かどうかを判定
   */
  shouldRetryError(error: any): boolean {
    // Instagram API の一時的なエラーかどうかを判定
    if (error.response) {
      const status = error.response.status;
      
      // リトライ対象のエラーステータス
      const retryableStatuses = [429, 500, 502, 503, 504];
      return retryableStatuses.includes(status);
    }

    // ネットワークエラーなどもリトライ対象
    return error.code === 'NETWORK_ERROR' || 
           error.code === 'TIMEOUT' ||
           error.message?.includes('timeout');
  }

  /**
   * エラーの重要度を判定
   */
  getErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401 || status === 403) return 'critical'; // 認証エラー
      if (status === 400) return 'high'; // リクエストエラー
      if (status === 429) return 'medium'; // レート制限
      if (status >= 500) return 'low'; // サーバーエラー
    }

    return 'medium';
  }

  /**
   * 指数バックオフを使用した遅延計算
   */
  calculateExponentialBackoff(attempt: number, baseDelay = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attempt), 30000); // 最大30秒
  }
}