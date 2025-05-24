import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const db = admin.firestore()

// 実行ログの型定義
export interface ExecutionLog {
  id: string
  scheduleId: string
  igAccountId: string
  contentId: string
  status: 'success' | 'failed' | 'retrying'
  error?: string
  instagramPostId?: string
  executedAt: admin.firestore.Timestamp
  retryCount: number
  nextRetryAt?: admin.firestore.Timestamp
  userId: string
}

// ログ統計の型定義
export interface LogStats {
  total: number
  success: number
  failed: number
  retrying: number
  last24Hours: {
    total: number
    success: number
    failed: number
  }
  last7Days: {
    total: number
    success: number
    failed: number
  }
  last30Days: {
    total: number
    success: number
    failed: number
  }
}

// ログフィルターの型定義
export interface LogFilters {
  status?: 'success' | 'failed' | 'retrying'
  igAccountId?: string
  contentId?: string
  dateFrom?: admin.firestore.Timestamp
  dateTo?: admin.firestore.Timestamp
  last24Hours?: boolean
}

// 実行ログ取得
export const getExecutionLogs = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    )
  }

  const userId = context.auth.uid
  const { 
    filters = {}, 
    limit = 20, 
    lastLogId,
    orderBy = 'executedAt',
    orderDirection = 'desc'
  }: {
    filters?: LogFilters
    limit?: number
    lastLogId?: string
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
  } = data

  try {
    let query = db.collection('executionLogs')
      .where('userId', '==', userId)
      .orderBy(orderBy, orderDirection)
      .limit(limit)

    // フィルターを適用
    if (filters.status) {
      query = query.where('status', '==', filters.status)
    }

    if (filters.igAccountId) {
      query = query.where('igAccountId', '==', filters.igAccountId)
    }

    if (filters.contentId) {
      query = query.where('contentId', '==', filters.contentId)
    }

    if (filters.dateFrom) {
      query = query.where('executedAt', '>=', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.where('executedAt', '<=', filters.dateTo)
    }

    // 24時間以内のフィルター
    if (filters.last24Hours) {
      const now = admin.firestore.Timestamp.now()
      const yesterday = admin.firestore.Timestamp.fromMillis(
        now.toMillis() - (24 * 60 * 60 * 1000)
      )
      query = query.where('executedAt', '>=', yesterday)
    }

    // ページネーション
    if (lastLogId) {
      const lastLogDoc = await db.collection('executionLogs').doc(lastLogId).get()
      if (lastLogDoc.exists) {
        query = query.startAfter(lastLogDoc)
      }
    }

    const logsSnapshot = await query.get()

    const logs = logsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ExecutionLog[]

    return {
      success: true,
      logs,
      hasMore: logsSnapshot.docs.length === limit,
      lastLogId: logsSnapshot.docs.length > 0 
        ? logsSnapshot.docs[logsSnapshot.docs.length - 1].id 
        : null,
    }

  } catch (error: any) {
    console.error('Get execution logs error:', error)
    throw new functions.https.HttpsError(
      'internal',
      `Failed to get execution logs: ${error.message}`
    )
  }
})

// ログ統計取得
export const getLogStats = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    )
  }

  const userId = context.auth.uid

  try {
    const now = admin.firestore.Timestamp.now()
    const yesterday = admin.firestore.Timestamp.fromMillis(
      now.toMillis() - (24 * 60 * 60 * 1000)
    )
    const lastWeek = admin.firestore.Timestamp.fromMillis(
      now.toMillis() - (7 * 24 * 60 * 60 * 1000)
    )
    const lastMonth = admin.firestore.Timestamp.fromMillis(
      now.toMillis() - (30 * 24 * 60 * 60 * 1000)
    )

    // 全体統計
    const allLogsQuery = db.collection('executionLogs')
      .where('userId', '==', userId)

    // 24時間以内
    const last24HoursQuery = allLogsQuery
      .where('executedAt', '>=', yesterday)

    // 7日以内
    const last7DaysQuery = allLogsQuery
      .where('executedAt', '>=', lastWeek)

    // 30日以内
    const last30DaysQuery = allLogsQuery
      .where('executedAt', '>=', lastMonth)

    // すべてのクエリを並行実行
    const [
      allLogsSnapshot,
      last24HoursSnapshot,
      last7DaysSnapshot,
      last30DaysSnapshot
    ] = await Promise.all([
      allLogsQuery.get(),
      last24HoursQuery.get(),
      last7DaysQuery.get(),
      last30DaysQuery.get()
    ])

    // 統計を計算する関数
    const calculateStats = (snapshot: admin.firestore.QuerySnapshot) => {
      const logs = snapshot.docs.map(doc => doc.data())
      return {
        total: logs.length,
        success: logs.filter(log => log.status === 'success').length,
        failed: logs.filter(log => log.status === 'failed').length,
        retrying: logs.filter(log => log.status === 'retrying').length,
      }
    }

    const allStats = calculateStats(allLogsSnapshot)
    const last24HoursStats = calculateStats(last24HoursSnapshot)
    const last7DaysStats = calculateStats(last7DaysSnapshot)
    const last30DaysStats = calculateStats(last30DaysSnapshot)

    const stats: LogStats = {
      total: allStats.total,
      success: allStats.success,
      failed: allStats.failed,
      retrying: allStats.retrying,
      last24Hours: {
        total: last24HoursStats.total,
        success: last24HoursStats.success,
        failed: last24HoursStats.failed,
      },
      last7Days: {
        total: last7DaysStats.total,
        success: last7DaysStats.success,
        failed: last7DaysStats.failed,
      },
      last30Days: {
        total: last30DaysStats.total,
        success: last30DaysStats.success,
        failed: last30DaysStats.failed,
      }
    }

    return {
      success: true,
      stats
    }

  } catch (error: any) {
    console.error('Get log stats error:', error)
    throw new functions.https.HttpsError(
      'internal',
      `Failed to get log stats: ${error.message}`
    )
  }
})

// 日別実行ログ統計（グラフ用）
export const getDailyLogStats = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required'
    )
  }

  const userId = context.auth.uid
  const { days = 7 }: { days?: number } = data

  try {
    const now = admin.firestore.Timestamp.now()
    const startDate = admin.firestore.Timestamp.fromMillis(
      now.toMillis() - (days * 24 * 60 * 60 * 1000)
    )

    const logsQuery = db.collection('executionLogs')
      .where('userId', '==', userId)
      .where('executedAt', '>=', startDate)
      .orderBy('executedAt', 'asc')

    const logsSnapshot = await logsQuery.get()
    const logs = logsSnapshot.docs.map(doc => doc.data())

    // 日別に集計
    const dailyStats: Record<string, { date: string; success: number; failed: number; total: number }> = {}

    logs.forEach(log => {
      const date = new Date(log.executedAt.toMillis())
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD形式

      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          success: 0,
          failed: 0,
          total: 0
        }
      }

      dailyStats[dateKey].total++
      if (log.status === 'success') {
        dailyStats[dateKey].success++
      } else if (log.status === 'failed') {
        dailyStats[dateKey].failed++
      }
    })

    // 日付順でソート
    const sortedStats = Object.values(dailyStats).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return {
      success: true,
      dailyStats: sortedStats
    }

  } catch (error: any) {
    console.error('Get daily log stats error:', error)
    throw new functions.https.HttpsError(
      'internal',
      `Failed to get daily log stats: ${error.message}`
    )
  }
})