// Suppress TypeScript unused import warnings for mocks
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
/* eslint-enable @typescript-eslint/no-unused-vars */

// Mock Firebase Admin
jest.mock('firebase-admin')

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
  limit: jest.fn().mockReturnThis(),
  startAfter: jest.fn().mockReturnThis(),
  collectionGroup: jest.fn().mockReturnThis()
}

jest.mock('../index', () => ({
  db: mockDb
}))

// Import functions after mocks
const { createPost, getPosts, getPost, updatePost, deletePost, incrementPostUsage } = require('../api/posts')

describe('Posts API', () => {
  let mockContext: any
  let mockData: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockContext = {
      auth: {
        uid: 'test-user-id'
      }
    }

    // Reset mock chain
    mockDb.collection.mockReturnValue(mockDb)
    mockDb.doc.mockReturnValue(mockDb)
    mockDb.where.mockReturnValue(mockDb)
    mockDb.orderBy.mockReturnValue(mockDb)
    mockDb.limit.mockReturnValue(mockDb)
    mockDb.startAfter.mockReturnValue(mockDb)
    mockDb.collectionGroup.mockReturnValue(mockDb)
  })

  describe('createPost', () => {
    beforeEach(() => {
      mockData = {
        mediaUrls: ['https://example.com/image1.jpg'],
        caption: 'Test caption',
        tags: ['tag1', 'tag2']
      }
    })

    it('should create post successfully', async () => {
      const mockDocRef = { id: 'new-post-id' }
      mockDb.add.mockResolvedValue(mockDocRef)

      const result = await createPost(mockData, mockContext)

      expect(result).toEqual({
        success: true,
        postId: 'new-post-id',
        message: 'Post created successfully'
      })

      expect(mockDb.collection).toHaveBeenCalledWith('posts')
      expect(mockDb.add).toHaveBeenCalledWith(expect.objectContaining({
        ownerUid: 'test-user-id',
        mediaUrls: ['https://example.com/image1.jpg'],
        caption: 'Test caption',
        tags: ['tag1', 'tag2']
      }))
    })

    it('should throw error when not authenticated', async () => {
      mockContext.auth = null

      await expect(createPost(mockData, mockContext)).rejects.toThrow(
        'Authentication required'
      )
    })

    it('should throw error when mediaUrls is missing', async () => {
      mockData.mediaUrls = null

      await expect(createPost(mockData, mockContext)).rejects.toThrow(
        'Media URLs are required'
      )
    })

    it('should throw error when caption is missing', async () => {
      mockData.caption = null

      await expect(createPost(mockData, mockContext)).rejects.toThrow(
        'Caption is required'
      )
    })
  })

  describe('getPosts', () => {
    it('should get posts successfully', async () => {
      const mockPosts = [
        { id: 'post-1', data: () => ({ caption: 'Caption 1' }) },
        { id: 'post-2', data: () => ({ caption: 'Caption 2' }) }
      ]

      mockDb.get.mockResolvedValue({
        docs: mockPosts,
        empty: false
      })

      const result = await getPosts({ limit: 10 }, mockContext)

      expect(result).toEqual({
        success: true,
        posts: [
          { id: 'post-1', caption: 'Caption 1' },
          { id: 'post-2', caption: 'Caption 2' }
        ],
        hasMore: false,
        lastPostId: 'post-2'
      })

      expect(mockDb.where).toHaveBeenCalledWith('ownerUid', '==', 'test-user-id')
      expect(mockDb.orderBy).toHaveBeenCalledWith('createdAt', 'desc')
    })

    it('should throw error when not authenticated', async () => {
      mockContext.auth = null

      await expect(getPosts({}, mockContext)).rejects.toThrow(
        'Authentication required'
      )
    })
  })

  describe('getPost', () => {
    it('should get post successfully', async () => {
      mockDb.get.mockResolvedValue({
        exists: true,
        id: 'post-123',
        data: () => ({
          ownerUid: 'test-user-id',
          caption: 'Test caption'
        })
      })

      const result = await getPost({ postId: 'post-123' }, mockContext)

      expect(result).toEqual({
        success: true,
        post: {
          id: 'post-123',
          ownerUid: 'test-user-id',
          caption: 'Test caption'
        }
      })
    })

    it('should throw error when post not found', async () => {
      mockDb.get.mockResolvedValue({
        exists: false
      })

      await expect(getPost({ postId: 'post-123' }, mockContext)).rejects.toThrow(
        'Post not found'
      )
    })

    it('should throw error when accessing another user post', async () => {
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({
          ownerUid: 'another-user-id'
        })
      })

      await expect(getPost({ postId: 'post-123' }, mockContext)).rejects.toThrow(
        'Access denied'
      )
    })
  })

  describe('updatePost', () => {
    it('should update post successfully', async () => {
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({
          ownerUid: 'test-user-id'
        })
      })

      mockDb.update.mockResolvedValue({})

      const result = await updatePost({
        postId: 'post-123',
        caption: 'Updated caption'
      }, mockContext)

      expect(result).toEqual({
        success: true,
        message: 'Post updated successfully'
      })
    })

    it('should throw error when post not found', async () => {
      mockDb.get.mockResolvedValue({
        exists: false
      })

      await expect(updatePost({ postId: 'post-123' }, mockContext)).rejects.toThrow(
        'Post not found'
      )
    })
  })

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({
          ownerUid: 'test-user-id'
        })
      })

      // Mock no active schedules
      mockDb.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          ownerUid: 'test-user-id'
        })
      }).mockResolvedValueOnce({
        empty: true
      })

      mockDb.delete.mockResolvedValue({})

      const result = await deletePost({ postId: 'post-123' }, mockContext)

      expect(result).toEqual({
        success: true,
        message: 'Post deleted successfully'
      })
    })

    it('should throw error when post has active schedules', async () => {
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({
          ownerUid: 'test-user-id'
        })
      })

      // Mock active schedules exist
      mockDb.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          ownerUid: 'test-user-id'
        })
      }).mockResolvedValueOnce({
        empty: false,
        docs: [{ id: 'schedule-1' }]
      })

      await expect(deletePost({ postId: 'post-123' }, mockContext)).rejects.toThrow(
        'Cannot delete post that is referenced by active schedules'
      )
    })
  })

  describe('incrementPostUsage', () => {
    it('should increment post usage count', async () => {
      mockDb.get.mockResolvedValue({
        data: () => ({
          timesPosted: 5
        })
      })

      mockDb.update.mockResolvedValue({})

      await incrementPostUsage('post-123')

      expect(mockDb.update).toHaveBeenCalledWith({
        timesPosted: 6,
        updatedAt: expect.any(Date)
      })
    })
  })
})