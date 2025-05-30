// Suppress TypeScript unused import warnings for mocks
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
/* eslint-enable @typescript-eslint/no-unused-vars */

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  firestore: {
    Timestamp: {
      fromDate: jest.fn((date) => ({ toDate: () => date })),
      serverTimestamp: jest.fn(() => 'mock-timestamp')
    },
    FieldValue: {
      serverTimestamp: jest.fn(() => 'mock-timestamp')
    }
  }
}))

// Mock Firebase Functions
jest.mock('firebase-functions', () => ({
  https: {
    onCall: jest.fn((handler) => handler),
    HttpsError: class HttpsError extends Error {
      constructor(public code: string, public message: string) {
        super(message)
        this.name = 'HttpsError'
      }
    }
  }
}))

// Mock fetch
global.fetch = jest.fn()

// Mock the db from index
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  add: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  batch: jest.fn(() => ({
    delete: jest.fn(),
    commit: jest.fn()
  }))
}

jest.mock('../index', () => ({
  db: mockDb
}))

// Mock planLimits
jest.mock('../utils/planLimits', () => ({
  canAddInstagramAccount: jest.fn().mockResolvedValue({
    allowed: true,
    currentCount: 0,
    limit: 10
  })
}))

// Import functions after mocks
const { 
  getInstagramUserInfo, 
  addInstagramAccount, 
  getInstagramAccounts, 
  deleteInstagramAccount, 
  refreshInstagramToken 
} = require('../api/igAccounts')
const { canAddInstagramAccount } = require('../utils/planLimits')

describe('Instagram Accounts API', () => {
  let mockContext: any
  let mockData: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockContext = {
      auth: {
        uid: 'test-user-id'
      }
    }

    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'mock-response' })
    })

    // Reset mock chain
    mockDb.collection.mockReturnValue(mockDb)
    mockDb.doc.mockReturnValue(mockDb)
    mockDb.where.mockReturnValue(mockDb)
    mockDb.orderBy.mockReturnValue(mockDb)
  })

  describe('getInstagramUserInfo', () => {
    it('should get Instagram user info successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'ig-user-123',
          username: 'testuser'
        })
      })

      const result = await getInstagramUserInfo({ accessToken: 'test-token' }, mockContext)

      expect(result).toEqual({
        success: true,
        userInfo: {
          instagramUserId: 'ig-user-123',
          username: 'testuser'
        }
      })
    })

    it('should throw error when not authenticated', async () => {
      mockContext.auth = null

      await expect(getInstagramUserInfo({ accessToken: 'test-token' }, mockContext)).rejects.toThrow(
        'Authentication required'
      )
    })
  })

  describe('addInstagramAccount', () => {
    it('should add Instagram account successfully', async () => {
      const mockDocRef = { id: 'new-account-id' }
      
      // Mock duplicate check - no existing account
      mockDb.get.mockResolvedValue({ empty: true })
      mockDb.add.mockResolvedValue(mockDocRef)

      const result = await addInstagramAccount({
        accessToken: 'test-token',
        instagramUserId: 'ig-user-123',
        username: 'testuser'
      }, mockContext)

      expect(result).toEqual({
        success: true,
        accountId: 'new-account-id',
        message: 'Instagram account added successfully'
      })
    })

    it('should throw error when plan limit exceeded', async () => {
      canAddInstagramAccount.mockResolvedValue({
        allowed: false,
        currentCount: 10,
        limit: 10,
        reason: 'Account limit reached'
      })

      await expect(addInstagramAccount({
        accessToken: 'test-token',
        instagramUserId: 'ig-user-123',
        username: 'testuser'
      }, mockContext)).rejects.toThrow(
        'Instagram account limit exceeded'
      )
    })
  })

  describe('getInstagramAccounts', () => {
    it('should get Instagram accounts successfully', async () => {
      const mockAccounts = [
        { 
          id: 'account-1', 
          data: () => ({ 
            instagramUserId: 'ig-user-1',
            username: 'user1',
            tokenExpiresAt: { toDate: () => new Date() }
          }) 
        }
      ]

      mockDb.get.mockResolvedValue({
        docs: mockAccounts,
        empty: false
      })

      const result = await getInstagramAccounts({}, mockContext)

      expect(result.success).toBe(true)
      expect(result.accounts).toHaveLength(1)
      expect(result.accounts[0]).not.toHaveProperty('accessToken')
    })
  })

  describe('deleteInstagramAccount', () => {
    it('should delete Instagram account successfully', async () => {
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn()
      }
      mockDb.batch.mockReturnValue(mockBatch)

      // Mock account exists
      mockDb.get.mockResolvedValueOnce({ exists: true })
      // Mock no active schedules
      mockDb.get.mockResolvedValueOnce({ empty: true })
      // Mock schedules and logs for deletion
      mockDb.get.mockResolvedValueOnce({ docs: [] })
      mockDb.get.mockResolvedValueOnce({ docs: [] })

      const result = await deleteInstagramAccount({ accountId: 'account-123' }, mockContext)

      expect(result).toEqual({
        success: true,
        message: 'Instagram account deleted successfully'
      })
    })

    it('should throw error when account not found', async () => {
      mockDb.get.mockResolvedValue({ exists: false })

      await expect(deleteInstagramAccount({ accountId: 'account-123' }, mockContext)).rejects.toThrow(
        'Instagram account not found'
      )
    })
  })

  describe('refreshInstagramToken', () => {
    it('should refresh token successfully', async () => {
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({
          accessToken: 'old-token'
        })
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-token',
          expires_in: 5184000
        })
      })

      mockDb.update.mockResolvedValue({})

      const result = await refreshInstagramToken({ accountId: 'account-123' }, mockContext)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Access token refreshed successfully')
    })
  })
})