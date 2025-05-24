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
    clearError
  }
}) 