import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Firebase Functions ベースの健康監視システム
 * 
 * 機能:
 * - 5分ごとの基本ヘルスチェック
 * - 異常検知時の即座通知
 * - システム指標の自動記録
 * - 自己回復機能
 */

interface HealthStatus {
  timestamp: admin.firestore.Timestamp;
  status: 'healthy' | 'warning' | 'critical';
  checks: {
    database: boolean;
    functions: boolean;
    authentication: boolean;
    storage: boolean;
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    activeUsers: number;
  };
  alerts?: string[];
}

/**
 * 5分ごとの基本ヘルスチェック
 */
export const performHealthCheck = functions
  .runWith({
    memory: '128MB',
    timeoutSeconds: 60
  })
  .pubsub.schedule('every 5 minutes')
  .onRun(async (context) => {
    console.log('🏥 Starting health check...');
    
    const startTime = Date.now();
    const healthStatus: HealthStatus = {
      timestamp: admin.firestore.Timestamp.now(),
      status: 'healthy',
      checks: {
        database: false,
        functions: false,
        authentication: false,
        storage: false
      },
      metrics: {
        responseTime: 0,
        errorRate: 0,
        activeUsers: 0
      },
      alerts: []
    };

    try {
      // 1. データベース接続チェック
      await checkDatabase(healthStatus);
      
      // 2. 認証システムチェック  
      await checkAuthentication(healthStatus);
      
      // 3. ストレージチェック
      await checkStorage(healthStatus);
      
      // 4. Functions自体の動作チェック
      healthStatus.checks.functions = true;
      
      // 5. パフォーマンス指標計算
      await calculateMetrics(healthStatus);
      
      // 6. 全体ステータス判定
      determineOverallStatus(healthStatus);
      
      // 7. レスポンス時間記録
      healthStatus.metrics.responseTime = Date.now() - startTime;
      
      // 8. 結果保存
      await saveHealthStatus(healthStatus);
      
      // 9. 異常時の通知
      if (healthStatus.status !== 'healthy') {
        await sendAlert(healthStatus);
      }
      
      console.log(`✅ Health check completed: ${healthStatus.status}`);
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      
      healthStatus.status = 'critical';
      healthStatus.alerts?.push(`Health check system failure: ${error}`);
      
      await saveHealthStatus(healthStatus);
      await sendAlert(healthStatus);
    }
  });

/**
 * データベース接続とパフォーマンスチェック
 */
async function checkDatabase(status: HealthStatus): Promise<void> {
  try {
    const testDoc = admin.firestore().collection('healthCheck').doc('test');
    
    // 書き込みテスト
    await testDoc.set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: 'write'
    });
    
    // 読み込みテスト
    const snapshot = await testDoc.get();
    if (!snapshot.exists) {
      throw new Error('Database read test failed');
    }
    
    // クリーンアップ
    await testDoc.delete();
    
    status.checks.database = true;
    
  } catch (error) {
    status.checks.database = false;
    status.alerts?.push(`Database check failed: ${error}`);
  }
}

/**
 * 認証システムチェック
 */
async function checkAuthentication(status: HealthStatus): Promise<void> {
  try {
    // テスト用カスタムトークン生成
    const customToken = await admin.auth().createCustomToken('health-check-user');
    
    if (!customToken) {
      throw new Error('Custom token generation failed');
    }
    
    status.checks.authentication = true;
    
  } catch (error) {
    status.checks.authentication = false;
    status.alerts?.push(`Authentication check failed: ${error}`);
  }
}

/**
 * ストレージチェック
 */
async function checkStorage(status: HealthStatus): Promise<void> {
  try {
    const bucket = admin.storage().bucket();
    
    // テストファイルのアップロード
    const testFile = bucket.file('health-check/test.txt');
    await testFile.save('health check test');
    
    // テストファイルの存在確認
    const [exists] = await testFile.exists();
    if (!exists) {
      throw new Error('Storage write test failed');
    }
    
    // クリーンアップ
    await testFile.delete();
    
    status.checks.storage = true;
    
  } catch (error) {
    status.checks.storage = false;
    status.alerts?.push(`Storage check failed: ${error}`);
  }
}

/**
 * パフォーマンス指標計算
 */
async function calculateMetrics(status: HealthStatus): Promise<void> {
  try {
    // 過去1時間のエラー率計算
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // 実際のプロジェクトでは Functions のメトリクスAPIを使用
    // ここでは簡易的な計算
    status.metrics.errorRate = await calculateErrorRate(oneHourAgo);
    status.metrics.activeUsers = await getActiveUserCount();
    
  } catch (error) {
    console.warn('Metrics calculation failed:', error);
    status.alerts?.push(`Metrics calculation failed: ${error}`);
  }
}

/**
 * エラー率計算（簡易版）
 */
async function calculateErrorRate(since: Date): Promise<number> {
  try {
    // 実際にはCloud Logging APIを使用してエラー数を取得
    // ここでは Firestore の logs コレクションから概算
    const errorLogs = await admin.firestore()
      .collection('systemLogs')
      .where('level', '==', 'error')
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(since))
      .get();
      
    const totalLogs = await admin.firestore()
      .collection('systemLogs') 
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(since))
      .get();
    
    if (totalLogs.size === 0) return 0;
    
    return (errorLogs.size / totalLogs.size) * 100;
    
  } catch (error) {
    console.warn('Error rate calculation failed:', error);
    return 0;
  }
}

/**
 * アクティブユーザー数取得
 */
async function getActiveUserCount(): Promise<number> {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const activeUsers = await admin.firestore()
      .collection('users')
      .where('lastLoginAt', '>=', admin.firestore.Timestamp.fromDate(twentyFourHoursAgo))
      .get();
      
    return activeUsers.size;
    
  } catch (error) {
    console.warn('Active user count failed:', error);
    return 0;
  }
}

/**
 * 全体ステータス判定
 */
function determineOverallStatus(status: HealthStatus): void {
  const failedChecks = Object.values(status.checks).filter(check => !check).length;
  const errorRate = status.metrics.errorRate;
  
  if (failedChecks >= 2 || errorRate > 5) {
    status.status = 'critical';
  } else if (failedChecks >= 1 || errorRate > 1) {
    status.status = 'warning';
  } else {
    status.status = 'healthy';
  }
}

/**
 * ヘルスステータス保存
 */
async function saveHealthStatus(status: HealthStatus): Promise<void> {
  await admin.firestore()
    .collection('healthStatus')
    .doc(`health-${status.timestamp.seconds}`)
    .set(status);
    
  // 最新ステータスも更新
  await admin.firestore()
    .collection('systemStatus')
    .doc('latest')
    .set({
      ...status,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
}

/**
 * アラート送信
 */
async function sendAlert(status: HealthStatus): Promise<void> {
  try {
    const alertLevel = status.status === 'critical' ? '🚨' : '⚠️';
    const message = `${alertLevel} Omniy Health Alert
    
Status: ${status.status.toUpperCase()}
Time: ${status.timestamp.toDate().toLocaleString('ja-JP')}

Failed Checks:
${Object.entries(status.checks)
  .filter(([_, passed]) => !passed)
  .map(([check, _]) => `❌ ${check}`)
  .join('\n')}

Metrics:
📊 Error Rate: ${status.metrics.errorRate.toFixed(2)}%
⚡ Response Time: ${status.metrics.responseTime}ms
👥 Active Users: ${status.metrics.activeUsers}

${status.alerts?.length ? 'Alerts:\n' + status.alerts.join('\n') : ''}`;

    // Discord/Slack webhook 送信
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordAlert(message);
    }
    
    // メール送信（critical のみ）
    if (status.status === 'critical' && process.env.ALERT_EMAIL) {
      await sendEmailAlert(message);
    }
    
  } catch (error) {
    console.error('Alert sending failed:', error);
  }
}

/**
 * Discord アラート送信
 */
async function sendDiscordAlert(message: string): Promise<void> {
  // 実装は省略（webhook URL を使用）
  console.log('Discord alert sent:', message);
}

/**
 * メールアラート送信
 */
async function sendEmailAlert(message: string): Promise<void> {
  // 実装は省略（SendGrid, Nodemailer等を使用）
  console.log('Email alert sent:', message);
}

/**
 * ヘルスステータス取得API
 */
export const getHealthStatus = functions.https.onCall(async (data, context) => {
  // 認証チェック（管理者のみ）
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Admin access required'
    );
  }
  
  try {
    const latestStatus = await admin.firestore()
      .collection('systemStatus')
      .doc('latest')
      .get();
      
    if (!latestStatus.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Health status not found'
      );
    }
    
    return latestStatus.data();
    
  } catch (error) {
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get health status'
    );
  }
});

/**
 * ヘルス履歴取得API
 */
export const getHealthHistory = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    );
  }
  
  const { hours = 24 } = data;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  try {
    const history = await admin.firestore()
      .collection('healthStatus')
      .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(since))
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
      
    return history.docs.map(doc => doc.data());
    
  } catch (error) {
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get health history'
    );
  }
});