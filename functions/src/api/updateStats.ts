import * as admin from 'firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

const db = admin.firestore()

/**
 * 統計情報を更新するためのヘルパー関数
 */
export async function incrementTotalPosts(): Promise<void> {
  try {
    await db.collection('stats').doc('global').update({
      totalPosts: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp()
    })
  } catch (error) {
    // ドキュメントが存在しない場合は作成
    if (error.code === 'not-found') {
      await db.collection('stats').doc('global').set({
        totalPosts: 1,
        currentSubscribers: 0,
        serviceStartDate: FieldValue.serverTimestamp(),
        uptimePercentage: 99.9,
        lastUpdated: FieldValue.serverTimestamp()
      })
    } else {
      throw error
    }
  }
}

/**
 * アクティブユーザー数（課金者数）を更新
 */
export async function updateActiveUsers(count: number): Promise<void> {
  await db.collection('stats').doc('global').update({
    currentSubscribers: count,
    lastUpdated: FieldValue.serverTimestamp()
  })
}

/**
 * 対応サービス数を更新（新しいSNS対応時）
 */
export async function updateSupportedSNSCount(count: number): Promise<void> {
  await db.collection('stats').doc('global').update({
    supportedSNSCount: count,
    lastUpdated: FieldValue.serverTimestamp()
  })
}

/**
 * 利用可能機能数を更新（新機能追加時）
 */
export async function updateAvailableFeaturesCount(count: number): Promise<void> {
  await db.collection('stats').doc('global').update({
    availableFeaturesCount: count,
    lastUpdated: FieldValue.serverTimestamp()
  })
}

/**
 * 顧客満足度を更新（レビュー平均から算出）
 */
export async function updateCustomerSatisfaction(score: number): Promise<void> {
  await db.collection('stats').doc('global').update({
    customerSatisfactionScore: Math.round(score * 10) / 10, // 小数点以下1桁
    lastUpdated: FieldValue.serverTimestamp()
  })
}

/**
 * 稼働率を更新（日次で実行）
 */
export async function updateUptimePercentage(): Promise<void> {
  // 過去30日間のモニタリングデータから稼働率を計算
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const monitoringSnapshot = await db.collection('monitoring')
    .where('timestamp', '>=', thirtyDaysAgo)
    .where('level', 'in', ['ERROR', 'CRITICAL'])
    .get()
  
  // エラー件数から稼働率を計算（簡易版）
  // 実際の実装では、より詳細な計算が必要
  const errorCount = monitoringSnapshot.size
  const totalMinutes = 30 * 24 * 60 // 30日間の分数
  const downTimeMinutes = Math.min(errorCount * 5, totalMinutes * 0.1) // エラー1件あたり5分のダウンタイムと仮定、最大10%
  const uptimePercentage = ((totalMinutes - downTimeMinutes) / totalMinutes * 100).toFixed(1)
  
  await db.collection('stats').doc('global').update({
    uptimePercentage: parseFloat(uptimePercentage),
    lastUpdated: FieldValue.serverTimestamp()
  })
}

/**
 * 統計情報の初期化（必要に応じて実行）
 */
export async function initializeStats(): Promise<void> {
  const statsDoc = await db.collection('stats').doc('global').get()
  
  if (!statsDoc.exists) {
    await db.collection('stats').doc('global').set({
      totalPosts: 0,
      currentSubscribers: 0,
      supportedSNSCount: 1, // 現在はInstagramのみ
      availableFeaturesCount: 8, // 予約投稿、繰り返し、ランダム投稿など
      customerSatisfactionScore: 0, // 初期値（レビューがない場合）
      serviceStartDate: FieldValue.serverTimestamp(),
      lastUpdated: FieldValue.serverTimestamp()
    })
    console.log('統計情報を初期化しました')
  }
}