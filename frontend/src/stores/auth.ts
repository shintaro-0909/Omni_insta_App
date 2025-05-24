import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth'
import { auth } from '@/services/firebase'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isInitialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
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
    try {
      loading.value = true
      error.value = null
      
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      const result = await signInWithPopup(auth, provider)
      user.value = result.user
      
      console.log('✅ Google認証成功:', result.user.displayName)
    } catch (err: any) {
      error.value = err.message || 'ログインに失敗しました'
      console.error('❌ Google認証エラー:', err)
      throw err
    } finally {
      loading.value = false
    }
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

  // ユーザートークンを取得
  const getUserToken = async () => {
    if (!user.value) {
      throw new Error('ユーザーがログインしていません')
    }
    
    try {
      const token = await user.value.getIdToken()
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
    
    try {
      const token = await user.value.getIdToken(true) // forceRefresh = true
      console.log('🔄 ユーザートークンを更新しました')
      return token
    } catch (err: any) {
      error.value = 'トークンの更新に失敗しました'
      throw err
    }
  }

  // セッション情報を取得
  const getSessionInfo = () => {
    if (!user.value) return null
    
    return {
      uid: user.value.uid,
      email: user.value.email,
      displayName: user.value.displayName,
      photoURL: user.value.photoURL,
      emailVerified: user.value.emailVerified,
      creationTime: user.value.metadata.creationTime,
      lastSignInTime: user.value.metadata.lastSignInTime
    }
  }

  // 認証状態をリアルタイム監視（永続化）
  const watchAuthState = () => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      
      if (firebaseUser) {
        console.log('🔐 認証状態変更: ログイン -', firebaseUser.email)
      } else {
        console.log('🔓 認証状態変更: ログアウト')
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