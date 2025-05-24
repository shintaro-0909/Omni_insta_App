import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'

// プロキシタイプ定義
export interface Proxy {
  id: string
  name: string
  host: string
  port: number
  username?: string
  password?: string
  protocol: 'http' | 'https' | 'socks5'
  isActive: boolean
  lastUsed?: Date
  responseTime?: number
  location?: string
  provider?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProxyGroup {
  id: string
  name: string
  description: string
  proxyIds: string[]
  rotationInterval: number // 分単位
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProxyStats {
  total: number
  active: number
  failed: number
  avgResponseTime: number
}

export const useProxiesStore = defineStore('proxies', () => {
  // State
  const proxies = ref<Proxy[]>([])
  const proxyGroups = ref<ProxyGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeProxies = computed(() => 
    proxies.value.filter(proxy => proxy.isActive)
  )

  const failedProxies = computed(() => 
    proxies.value.filter(proxy => !proxy.isActive)
  )

  const proxyStats = computed((): ProxyStats => ({
    total: proxies.value.length,
    active: activeProxies.value.length,
    failed: failedProxies.value.length,
    avgResponseTime: proxies.value.length > 0 
      ? proxies.value.reduce((sum, proxy) => sum + (proxy.responseTime || 0), 0) / proxies.value.length
      : 0
  }))

  const getProxyById = computed(() => (id: string) => 
    proxies.value.find(proxy => proxy.id === id)
  )

  const getProxyGroupById = computed(() => (id: string) => 
    proxyGroups.value.find(group => group.id === id)
  )

  // Actions

  // プロキシ一覧取得
  const fetchProxies = async () => {
    try {
      loading.value = true
      error.value = null

      const functions = getFunctions()
      const getProxiesFunc = httpsCallable(functions, 'getProxies')
      const result = await getProxiesFunc()
      
      if (result.data && (result.data as any).success) {
        const data = result.data as any
        proxies.value = data.proxies.map((proxy: any) => ({
          ...proxy,
          createdAt: proxy.createdAt.toDate ? proxy.createdAt.toDate() : new Date(proxy.createdAt),
          updatedAt: proxy.updatedAt.toDate ? proxy.updatedAt.toDate() : new Date(proxy.updatedAt),
          lastTestedAt: proxy.lastTestedAt ? 
            (proxy.lastTestedAt.toDate ? proxy.lastTestedAt.toDate() : new Date(proxy.lastTestedAt)) : 
            undefined
        }))
        console.log('✅ プロキシ一覧取得成功:', proxies.value.length)
      } else {
        throw new Error('Failed to fetch proxies')
      }
    } catch (err: any) {
      error.value = err.message || 'プロキシ一覧の取得に失敗しました'
      console.error('❌ プロキシ一覧取得エラー:', err)
    } finally {
      loading.value = false
    }
  }

  // プロキシ作成
  const createProxy = async (proxyData: Omit<Proxy, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true
      error.value = null

      const functions = getFunctions()
      const createProxyFunc = httpsCallable(functions, 'createProxy')
      const result = await createProxyFunc(proxyData)
      
      if (result.data && (result.data as any).success) {
        const data = result.data as any
        const newProxy: Proxy = {
          ...data.proxy,
          createdAt: data.proxy.createdAt.toDate ? data.proxy.createdAt.toDate() : new Date(data.proxy.createdAt),
          updatedAt: data.proxy.updatedAt.toDate ? data.proxy.updatedAt.toDate() : new Date(data.proxy.updatedAt)
        }
        
        proxies.value.unshift(newProxy)
        console.log('✅ プロキシ作成成功:', newProxy.name)
        
        return newProxy
      } else {
        throw new Error('Failed to create proxy')
      }
    } catch (err: any) {
      error.value = err.message || 'プロキシの作成に失敗しました'
      console.error('❌ プロキシ作成エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // プロキシ更新
  const updateProxy = async (proxyId: string, updates: Partial<Proxy>) => {
    try {
      loading.value = true
      error.value = null

      const functions = getFunctions()
      const updateProxyFunc = httpsCallable(functions, 'updateProxy')
      const result = await updateProxyFunc({ proxyId, ...updates })
      
      if (result.data && (result.data as any).success) {
        const data = result.data as any
        const updatedProxy: Proxy = {
          ...data.proxy,
          createdAt: data.proxy.createdAt.toDate ? data.proxy.createdAt.toDate() : new Date(data.proxy.createdAt),
          updatedAt: data.proxy.updatedAt.toDate ? data.proxy.updatedAt.toDate() : new Date(data.proxy.updatedAt),
          lastTestedAt: data.proxy.lastTestedAt ? 
            (data.proxy.lastTestedAt.toDate ? data.proxy.lastTestedAt.toDate() : new Date(data.proxy.lastTestedAt)) : 
            undefined
        }
        
        const index = proxies.value.findIndex(proxy => proxy.id === proxyId)
        if (index !== -1) {
          proxies.value[index] = updatedProxy
          console.log('✅ プロキシ更新成功:', updatedProxy.name)
        }
        
        return updatedProxy
      } else {
        throw new Error('Failed to update proxy')
      }
    } catch (err: any) {
      error.value = err.message || 'プロキシの更新に失敗しました'
      console.error('❌ プロキシ更新エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // プロキシ削除
  const deleteProxy = async (proxyId: string) => {
    try {
      loading.value = true
      error.value = null

      const functions = getFunctions()
      const deleteProxyFunc = httpsCallable(functions, 'deleteProxy')
      const result = await deleteProxyFunc({ proxyId })
      
      if (result.data && (result.data as any).success) {
        const index = proxies.value.findIndex(proxy => proxy.id === proxyId)
        if (index !== -1) {
          const deletedProxy = proxies.value.splice(index, 1)[0]
          console.log('✅ プロキシ削除成功:', deletedProxy.name)
        }
      } else {
        throw new Error('Failed to delete proxy')
      }
    } catch (err: any) {
      error.value = err.message || 'プロキシの削除に失敗しました'
      console.error('❌ プロキシ削除エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // プロキシテスト
  const testProxy = async (proxyId: string) => {
    try {
      const proxy = getProxyById.value(proxyId)
      if (!proxy) throw new Error('プロキシが見つかりません')

      const functions = getFunctions()
      const testProxyFunc = httpsCallable(functions, 'testProxy')
      const result = await testProxyFunc({ proxyId })
      
      if (result.data && (result.data as any).success) {
        const data = result.data as any
        const isActive = data.status === 'working'
        const responseTime = data.responseTime
        
        await updateProxy(proxyId, {
          isActive,
          responseTime,
          lastUsed: new Date()
        })

        console.log(`✅ プロキシテスト完了: ${proxy.name} - ${isActive ? '成功' : '失敗'}`)
        return { isActive, responseTime }
      } else {
        throw new Error('Failed to test proxy')
      }
    } catch (err: any) {
      error.value = err.message || 'プロキシのテストに失敗しました'
      console.error('❌ プロキシテストエラー:', err)
      throw err
    }
  }

  // 全プロキシテスト
  const testAllProxies = async () => {
    try {
      loading.value = true
      console.log('🔍 全プロキシテスト開始...')
      
      const testPromises = proxies.value.map(proxy => 
        testProxy(proxy.id).catch(err => {
          console.error(`プロキシテスト失敗: ${proxy.name}`, err)
          return { isActive: false, responseTime: 0 }
        })
      )
      
      await Promise.all(testPromises)
      console.log('✅ 全プロキシテスト完了')
      
    } catch (err: any) {
      error.value = err.message || '全プロキシテストに失敗しました'
      console.error('❌ 全プロキシテストエラー:', err)
    } finally {
      loading.value = false
    }
  }

  // プロキシグループ関連メソッド
  const fetchProxyGroups = async () => {
    try {
      // TODO: バックエンドAPIを呼び出し
      proxyGroups.value = [
        {
          id: '1',
          name: 'US グループ',
          description: 'アメリカ地域のプロキシ',
          proxyIds: ['1'],
          rotationInterval: 30,
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        }
      ]
    } catch (err: any) {
      error.value = err.message || 'プロキシグループの取得に失敗しました'
      console.error('❌ プロキシグループ取得エラー:', err)
    }
  }

  // エラークリア
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    proxies,
    proxyGroups,
    loading,
    error,
    // Getters
    activeProxies,
    failedProxies,
    proxyStats,
    getProxyById,
    getProxyGroupById,
    // Actions
    fetchProxies,
    createProxy,
    updateProxy,
    deleteProxy,
    testProxy,
    testAllProxies,
    fetchProxyGroups,
    clearError
  }
})