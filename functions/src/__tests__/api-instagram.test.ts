import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as admin from 'firebase-admin'
import { Request, Response } from 'express'

// Mock Firebase Admin
vi.mock('firebase-admin', () => ({
  auth: vi.fn(() => ({
    verifyIdToken: vi.fn()
  })),
  firestore: vi.fn(() => ({
    collection: vi.fn(),
    doc: vi.fn()
  }))
}))

// Mock plan limits
vi.mock('../utils/planLimits', () => ({
  checkPostExecutionLimit: vi.fn(),
  updatePostUsage: vi.fn()
}))

// Mock proxy fetch
vi.mock('../utils/proxyFetch', () => ({
  fetchWithProxy: vi.fn()
}))

import { publishInstagramPost, getInstagramAccountInfo } from '../api/instagram'
import { checkPostExecutionLimit, updatePostUsage } from '../utils/planLimits'
import { fetchWithProxy } from '../utils/proxyFetch'

describe('Instagram API', () => {
  let mockFirestore: any
  let mockAuth: any
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>

  beforeEach(() => {
    mockFirestore = {
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(),
          update: vi.fn()
        }))
      }))
    }

    mockAuth = {
      verifyIdToken: vi.fn()
    }

    vi.mocked(admin.firestore).mockReturnValue(mockFirestore)
    vi.mocked(admin.auth).mockReturnValue(mockAuth)

    mockRequest = {
      headers: {
        authorization: 'Bearer test-token'
      },
      body: {},
      params: {}
    }

    mockResponse = {
      status: vi.fn(() => mockResponse),
      json: vi.fn(),
      send: vi.fn()
    } as Partial<Response>
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('publishInstagramPost', () => {
    beforeEach(() => {
      mockRequest.body = {
        igAccountId: 'ig-account-123',
        caption: 'Test post caption #test',
        images: ['https://example.com/image1.jpg']
      }
    })

    it('should publish single image post successfully', async () => {
      // Mock authentication
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      // Mock plan limits check
      vi.mocked(checkPostExecutionLimit).mockResolvedValue(true)

      // Mock Instagram account data
      const mockIgAccount = {
        exists: true,
        data: () => ({
          userId: 'test-user-id',
          username: 'test_user',
          accessToken: 'ig_access_token',
          igUserId: 'ig_user_123'
        })
      }
      mockFirestore.collection().doc().get.mockResolvedValue(mockIgAccount)

      // Mock Instagram Graph API responses
      vi.mocked(fetchWithProxy)
        // Media creation
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'media_123' })
        })
        // Media publish
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'post_456' })
        })

      // Mock usage update
      vi.mocked(updatePostUsage).mockResolvedValue()

      await publishInstagramPost(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Post published successfully',
        postId: 'post_456',
        mediaId: 'media_123'
      })

      expect(updatePostUsage).toHaveBeenCalledWith('test-user-id')
    })

    it('should publish carousel post with multiple images', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })
      vi.mocked(checkPostExecutionLimit).mockResolvedValue(true)

      mockRequest.body.images = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg'
      ]

      const mockIgAccount = {
        exists: true,
        data: () => ({
          userId: 'test-user-id',
          username: 'test_user',
          accessToken: 'ig_access_token',
          igUserId: 'ig_user_123'
        })
      }
      mockFirestore.collection().doc().get.mockResolvedValue(mockIgAccount)

      // Mock carousel media creation
      vi.mocked(fetchWithProxy)
        // Individual media items
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'media_1' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'media_2' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'media_3' })
        })
        // Carousel container
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'carousel_123' })
        })
        // Carousel publish
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'post_789' })
        })

      vi.mocked(updatePostUsage).mockResolvedValue()

      await publishInstagramPost(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Carousel post published successfully',
        postId: 'post_789',
        mediaId: 'carousel_123'
      })
    })

    it('should check plan limits before posting', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })
      
      // Mock plan limits exceeded
      vi.mocked(checkPostExecutionLimit).mockResolvedValue(false)

      await publishInstagramPost(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Post limit exceeded for your plan'
      })
    })

    it('should validate Instagram account ownership', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })
      vi.mocked(checkPostExecutionLimit).mockResolvedValue(true)

      // Mock Instagram account belonging to different user
      const mockIgAccount = {
        exists: true,
        data: () => ({
          userId: 'different-user-id', // Different user
          username: 'other_user',
          accessToken: 'ig_access_token',
          igUserId: 'ig_user_456'
        })
      }
      mockFirestore.collection().doc().get.mockResolvedValue(mockIgAccount)

      await publishInstagramPost(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized: Instagram account does not belong to user'
      })
    })

    it('should handle Instagram API errors', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })
      vi.mocked(checkPostExecutionLimit).mockResolvedValue(true)

      const mockIgAccount = {
        exists: true,
        data: () => ({
          userId: 'test-user-id',
          username: 'test_user',
          accessToken: 'invalid_token',
          igUserId: 'ig_user_123'
        })
      }
      mockFirestore.collection().doc().get.mockResolvedValue(mockIgAccount)

      // Mock Instagram API error
      vi.mocked(fetchWithProxy).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: {
            message: 'Invalid access token',
            code: 190
          }
        })
      })

      await publishInstagramPost(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Instagram API error: Invalid access token'
      })
    })

    it('should validate required fields', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      // Missing required fields
      mockRequest.body = {
        igAccountId: 'ig-account-123'
        // Missing caption and images
      }

      await publishInstagramPost(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields: caption, images'
      })
    })

    it('should validate image count limits', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      // Too many images (Instagram allows max 10)
      mockRequest.body = {
        igAccountId: 'ig-account-123',
        caption: 'Test caption',
        images: new Array(11).fill('https://example.com/image.jpg')
      }

      await publishInstagramPost(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Maximum 10 images allowed per post'
      })
    })

    it('should handle authentication errors', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'))

      await publishInstagramPost(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized'
      })
    })
  })

  describe('getInstagramAccountInfo', () => {
    beforeEach(() => {
      mockRequest.params = { accountId: 'ig-account-123' }
    })

    it('should get account info successfully', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      const mockIgAccount = {
        exists: true,
        data: () => ({
          userId: 'test-user-id',
          username: 'test_user',
          accessToken: 'ig_access_token',
          igUserId: 'ig_user_123'
        })
      }
      mockFirestore.collection().doc().get.mockResolvedValue(mockIgAccount)

      // Mock Instagram Graph API response
      vi.mocked(fetchWithProxy).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'ig_user_123',
          username: 'test_user',
          account_type: 'BUSINESS',
          media_count: 42
        })
      })

      await getInstagramAccountInfo(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: 'ig_user_123',
        username: 'test_user',
        account_type: 'BUSINESS',
        media_count: 42
      })
    })

    it('should handle non-existent account', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      const mockIgAccount = {
        exists: false
      }
      mockFirestore.collection().doc().get.mockResolvedValue(mockIgAccount)

      await getInstagramAccountInfo(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Instagram account not found'
      })
    })

    it('should validate account ownership', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      const mockIgAccount = {
        exists: true,
        data: () => ({
          userId: 'different-user-id', // Different user
          username: 'other_user',
          accessToken: 'ig_access_token',
          igUserId: 'ig_user_456'
        })
      }
      mockFirestore.collection().doc().get.mockResolvedValue(mockIgAccount)

      await getInstagramAccountInfo(mockRequest as Request, mockResponse as Response)

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized: Instagram account does not belong to user'
      })
    })
  })
})