import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth'
import { auth } from '@/services/firebase'
import { measureAsync } from '@/utils/performance'

export const useAuthStore = defineStore('auth', () => {
  // State - use shallowRef for better performance with large objects
  const user = shallowRef<User | null>(null)
  const isInitialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Cached session info to avoid repeated computations
  const cachedSessionInfo = ref<any>(null)
  const lastTokenRefresh = ref<number>(0)

  // Getters with memoization
  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.displayName || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => user.value?.photoURL || '')

  // Actions
  const initializeAuth = async () => {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
        isInitialized.value = true
        
        // 認証状態の変更をログ出力
        if (firebaseUser) {
          console.log('🔐 認証状態: ログイン済み -', firebaseUser.email)
        } else {
          console.log('🔓 認証状態: 未ログイン')
        }
        
        unsubscribe()
        resolve()
      })
    })
  }

  const loginWithGoogle = async () => {
    return measureAsync('auth-google-login', async () => {
      try {
        loading.value = true
        error.value = null
        
        const provider = new GoogleAuthProvider()
        provider.addScope('email')
        provider.addScope('profile')
        
        const result = await signInWithPopup(auth, provider)
        user.value = result.user
        
        // Cache session info immediately
        updateCachedSessionInfo()
        
        console.log('✅ Google認証成功:', result.user.displayName)
      } catch (err: any) {
        error.value = err.message || 'ログインに失敗しました'
        console.error('❌ Google認証エラー:', err)
        throw err
      } finally {
        loading.value = false
      }
    })
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      
      await signOut(auth)
      user.value = null
      
      console.log('✅ ログアウト成功')
    } catch (err: any) {
      error.value = err.message || 'ログアウトに失敗しました'
      console.error('❌ ログアウトエラー:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Helper function to update cached session info
  const updateCachedSessionInfo = () => {
    if (!user.value) {
      cachedSessionInfo.value = null
      return
    }
    
    cachedSessionInfo.value = {
      uid: user.value.uid,
      email: user.value.email,
      displayName: user.value.displayName,
      photoURL: user.value.photoURL,
      emailVerified: user.value.emailVerified,
      creationTime: user.value.metadata.creationTime,
      lastSignInTime: user.value.metadata.lastSignInTime
    }
  }

  // ユーザートークンを取得 (with caching for performance)
  const getUserToken = async (forceRefresh = false) => {
    if (!user.value) {
      throw new Error('ユーザーがログインしていません')
    }
    
    // Check if we need to refresh token (every 30 minutes)
    const now = Date.now()
    const shouldRefresh = forceRefresh || (now - lastTokenRefresh.value > 30 * 60 * 1000)
    
    try {
      const token = await user.value.getIdToken(shouldRefresh)
      if (shouldRefresh) {
        lastTokenRefresh.value = now
      }
      return token
    } catch (err: any) {
      error.value = 'トークンの取得に失敗しました'
      throw err
    }
  }

  // ユーザートークンを強制更新
  const refreshUserToken = async () => {
    if (!user.value) {
      throw new Error('ユーザーがログインしていません')
    }
    
    return measureAsync('auth-token-refresh', async () => {
      try {
        const token = await user.value!.getIdToken(true) // forceRefresh = true
        lastTokenRefresh.value = Date.now()
        console.log('🔄 ユーザートークンを更新しました')
        return token
      } catch (err: any) {
        error.value = 'トークンの更新に失敗しました'
        throw err
      }
    })
  }

  // セッション情報を取得 (cached for performance)
  const getSessionInfo = () => {
    if (!user.value) return null
    
    // Return cached info if available and user hasn't changed
    if (cachedSessionInfo.value && cachedSessionInfo.value.uid === user.value.uid) {
      return cachedSessionInfo.value
    }
    
    // Update cache and return
    updateCachedSessionInfo()
    return cachedSessionInfo.value
  }

  // 認証状態をリアルタイム監視（永続化）
  const watchAuthState = () => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      
      // Update cached session info when user changes
      updateCachedSessionInfo()
      
      if (firebaseUser) {
        console.log('🔐 認証状態変更: ログイン -', firebaseUser.email)
      } else {
        console.log('🔓 認証状態変更: ログアウト')
        // Clear cache on logout
        cachedSessionInfo.value = null
        lastTokenRefresh.value = 0
      }
    })
  }

  return {
    // State
    user,
    isInitialized,
    loading,
    error,
    // Getters
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    // Actions
    initializeAuth,
    loginWithGoogle,
    logout,
    clearError,
    getUserToken,
    refreshUserToken,
    getSessionInfo,
    watchAuthState
  }
}) 