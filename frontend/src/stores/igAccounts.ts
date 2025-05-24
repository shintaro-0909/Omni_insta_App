import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/services/firebase'

// IGアカウントの型定義
export interface IGAccount {
  id: string
  instagramUserId: string
  username: string
  name?: string
  profilePictureUrl?: string
  tokenExpiresAt: Date
  proxyId?: string
  createdAt: Date
  updatedAt: Date
}

export interface AddAccountData {
  accessToken: string
  instagramUserId: string
  username: string
}

export const useIgAccountsStore = defineStore('igAccounts', () => {
  // State
  const accounts = ref<IGAccount[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const accountsCount = computed(() => accounts.value.length)
  const accountById = computed(() => (id: string) => 
    accounts.value.find(account => account.id === id)
  )
  const accountByUsername = computed(() => (username: string) => 
    accounts.value.find(account => account.username === username)
  )

  // Actions
  const getInstagramUserInfo = async (accessToken: string) => {
    try {
      loading.value = true
      error.value = null

      const getUserInfoFn = httpsCallable(functions, 'getInstagramUserInfo')
      const result = await getUserInfoFn({ accessToken })
      const data = result.data as any

      if (data.success) {
        return data.userInfo
      } else {
        throw new Error('Failed to get Instagram user info')
      }
    } catch (err: any) {
      error.value = err.message || 'Instagram ユーザー情報の取得に失敗しました'
      console.error('Instagram ユーザー情報取得エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addAccount = async (accountData: AddAccountData) => {
    try {
      loading.value = true
      error.value = null

      const addAccountFn = httpsCallable(functions, 'addInstagramAccount')
      const result = await addAccountFn(accountData)
      const data = result.data as any

      if (data.success) {
        // アカウント一覧を再読み込み
        await loadAccounts()
        return data.accountId
      } else {
        throw new Error('Failed to add Instagram account')
      }
    } catch (err: any) {
      error.value = err.message || 'Instagram アカウントの追加に失敗しました'
      console.error('Instagram アカウント追加エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadAccounts = async () => {
    try {
      loading.value = true
      error.value = null

      const getAccountsFn = httpsCallable(functions, 'getInstagramAccounts')
      const result = await getAccountsFn({})
      const data = result.data as any

      if (data.success) {
        accounts.value = data.accounts.map((account: any) => ({
          ...account,
          tokenExpiresAt: new Date(account.tokenExpiresAt.seconds * 1000),
          createdAt: new Date(account.createdAt.seconds * 1000),
          updatedAt: new Date(account.updatedAt.seconds * 1000)
        }))
      } else {
        throw new Error('Failed to load Instagram accounts')
      }
    } catch (err: any) {
      error.value = err.message || 'Instagram アカウントの読み込みに失敗しました'
      console.error('Instagram アカウント読み込みエラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async (accountId: string) => {
    try {
      loading.value = true
      error.value = null

      const deleteAccountFn = httpsCallable(functions, 'deleteInstagramAccount')
      const result = await deleteAccountFn({ accountId })
      const data = result.data as any

      if (data.success) {
        // ローカルの一覧から削除
        accounts.value = accounts.value.filter(account => account.id !== accountId)
      } else {
        throw new Error('Failed to delete Instagram account')
      }
    } catch (err: any) {
      error.value = err.message || 'Instagram アカウントの削除に失敗しました'
      console.error('Instagram アカウント削除エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshToken = async (accountId: string) => {
    try {
      loading.value = true
      error.value = null

      const refreshTokenFn = httpsCallable(functions, 'refreshInstagramToken')
      const result = await refreshTokenFn({ accountId })
      const data = result.data as any

      if (data.success) {
        // アカウント一覧を再読み込み
        await loadAccounts()
        return data.expiresAt
      } else {
        throw new Error('Failed to refresh Instagram token')
      }
    } catch (err: any) {
      error.value = err.message || 'アクセストークンの更新に失敗しました'
      console.error('アクセストークン更新エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    accounts.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    accounts,
    loading,
    error,
    // Getters
    accountsCount,
    accountById,
    accountByUsername,
    // Actions
    getInstagramUserInfo,
    addAccount,
    loadAccounts,
    fetchAccounts: loadAccounts, // エイリアス
    deleteAccount,
    refreshToken,
    clearError,
    reset
  }
}) 