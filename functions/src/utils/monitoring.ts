/**
 * 1人運営向けシンプル監視システム
 * 運用負荷を最小限に抑えた実用的なアラート
 */

import { logger } from 'firebase-functions/v2'
import { Timestamp } from 'firebase-admin/firestore'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Firebase Admin の初期化
if (getApps().length === 0) {
  initializeApp()
}
const db = getFirestore()

// アラートレベル定義
export enum AlertLevel {
  INFO = 'INFO',       // 情報: 無視しても良い
  WARNING = 'WARNING', // 警告: 日次確認
  ERROR = 'ERROR',     // エラー: 即座に確認 (数時間以内)
  CRITICAL = 'CRITICAL' // 緊急: 即座に対応 (30分以内)
}

// 監視メトリクス
export interface MonitoringMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  level: AlertLevel
  context?: Record<string, any>
}

// シンプルアラート管理クラス
export class SimpleMonitoring {
  private static instance: SimpleMonitoring
  private alerts: MonitoringMetric[] = []
  private readonly maxAlerts = 50 // メモリ使用量制限

  public static getInstance(): SimpleMonitoring {
    if (!SimpleMonitoring.instance) {
      SimpleMonitoring.instance = new SimpleMonitoring()
    }
    return SimpleMonitoring.instance
  }

  // === 重要メトリクスの監視 ===

  // API エラー率監視
  async trackApiError(endpoint: string, error: any, userId?: string): Promise<void> {
    const metric: MonitoringMetric = {
      name: 'api_error',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      level: this.determineErrorLevel(error),
      context: {
        endpoint,
        errorMessage: error.message,
        userId: userId || 'unknown',
        errorCode: error.code || 'unknown'
      }
    }

    await this.logMetric(metric)

    // 連続エラーの検出
    const recentErrors = await this.getRecentMetrics('api_error', 5)
    if (recentErrors.length >= 3) {
      await this.sendAlert('API連続エラー', `${endpoint}で3回連続エラーが発生`, AlertLevel.ERROR)
    }
  }

  // Instagram API 制限監視
  async trackInstagramRateLimit(accountId: string, remaining: number, resetTime: Date): Promise<void> {
    const level = remaining < 10 ? AlertLevel.WARNING : AlertLevel.INFO
    
    const metric: MonitoringMetric = {
      name: 'instagram_rate_limit',
      value: remaining,
      unit: 'requests',
      timestamp: new Date(),
      level,
      context: { accountId, resetTime: resetTime.toISOString() }
    }

    await this.logMetric(metric)

    if (remaining < 5) {
      await this.sendAlert(
        'Instagram API制限', 
        `アカウント ${accountId} のAPI制限残り: ${remaining}`, 
        AlertLevel.WARNING
      )
    }
  }

  // 投稿失敗監視
  async trackPostFailure(scheduleId: string, error: any, attemptCount: number): Promise<void> {
    const level = attemptCount >= 3 ? AlertLevel.ERROR : AlertLevel.WARNING
    
    const metric: MonitoringMetric = {
      name: 'post_failure',
      value: attemptCount,
      unit: 'attempts',
      timestamp: new Date(),
      level,
      context: {
        scheduleId,
        errorMessage: error.message,
        errorCode: error.code || 'unknown'
      }
    }

    await this.logMetric(metric)

    if (attemptCount >= 3) {
      await this.sendAlert(
        '投稿失敗', 
        `スケジュール ${scheduleId} が${attemptCount}回失敗`, 
        AlertLevel.ERROR
      )
    }
  }

  // プラン制限監視
  async trackPlanLimitReached(userId: string, limitType: string, current: number, max: number): Promise<void> {
    const usage = (current / max) * 100
    const level = usage >= 100 ? AlertLevel.ERROR : usage >= 80 ? AlertLevel.WARNING : AlertLevel.INFO
    
    const metric: MonitoringMetric = {
      name: 'plan_limit',
      value: usage,
      unit: 'percent',
      timestamp: new Date(),
      level,
      context: { userId, limitType, current, max }
    }

    await this.logMetric(metric)

    if (usage >= 90) {
      await this.sendAlert(
        'プラン制限間近', 
        `ユーザー ${userId} の${limitType}が${usage.toFixed(1)}%に到達`, 
        level
      )
    }
  }

  // === ヘルパーメソッド ===

  private determineErrorLevel(error: any): AlertLevel {
    const code = error.code?.toLowerCase() || ''
    const message = error.message?.toLowerCase() || ''

    // 認証エラーは重要
    if (code.includes('auth') || code.includes('permission')) {
      return AlertLevel.ERROR
    }

    // ネットワークエラーは警告
    if (code.includes('network') || code.includes('timeout')) {
      return AlertLevel.WARNING
    }

    // バリデーションエラーは情報
    if (code.includes('invalid') || message.includes('validation')) {
      return AlertLevel.INFO
    }

    return AlertLevel.WARNING
  }

  // メトリクス記録
  private async logMetric(metric: MonitoringMetric): Promise<void> {
    try {
      // メモリ管理
      this.alerts.unshift(metric)
      if (this.alerts.length > this.maxAlerts) {
        this.alerts = this.alerts.slice(0, this.maxAlerts)
      }

      // Firestore に保存 (高レベルのみ)
      if (metric.level === AlertLevel.ERROR || metric.level === AlertLevel.CRITICAL) {
        await db.collection('monitoring').add({
          ...metric,
          timestamp: Timestamp.fromDate(metric.timestamp)
        })
      }

      // Cloud Logging
      logger.info(`[MONITORING] ${metric.name}`, {
        value: metric.value,
        unit: metric.unit,
        level: metric.level,
        context: metric.context
      })

    } catch (error) {
      // 監視システム自体のエラーは silent fail
      logger.error('Monitoring log error:', error)
    }
  }

  // 最近のメトリクス取得
  private async getRecentMetrics(metricName: string, count: number): Promise<MonitoringMetric[]> {
    return this.alerts
      .filter(alert => alert.name === metricName)
      .slice(0, count)
  }

  // アラート送信 (1人運営向けシンプル版)
  private async sendAlert(title: string, message: string, level: AlertLevel): Promise<void> {
    try {
      const alert = {
        title,
        message,
        level,
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
      }

      // 開発環境: コンソール出力
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚨 [${level}] ${title}: ${message}`)
        return
      }

      // 本番環境: メール送信 (ERROR以上のみ)
      if (level === AlertLevel.ERROR || level === AlertLevel.CRITICAL) {
        await this.sendEmailAlert(alert)
      }

      // Slack 通知 (CRITICAL のみ)
      if (level === AlertLevel.CRITICAL) {
        await this.sendSlackAlert(alert)
      }

    } catch (error) {
      logger.error('Alert sending failed:', error)
    }
  }

  // メール送信 (SendGrid 使用想定)
  private async sendEmailAlert(alert: any): Promise<void> {
    // 実装例 (実際の SendGrid 設定が必要)
    const emailEndpoint = process.env.SENDGRID_WEBHOOK_URL
    if (!emailEndpoint) return

    await fetch(emailEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: process.env.ADMIN_EMAIL,
        subject: `[Omniy Alert] ${alert.title}`,
        text: `
          レベル: ${alert.level}
          メッセージ: ${alert.message}
          時刻: ${alert.timestamp.toISOString()}
          環境: ${alert.environment}
        `
      })
    })
  }

  // Slack 通知 (Webhook 使用想定)
  private async sendSlackAlert(alert: any): Promise<void> {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL
    if (!slackWebhook) return

    await fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 *${alert.title}*`,
        attachments: [{
          color: alert.level === AlertLevel.CRITICAL ? 'danger' : 'warning',
          fields: [
            { title: 'レベル', value: alert.level, short: true },
            { title: '時刻', value: alert.timestamp.toISOString(), short: true },
            { title: 'メッセージ', value: alert.message, short: false }
          ]
        }]
      })
    })
  }

  // === 日次サマリー機能 ===
  async generateDailySummary(): Promise<string> {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    const todayAlerts = this.alerts.filter(alert => 
      alert.timestamp >= yesterday && alert.timestamp <= today
    )

    const summary = {
      total: todayAlerts.length,
      critical: todayAlerts.filter(a => a.level === AlertLevel.CRITICAL).length,
      error: todayAlerts.filter(a => a.level === AlertLevel.ERROR).length,
      warning: todayAlerts.filter(a => a.level === AlertLevel.WARNING).length,
      info: todayAlerts.filter(a => a.level === AlertLevel.INFO).length
    }

    return `
📊 Omniy 日次監視サマリー (${today.toISOString().split('T')[0]})

総アラート数: ${summary.total}
🔴 CRITICAL: ${summary.critical}
🟠 ERROR: ${summary.error}  
🟡 WARNING: ${summary.warning}
ℹ️ INFO: ${summary.info}

${summary.critical > 0 ? '⚠️ CRITICAL アラートがあります。至急確認が必要です。' : ''}
${summary.error > 0 ? '⚠️ ERROR が発生しています。確認をお願いします。' : ''}
${summary.total === 0 ? '✅ 問題は発生していません。' : ''}
    `
  }
}

// シングルトンインスタンス
export const monitoring = SimpleMonitoring.getInstance()

// === 便利なヘルパー関数 ===

export const trackError = async (context: string, error: any, userId?: string) => {
  await monitoring.trackApiError(context, error, userId)
}

export const trackSuccess = async (operation: string, duration: number) => {
  logger.info(`[SUCCESS] ${operation}`, { duration_ms: duration })
}

export const trackUserAction = async (action: string, userId: string, metadata?: any) => {
  logger.info(`[USER_ACTION] ${action}`, { userId, metadata })
}

// 日次サマリー送信 (Cloud Scheduler から呼び出し想定)
export const sendDailySummary = async () => {
  const summary = await monitoring.generateDailySummary()
  
  // メール送信
  const emailEndpoint = process.env.SENDGRID_WEBHOOK_URL
  if (emailEndpoint) {
    await fetch(emailEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: process.env.ADMIN_EMAIL,
        subject: '[Omniy] 日次監視レポート',
        text: summary
      })
    })
  }
  
  logger.info('Daily summary sent', { summary })
}