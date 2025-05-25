import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

// Mock Firebase Auth
vi.mock('@/services/firebase', () => ({
  auth: {
    currentUser: null
  }
}))

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate no user initially
    callback(null)
    return vi.fn() // unsubscribe function
  })
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with correct default state', () => {
    const authStore = useAuthStore()
    
    expect(authStore.user).toBe(null)
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBe(null)
  })

  it('computed properties work correctly', () => {
    const authStore = useAuthStore()
    
    expect(authStore.userDisplayName).toBe('')
    expect(authStore.userEmail).toBe('')
    expect(authStore.userPhotoURL).toBe('')
  })

  it('can clear error', () => {
    const authStore = useAuthStore()
    
    // Set an error
    authStore.error = 'Test error'
    expect(authStore.error).toBe('Test error')
    
    // Clear the error
    authStore.clearError()
    expect(authStore.error).toBe(null)
  })
})