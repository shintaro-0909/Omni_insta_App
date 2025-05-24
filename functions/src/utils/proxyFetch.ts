import { HttpsProxyAgent } from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'
import fetch from 'node-fetch'
import * as admin from 'firebase-admin'

// プロキシ設定の型定義
export interface ProxyConfig {
  id: string
  host: string
  port: number
  protocol: 'http' | 'https' | 'socks5'
  username?: string
  password?: string
  isActive: boolean
}

// プロキシエージェントキャッシュ
const agentCache = new Map<string, any>()

/**
 * プロキシエージェントを作成
 */
export function createProxyAgent(proxy: ProxyConfig) {
  const cacheKey = `${proxy.protocol}://${proxy.host}:${proxy.port}`
  
  // キャッシュから取得
  if (agentCache.has(cacheKey)) {
    return agentCache.get(cacheKey)
  }

  let agent: any

  try {
    if (proxy.protocol === 'socks5') {
      // SOCKS5プロキシ
      const proxyUrl = proxy.username && proxy.password
        ? `socks5://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
        : `socks5://${proxy.host}:${proxy.port}`
      
      agent = new SocksProxyAgent(proxyUrl)
    } else {
      // HTTP/HTTPSプロキシ
      const proxyUrl = proxy.username && proxy.password
        ? `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
        : `${proxy.protocol}://${proxy.host}:${proxy.port}`
      
      agent = new HttpsProxyAgent(proxyUrl)
    }

    // キャッシュに保存
    agentCache.set(cacheKey, agent)
    
    console.log(`✅ プロキシエージェント作成: ${proxy.protocol}://${proxy.host}:${proxy.port}`)
    return agent
  } catch (error) {
    console.error(`❌ プロキシエージェント作成エラー:`, error)
    throw new Error(`プロキシエージェントの作成に失敗しました: ${error}`)
  }
}

/**
 * プロキシ経由でHTTPリクエストを実行
 */
export async function proxyFetch(
  url: string,
  proxy: ProxyConfig | null,
  options: any = {}
): Promise<any> {
  // プロキシがない場合は直接リクエスト
  if (!proxy) {
    console.log(`🌐 直接リクエスト: ${url}`)
    return await directFetch(url, options)
  }

  if (!proxy.isActive) {
    throw new Error('プロキシが非アクティブです')
  }

  try {
    const agent = createProxyAgent(proxy)
    
    // URLパラメータの処理
    let finalUrl = url
    if (options.params) {
      const urlParams = new URLSearchParams(options.params)
      finalUrl = `${url}?${urlParams.toString()}`
    }
    
    const fetchOptions: any = {
      method: options.method || 'GET',
      agent,
      timeout: options.timeout || 30000,
      headers: {
        'User-Agent': 'Omniy/1.0 (Instagram Scheduler)',
        ...options.headers
      }
    }

    // POST/PUT リクエストの場合はbodyを追加
    if (options.body) {
      fetchOptions.body = options.body
    }

    console.log(`🌐 プロキシ経由リクエスト: ${finalUrl} via ${proxy.host}:${proxy.port}`)
    
    const response = await fetch(finalUrl, fetchOptions)
    
    const data = await response.json()
    
    if (!response.ok || data.error) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return data
  } catch (error: any) {
    console.error(`❌ プロキシフェッチエラー:`, {
      url,
      proxy: `${proxy.host}:${proxy.port}`,
      error: error.message
    })
    throw error
  }
}

/**
 * 直接HTTPリクエストを実行（プロキシなし）
 */
async function directFetch(url: string, options: any = {}): Promise<any> {
  try {
    // URLパラメータの処理
    let finalUrl = url
    if (options.params) {
      const urlParams = new URLSearchParams(options.params)
      finalUrl = `${url}?${urlParams.toString()}`
    }
    
    const fetchOptions: any = {
      method: options.method || 'GET',
      timeout: options.timeout || 30000,
      headers: {
        'User-Agent': 'Omniy/1.0 (Instagram Scheduler)',
        ...options.headers
      }
    }

    // POST/PUT リクエストの場合はbodyを追加
    if (options.body) {
      fetchOptions.body = options.body
    }
    
    const response = await fetch(finalUrl, fetchOptions)
    const data = await response.json()
    
    if (!response.ok || data.error) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return data
  } catch (error: any) {
    console.error(`❌ 直接フェッチエラー:`, { url, error: error.message })
    throw error
  }
}

/**
 * プロキシの接続テスト
 */
export async function testProxyConnection(proxy: ProxyConfig): Promise<{
  success: boolean
  responseTime: number
  error?: string
}> {
  const startTime = Date.now()
  
  try {
    // テスト用エンドポイント（HTTPBinのIPエンドポイント）
    const testUrl = 'http://httpbin.org/ip'
    
    const response = await proxyFetch(testUrl, proxy, {
      timeout: 10000
    })
    
    const data = await response.json()
    const responseTime = Date.now() - startTime
    
    console.log(`✅ プロキシテスト成功:`, {
      proxy: `${proxy.host}:${proxy.port}`,
      responseTime,
      ip: data.origin
    })

    return {
      success: true,
      responseTime
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    
    console.error(`❌ プロキシテスト失敗:`, {
      proxy: `${proxy.host}:${proxy.port}`,
      error: error.message,
      responseTime
    })

    return {
      success: false,
      responseTime,
      error: error.message
    }
  }
}

/**
 * 複数プロキシの中から最適なものを選択
 */
export function selectBestProxy(proxies: ProxyConfig[]): ProxyConfig | null {
  // アクティブなプロキシのみをフィルター
  const activeProxies = proxies.filter(proxy => proxy.isActive)
  
  if (activeProxies.length === 0) {
    console.warn('⚠️ アクティブなプロキシがありません')
    return null
  }

  // ランダムに選択（将来的には応答時間やロードバランシングを考慮）
  const randomIndex = Math.floor(Math.random() * activeProxies.length)
  const selectedProxy = activeProxies[randomIndex]
  
  console.log(`🎯 プロキシ選択: ${selectedProxy.host}:${selectedProxy.port}`)
  return selectedProxy
}

/**
 * プロキシローテーション機能
 */
export class ProxyRotator {
  private proxies: ProxyConfig[]
  private currentIndex = 0

  constructor(proxies: ProxyConfig[]) {
    this.proxies = proxies.filter(proxy => proxy.isActive)
  }

  /**
   * 次のプロキシを取得
   */
  getNext(): ProxyConfig | null {
    if (this.proxies.length === 0) {
      return null
    }

    const proxy = this.proxies[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length
    
    console.log(`🔄 プロキシローテーション: ${proxy.host}:${proxy.port}`)
    return proxy
  }

  /**
   * プロキシリストを更新
   */
  updateProxies(proxies: ProxyConfig[]) {
    this.proxies = proxies.filter(proxy => proxy.isActive)
    this.currentIndex = 0
  }

  /**
   * 利用可能なプロキシ数を取得
   */
  getAvailableCount(): number {
    return this.proxies.length
  }
}

/**
 * Instagram Graph API用のプロキシフェッチ
 */
export async function instagramProxyFetch(
  url: string,
  proxy: ProxyConfig,
  accessToken: string,
  options: any = {}
): Promise<any> {
  const fetchOptions = {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  return proxyFetch(url, proxy, fetchOptions)
}

/**
 * プロキシヘルスチェック
 */
export async function performProxyHealthCheck(proxies: ProxyConfig[]): Promise<{
  healthy: ProxyConfig[]
  unhealthy: ProxyConfig[]
}> {
  console.log(`🏥 プロキシヘルスチェック開始: ${proxies.length}台`)
  
  const results = await Promise.allSettled(
    proxies.map(async (proxy) => {
      const result = await testProxyConnection(proxy)
      return { proxy, ...result }
    })
  )

  const healthy: ProxyConfig[] = []
  const unhealthy: ProxyConfig[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      healthy.push(proxies[index])
    } else {
      unhealthy.push(proxies[index])
    }
  })

  console.log(`✅ ヘルスチェック完了: 正常 ${healthy.length}台, 異常 ${unhealthy.length}台`)
  
  return { healthy, unhealthy }
}

/**
 * プロキシ使用量の記録
 */
export class ProxyUsageTracker {
  private usage = new Map<string, {
    requestCount: number
    totalResponseTime: number
    errorCount: number
    lastUsed: Date
  }>()

  /**
   * プロキシ使用を記録
   */
  recordUsage(
    proxyId: string, 
    responseTime: number, 
    isSuccess: boolean
  ) {
    const current = this.usage.get(proxyId) || {
      requestCount: 0,
      totalResponseTime: 0,
      errorCount: 0,
      lastUsed: new Date()
    }

    current.requestCount++
    current.totalResponseTime += responseTime
    current.lastUsed = new Date()
    
    if (!isSuccess) {
      current.errorCount++
    }

    this.usage.set(proxyId, current)
  }

  /**
   * プロキシ統計を取得
   */
  getStats(proxyId: string) {
    const data = this.usage.get(proxyId)
    if (!data) return null

    return {
      requestCount: data.requestCount,
      avgResponseTime: data.totalResponseTime / data.requestCount,
      errorRate: data.errorCount / data.requestCount,
      lastUsed: data.lastUsed
    }
  }

  /**
   * 全プロキシの統計を取得
   */
  getAllStats() {
    const stats: Record<string, any> = {}
    
    for (const [proxyId, data] of this.usage.entries()) {
      stats[proxyId] = {
        requestCount: data.requestCount,
        avgResponseTime: data.totalResponseTime / data.requestCount,
        errorRate: data.errorCount / data.requestCount,
        lastUsed: data.lastUsed
      }
    }

    return stats
  }
}

// グローバルプロキシ使用量トラッカー
export const globalProxyTracker = new ProxyUsageTracker()

/**
 * アカウントのプロキシ設定を取得
 */
export async function getAccountProxyConfig(userId: string, igAccountId: string): Promise<ProxyConfig | null> {
  try {
    const db = admin.firestore()
    
    // IGアカウントのプロキシ設定を確認
    const igAccountDoc = await db
      .collection("users")
      .doc(userId)
      .collection("igAccounts")
      .doc(igAccountId)
      .get()

    if (!igAccountDoc.exists) {
      console.warn(`IGアカウントが見つかりません: ${igAccountId}`)
      return null
    }

    const igAccountData = igAccountDoc.data()!
    const proxyId = igAccountData.proxyId

    if (!proxyId) {
      console.log(`プロキシが設定されていません: ${igAccountId}`)
      return null
    }

    // プロキシ設定を取得
    const proxyDoc = await db
      .collection("users")
      .doc(userId)
      .collection("proxies")
      .doc(proxyId)
      .get()

    if (!proxyDoc.exists) {
      console.warn(`プロキシが見つかりません: ${proxyId}`)
      return null
    }

    const proxyData = proxyDoc.data()!
    const proxyConfig: ProxyConfig = {
      id: proxyDoc.id,
      host: proxyData.host,
      port: proxyData.port,
      protocol: proxyData.protocol,
      username: proxyData.username,
      password: proxyData.password,
      isActive: proxyData.isActive
    }

    console.log(`✅ プロキシ設定取得: ${proxyConfig.host}:${proxyConfig.port} for ${igAccountId}`)
    return proxyConfig

  } catch (error: any) {
    console.error(`❌ プロキシ設定取得エラー:`, error)
    return null
  }
}