// Suppress TypeScript unused import warnings for mocks
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
/* eslint-enable @typescript-eslint/no-unused-vars */

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => ({
    collection: jest.fn(),
    batch: jest.fn(() => ({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn()
    }))
  })),
  FieldValue: {
    serverTimestamp: jest.fn(() => 'mock-timestamp'),
    increment: jest.fn((value) => value),
    delete: jest.fn(() => 'field-delete')
  },
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn((date) => ({ toDate: () => date }))
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
  },
  pubsub: {
    schedule: jest.fn(() => ({
      timeZone: jest.fn(() => ({
        onRun: jest.fn((handler) => handler)
      }))
    }))
  }
}))

// Mock utils
jest.mock('../utils/scheduleUtils', () => ({
  updateNextRunAfterExecution: jest.fn()
}))

jest.mock('../utils/notifications', () => ({
  sendPostSuccessNotification: jest.fn(),
  sendPostFailureNotification: jest.fn()
}))

jest.mock('../utils/proxyFetch', () => ({
  proxyFetch: jest.fn(),
  getAccountProxyConfig: jest.fn()
}))

// Mock the db
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  startAfter: jest.fn().mockReturnThis(),
  get: jest.fn(),
  batch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn()
  }))
}

// Import functions after mocks
const { 
  executeScheduledPosts, 
  triggerScheduleExecution, 
  getExecutionLogs 
} = require('../schedulers/postExecutor')

const { updateNextRunAfterExecution } = require('../utils/scheduleUtils')
const { sendPostSuccessNotification, sendPostFailureNotification } = require('../utils/notifications')
const { proxyFetch, getAccountProxyConfig } = require('../utils/proxyFetch')

describe('Post Executor', () => {
  let mockContext: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockContext = {
      auth: {
        uid: 'test-user-id'
      }
    }

    // Reset admin firestore mock
    const mockFirestore = admin.firestore as jest.Mock
    mockFirestore.mockReturnValue(mockDb)

    // Reset mock chain
    mockDb.collection.mockReturnValue(mockDb)
    mockDb.doc.mockReturnValue(mockDb)
    mockDb.where.mockReturnValue(mockDb)
    mockDb.limit.mockReturnValue(mockDb)
    mockDb.orderBy.mockReturnValue(mockDb)
    mockDb.startAfter.mockReturnValue(mockDb)
  })

  describe('executeScheduledPosts', () => {
    it('should execute pending schedules successfully', async () => {
      const mockSchedule = {
        id: 'schedule-1',
        ref: { update: jest.fn() },
        data: () => ({
          ownerUid: 'test-user-id',
          igAccountId: 'ig-account-1',
          contentId: 'post-1',
          title: 'Test Schedule'
        })
      }

      // Mock pending schedules
      mockDb.get.mockResolvedValue({
        docs: [mockSchedule],
        empty: false
      })

      const result = await executeScheduledPosts({})

      // Verify the function runs without error
      expect(mockDb.collection).toHaveBeenCalledWith('schedules')
      expect(mockDb.where).toHaveBeenCalledWith('status', '==', 'active')
    })

    it('should handle no pending schedules', async () => {
      mockDb.get.mockResolvedValue({
        docs: [],
        empty: true
      })

      const result = await executeScheduledPosts({})

      // Should not throw error when no schedules
      expect(mockDb.collection).toHaveBeenCalledWith('schedules')
    })
  })

  describe('triggerScheduleExecution', () => {
    it('should throw error when not authenticated', async () => {
      mockContext.auth = null

      await expect(triggerScheduleExecution({ scheduleId: 'schedule-123' }, mockContext)).rejects.toThrow(
        'Authentication required'
      )
    })

    it('should throw error when scheduleId is missing', async () => {
      await expect(triggerScheduleExecution({}, mockContext)).rejects.toThrow(
        'scheduleId is required'
      )
    })

    it('should trigger schedule execution successfully', async () => {
      const mockSchedule = {
        exists: true,
        id: 'schedule-123',
        ref: { update: jest.fn() },
        data: () => ({
          ownerUid: 'test-user-id',
          igAccountId: 'ig-account-1',
          contentId: 'post-1',
          title: 'Test Schedule'
        })
      }

      mockDb.get.mockResolvedValue(mockSchedule)

      // Mock related data
      mockDb.get.mockResolvedValueOnce(mockSchedule)
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({
            instagramUserId: 'ig-user-123',
            username: 'testuser',
            accessToken: 'valid-token',
            tokenExpiresAt: { toDate: () => new Date(Date.now() + 86400000) }
          })
        })
        .mockResolvedValueOnce({
          exists: true,
          data: () => ({
            mediaUrls: ['https://example.com/image.jpg'],
            caption: 'Test caption'
          })
        })

      getAccountProxyConfig.mockResolvedValue(null)
      proxyFetch
        .mockResolvedValueOnce({ id: 'media-container-123' })
        .mockResolvedValueOnce({ id: 'published-post-123' })

      const result = await triggerScheduleExecution({ scheduleId: 'schedule-123' }, mockContext)

      expect(result.success).toBe(true)
      expect(result.scheduleId).toBe('schedule-123')
    })
  })

  describe('getExecutionLogs', () => {
    it('should get execution logs successfully', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          data: () => ({
            scheduleId: 'schedule-1',
            status: 'success'
          })
        }
      ]

      mockDb.get.mockResolvedValue({
        docs: mockLogs,
        empty: false
      })

      const result = await getExecutionLogs({ limit: 10 }, mockContext)

      expect(result.success).toBe(true)
      expect(result.logs).toHaveLength(1)
    })

    it('should throw error when not authenticated', async () => {
      mockContext.auth = null

      await expect(getExecutionLogs({}, mockContext)).rejects.toThrow(
        'Authentication required'
      )
    })

    it('should filter by scheduleId when provided', async () => {
      mockDb.get.mockResolvedValue({
        docs: [],
        empty: true
      })

      await getExecutionLogs({ scheduleId: 'schedule-123' }, mockContext)

      expect(mockDb.where).toHaveBeenCalledWith('scheduleId', '==', 'schedule-123')
    })
  })
})