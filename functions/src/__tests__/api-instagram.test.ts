import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      add: jest.fn()
    }))
  })),
  FieldValue: {
    serverTimestamp: jest.fn(() => 'mock-timestamp'),
    increment: jest.fn((value) => value)
  }
}))

// Mock Firebase Functions
jest.mock('firebase-functions', () => ({
  https: {
    onCall: jest.fn((handler) => handler),
    HttpsError: class HttpsError extends Error {
      constructor(public code: string, public message: string) {
        super(message)
      }
    }
  },
  config: jest.fn(() => ({}))
}))

// Mock the index file
jest.mock('../index', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
          }))
        })),
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }))
    })),
    runTransaction: jest.fn()
  }
}))

// Mock fetch
global.fetch = jest.fn()

// Mock utils
jest.mock('../utils/planLimits', () => ({
  canExecutePostForAccount: jest.fn().mockResolvedValue(true),
  incrementPostUsageForAccount: jest.fn().mockResolvedValue(true),
  getUserPlanLimits: jest.fn().mockResolvedValue({
    instagramAccountLimit: 10,
    monthlyPostLimit: 1000,
    dailyPostLimitPerAccount: 50
  })
}))

jest.mock('../utils/proxyFetch', () => ({
  proxyFetch: jest.fn(() => jest.fn()),
  getAccountProxyConfig: jest.fn()
}))

// Import after mocks
const { refreshInstagramToken, uploadInstagramMedia, testInstagramPost, deleteInstagramPost } = require('../api/instagram')
const { canExecutePostForAccount, incrementPostUsageForAccount } = require('../utils/planLimits')
const { proxyFetch } = require('../utils/proxyFetch')

describe('Instagram API', () => {
  let mockContext: any
  let mockData: any
  let mockDb: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockContext = {
      auth: {
        uid: 'test-user-id',
        token: {}
      }
    }

    mockData = {
      igAccountId: 'ig-account-1'
    }

    // Setup default fetch response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'mock-response' })
    })

    // Setup mock db
    mockDb = require('../index').db
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('refreshInstagramToken', () => {
    it('should refresh token successfully', async () => {
      // Mock account exists
      mockDb.collection().doc().collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          accessToken: 'old-token'
        })
      })

      // Mock successful token refresh
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-token',
          expires_in: 5184000
        })
      })

      const result = await refreshInstagramToken(mockData, mockContext)

      expect(result).toEqual({ 
        success: true,
        message: 'Token refreshed successfully'
      })
      
      // Verify token was updated
      expect(mockDb.collection().doc().collection().doc().update).toHaveBeenCalledWith({
        accessToken: 'new-token',
        tokenExpiresAt: expect.any(Object),
        updatedAt: expect.any(Object)
      })
    })

    it('should throw error when not authenticated', async () => {
      mockContext.auth = null

      await expect(refreshInstagramToken(mockData, mockContext)).rejects.toThrow(
        'Authentication required'
      )
    })

    it('should throw error when account not found', async () => {
      mockDb.collection().doc().collection().doc().get.mockResolvedValue({
        exists: false
      })

      await expect(refreshInstagramToken(mockData, mockContext)).rejects.toThrow(
        'Instagram account not found'
      )
    })

    it('should throw error when token refresh fails', async () => {
      mockDb.collection().doc().collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          accessToken: 'old-token'
        })
      })

      // Mock failed token refresh
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'Invalid token' } })
      })

      await expect(refreshInstagramToken(mockData, mockContext)).rejects.toThrow(
        'Failed to refresh Instagram token'
      )
    })
  })

  describe('uploadInstagramMedia', () => {
    beforeEach(() => {
      mockData = {
        igAccountId: 'ig-account-1',
        imageUrl: 'https://example.com/image.jpg',
        caption: 'Test caption',
        postType: 'single'
      }
    })

    it('should upload single image successfully', async () => {
      // Mock account exists
      mockDb.collection().doc().collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          igUserId: 'ig-user-123',
          accessToken: 'valid-token'
        })
      })

      // Setup proxy fetch mock
      const mockProxyFetch = jest.fn()
      proxyFetch.mockReturnValue(mockProxyFetch)

      // Mock container creation
      mockProxyFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'container-123' })
      })
      // Mock publish
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'media-123' })
      })

      const result = await uploadInstagramMedia(mockData, mockContext)

      expect(result).toEqual({
        success: true,
        mediaId: 'media-123'
      })

      // Verify plan limits were checked and updated
      expect(canExecutePostForAccount).toHaveBeenCalledWith('test-user-id', 'ig-account-1')
      expect(incrementPostUsageForAccount).toHaveBeenCalledWith('test-user-id', 'ig-account-1')
    })

    it('should upload carousel successfully', async () => {
      mockData = {
        igAccountId: 'ig-account-1',
        imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        caption: 'Test caption',
        postType: 'carousel'
      }

      // Mock account exists
      mockDb.collection().doc().collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          igUserId: 'ig-user-123',
          accessToken: 'valid-token'
        })
      })

      // Setup proxy fetch mock
      const mockProxyFetch = jest.fn()
      proxyFetch.mockReturnValue(mockProxyFetch)

      // Mock media items creation
      mockProxyFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'media-1' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'media-2' })
        })
        // Mock carousel container
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'container-123' })
        })
        // Mock publish
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'carousel-123' })
        })

      const result = await uploadInstagramMedia(mockData, mockContext)

      expect(result).toEqual({
        success: true,
        mediaId: 'carousel-123'
      })
    })

    it('should throw error when plan limit exceeded', async () => {
      canExecutePostForAccount.mockResolvedValue(false)

      mockDb.collection().doc().collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          igUserId: 'ig-user-123',
          accessToken: 'valid-token'
        })
      })

      await expect(uploadInstagramMedia(mockData, mockContext)).rejects.toThrow(
        '投稿上限に達しました'
      )
    })

    it('should throw error when media creation fails', async () => {
      mockDb.collection().doc().collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          igUserId: 'ig-user-123',
          accessToken: 'valid-token'
        })
      })

      // Setup proxy fetch mock
      const mockProxyFetch = jest.fn()
      proxyFetch.mockReturnValue(mockProxyFetch)

      // Mock failed container creation
      mockProxyFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ 
          error: { 
            message: 'Invalid image URL',
            code: 100
          } 
        })
      })

      await expect(uploadInstagramMedia(mockData, mockContext)).rejects.toThrow(
        'Failed to create media container'
      )
    })
  })

  describe('testInstagramPost', () => {
    beforeEach(() => {
      mockData = {
        imageUrl: 'https://example.com/image.jpg',
        caption: 'Test caption'
      }
    })

    it('should validate post data successfully', async () => {
      const result = await testInstagramPost(mockData, mockContext)

      expect(result).toEqual({
        success: true,
        message: 'Post data is valid',
        data: {
          imageUrl: 'https://example.com/image.jpg',
          caption: 'Test caption',
          captionLength: 12,
          maxCaptionLength: 2200
        }
      })
    })

    it('should throw error when not authenticated', async () => {
      mockContext.auth = null

      await expect(testInstagramPost(mockData, mockContext)).rejects.toThrow(
        'Authentication required'
      )
    })

    it('should throw error when image URL is missing', async () => {
      mockData.imageUrl = ''

      await expect(testInstagramPost(mockData, mockContext)).rejects.toThrow(
        'Image URL is required'
      )
    })

    it('should throw error when caption is too long', async () => {
      mockData.caption = 'a'.repeat(2201)

      await expect(testInstagramPost(mockData, mockContext)).rejects.toThrow(
        'Caption exceeds maximum length'
      )
    })

    it('should handle missing caption', async () => {
      delete mockData.caption

      const result = await testInstagramPost(mockData, mockContext)

      expect(result).toEqual({
        success: true,
        message: 'Post data is valid',
        data: {
          imageUrl: 'https://example.com/image.jpg',
          caption: '',
          captionLength: 0,
          maxCaptionLength: 2200
        }
      })
    })
  })

  describe('deleteInstagramPost', () => {
    beforeEach(() => {
      mockData = {
        postId: 'post-123',
        igAccountId: 'ig-account-1'
      }
    })

    it('should delete post successfully', async () => {
      // Mock account exists
      mockDb.collection().doc().collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          accessToken: 'valid-token'
        })
      })

      // Mock successful deletion
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      })

      const result = await deleteInstagramPost(mockData, mockContext)

      expect(result).toEqual({
        success: true,
        message: 'Post deleted successfully'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/post-123'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('should throw error when post ID is missing', async () => {
      mockData.postId = ''

      await expect(deleteInstagramPost(mockData, mockContext)).rejects.toThrow(
        'postId and igAccountId are required'
      )
    })

    it('should throw error when deletion fails', async () => {
      mockDb.collection().doc().collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          accessToken: 'valid-token'
        })
      })

      // Mock failed deletion
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ 
          error: { 
            message: 'Post not found',
            code: 100
          } 
        })
      })

      await expect(deleteInstagramPost(mockData, mockContext)).rejects.toThrow(
        'Failed to delete Instagram post'
      )
    })
  })
})