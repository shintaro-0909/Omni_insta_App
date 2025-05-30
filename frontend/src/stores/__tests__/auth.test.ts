import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth'

// Mock Firebase Auth
vi.mock('@/services/firebase', () => ({
  auth: {
    currentUser: null
  },
  googleProvider: {}
}))

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: class {
    addScope = vi.fn()
  },
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate no user initially
    callback(null)
    return vi.fn() // unsubscribe function
  })
}))

let unsubscribe: (() => void) | null = null

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
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
    
    // Test with user data
    authStore.user = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg'
    }
    
    expect(authStore.userDisplayName).toBe('Test User')
    expect(authStore.userEmail).toBe('test@example.com')
    expect(authStore.userPhotoURL).toBe('https://example.com/photo.jpg')
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

  describe('loginWithGoogle', () => {
    it('should login successfully with Google', async () => {
      const authStore = useAuthStore()
      
      const mockUser: Partial<User> = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      }

      vi.mocked(signInWithPopup).mockResolvedValue({
        user: mockUser as User,
        providerId: 'google.com',
        operationType: 'signIn'
      })

      await authStore.loginWithGoogle()

      expect(authStore.user).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      })
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()
    })

    it('should handle login errors', async () => {
      const authStore = useAuthStore()
      
      const loginError = new Error('Login failed')
      vi.mocked(signInWithPopup).mockRejectedValue(loginError)

      try {
        await authStore.loginWithGoogle()
      } catch (err) {
        // Expected to throw
      }

      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBe('Login failed')
    })

    it('should set loading state during login', async () => {
      const authStore = useAuthStore()
      
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve
      })
      
      vi.mocked(signInWithPopup).mockReturnValue(loginPromise)

      const loginCall = authStore.loginWithGoogle()
      
      expect(authStore.loading).toBe(true)
      
      resolveLogin!({
        user: { uid: 'test-uid', email: 'test@example.com' } as User,
        providerId: 'google.com',
        operationType: 'signIn'
      })
      
      await loginCall
      
      expect(authStore.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const authStore = useAuthStore()
      
      authStore.user = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null
      }

      vi.mocked(signOut).mockResolvedValue()

      await authStore.logout()

      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.error).toBeNull()
      expect(signOut).toHaveBeenCalled()
    })

    it('should handle logout errors', async () => {
      const authStore = useAuthStore()
      
      const logoutError = new Error('Logout failed')
      vi.mocked(signOut).mockRejectedValue(logoutError)

      try {
        await authStore.logout()
      } catch (err) {
        // Expected to throw
      }

      expect(authStore.error).toBe('Logout failed')
    })
  })

  describe('initializeAuth', () => {
    it('should set up auth state listener', () => {
      const authStore = useAuthStore()
      
      authStore.initializeAuth()

      expect(onAuthStateChanged).toHaveBeenCalled()
    })

    it('should update state when user is authenticated', () => {
      const authStore = useAuthStore()
      
      const mockAuthStateCallback = vi.fn()
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        mockAuthStateCallback.mockImplementation(callback)
        return vi.fn()
      })

      authStore.initializeAuth()

      const mockUser: Partial<User> = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      }

      mockAuthStateCallback(mockUser)

      expect(authStore.user).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      })
      expect(authStore.isAuthenticated).toBe(true)
    })
  })

  describe('authentication state persistence', () => {
    it('should persist user state across page reloads', () => {
      const authStore = useAuthStore()
      
      const mockUser: Partial<User> = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null
      }

      const mockAuthStateCallback = vi.fn()
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        mockAuthStateCallback.mockImplementation(callback)
        callback(mockUser as User)
        return vi.fn()
      })

      authStore.initializeAuth()

      expect(authStore.user).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null
      })
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should handle user logout state change', () => {
      const authStore = useAuthStore()
      
      authStore.user = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null
      }

      const mockAuthStateCallback = vi.fn()
      vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
        mockAuthStateCallback.mockImplementation(callback)
        return vi.fn()
      })

      authStore.initializeAuth()
      mockAuthStateCallback(null)

      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })
})