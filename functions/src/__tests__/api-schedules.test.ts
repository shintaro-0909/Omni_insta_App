import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as admin from 'firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// Mock Firebase Admin
vi.mock('firebase-admin', () => ({
  auth: vi.fn(() => ({
    verifyIdToken: vi.fn()
  })),
  firestore: vi.fn(() => ({
    collection: vi.fn(),
    doc: vi.fn()
  })),
  FieldValue: {
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    arrayUnion: vi.fn()
  }
}))

// Mock utils
vi.mock('../utils/planLimits', () => ({
  checkScheduleCreationLimit: vi.fn(),
  checkPostExecutionLimit: vi.fn()
}))

import { createSchedule, getSchedules, updateSchedule, deleteSchedule } from '../api/schedules'
import { checkScheduleCreationLimit } from '../utils/planLimits'

describe('Schedules API', () => {
  let mockFirestore: any
  let mockAuth: any
  let mockRequest: any
  let mockResponse: any

  beforeEach(() => {
    // Setup mocks
    mockFirestore = {
      collection: vi.fn(() => ({
        add: vi.fn(),
        doc: vi.fn(() => ({
          get: vi.fn(),
          update: vi.fn(),
          delete: vi.fn()
        })),
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              get: vi.fn()
            })),
            get: vi.fn()
          }))
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
      method: 'POST'
    }

    mockResponse = {
      status: vi.fn(() => mockResponse),
      json: vi.fn(),
      send: vi.fn()
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createSchedule', () => {
    it('should create a schedule successfully', async () => {
      // Mock authentication
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })
      
      // Mock plan limits check
      vi.mocked(checkScheduleCreationLimit).mockResolvedValue(true)

      // Mock Firestore add
      const mockDocRef = { id: 'new-schedule-id' }
      mockFirestore.collection().add.mockResolvedValue(mockDocRef)

      mockRequest.body = {
        caption: 'Test post',
        images: ['image1.jpg'],
        igAccountId: 'ig-account-1',
        scheduleType: 'once',
        scheduledAt: '2024-12-31T23:59:59.000Z'
      }

      await createSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(201)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Schedule created successfully',
        scheduleId: 'new-schedule-id'
      })
    })

    it('should validate required fields', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      mockRequest.body = {
        // Missing required fields
        caption: ''
      }

      await createSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields'
      })
    })

    it('should check plan limits', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })
      
      // Mock plan limits exceeded
      vi.mocked(checkScheduleCreationLimit).mockResolvedValue(false)

      mockRequest.body = {
        caption: 'Test post',
        images: ['image1.jpg'],
        igAccountId: 'ig-account-1',
        scheduleType: 'once',
        scheduledAt: '2024-12-31T23:59:59.000Z'
      }

      await createSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Schedule creation limit exceeded for your plan'
      })
    })

    it('should handle authentication errors', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'))

      await createSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized'
      })
    })

    it('should validate schedule type', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      mockRequest.body = {
        caption: 'Test post',
        images: ['image1.jpg'],
        igAccountId: 'ig-account-1',
        scheduleType: 'invalid-type', // Invalid schedule type
        scheduledAt: '2024-12-31T23:59:59.000Z'
      }

      await createSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid schedule type'
      })
    })

    it('should validate future date for one-time schedules', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      mockRequest.body = {
        caption: 'Test post',
        images: ['image1.jpg'],
        igAccountId: 'ig-account-1',
        scheduleType: 'once',
        scheduledAt: '2023-01-01T00:00:00.000Z' // Past date
      }

      await createSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Scheduled time must be in the future'
      })
    })
  })

  describe('getSchedules', () => {
    it('should fetch user schedules with pagination', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      const mockDocs = [
        {
          id: 'schedule-1',
          data: () => ({
            caption: 'Post 1',
            scheduleType: 'once',
            status: 'pending'
          })
        },
        {
          id: 'schedule-2',
          data: () => ({
            caption: 'Post 2',
            scheduleType: 'recurring',
            status: 'active'
          })
        }
      ]

      mockFirestore.collection().where().orderBy().limit().get.mockResolvedValue({
        docs: mockDocs,
        empty: false
      })

      mockRequest.method = 'GET'
      mockRequest.query = {
        limit: '10',
        page: '1'
      }

      await getSchedules(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        schedules: [
          { id: 'schedule-1', caption: 'Post 1', scheduleType: 'once', status: 'pending' },
          { id: 'schedule-2', caption: 'Post 2', scheduleType: 'recurring', status: 'active' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          hasMore: false
        }
      })
    })

    it('should filter schedules by status', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      mockRequest.method = 'GET'
      mockRequest.query = {
        status: 'pending',
        limit: '10'
      }

      const mockQueryBuilder = {
        where: vi.fn(() => mockQueryBuilder),
        orderBy: vi.fn(() => mockQueryBuilder),
        limit: vi.fn(() => mockQueryBuilder),
        get: vi.fn().mockResolvedValue({ docs: [], empty: true })
      }

      mockFirestore.collection.mockReturnValue(mockQueryBuilder)

      await getSchedules(mockRequest, mockResponse)

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('userId', '==', 'test-user-id')
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('status', '==', 'pending')
    })
  })

  describe('updateSchedule', () => {
    it('should update a schedule successfully', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      const mockDoc = {
        exists: true,
        data: () => ({
          userId: 'test-user-id',
          caption: 'Old caption'
        })
      }

      mockFirestore.collection().doc().get.mockResolvedValue(mockDoc)
      mockFirestore.collection().doc().update.mockResolvedValue({})

      mockRequest.method = 'PUT'
      mockRequest.params = { scheduleId: 'schedule-1' }
      mockRequest.body = {
        caption: 'Updated caption'
      }

      await updateSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Schedule updated successfully'
      })
    })

    it('should prevent updating other users schedules', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      const mockDoc = {
        exists: true,
        data: () => ({
          userId: 'different-user-id', // Different user
          caption: 'Old caption'
        })
      }

      mockFirestore.collection().doc().get.mockResolvedValue(mockDoc)

      mockRequest.method = 'PUT'
      mockRequest.params = { scheduleId: 'schedule-1' }
      mockRequest.body = {
        caption: 'Updated caption'
      }

      await updateSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(403)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden: Cannot modify schedule'
      })
    })

    it('should handle non-existent schedule', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      const mockDoc = {
        exists: false
      }

      mockFirestore.collection().doc().get.mockResolvedValue(mockDoc)

      mockRequest.method = 'PUT'
      mockRequest.params = { scheduleId: 'non-existent' }
      mockRequest.body = {
        caption: 'Updated caption'
      }

      await updateSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(404)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Schedule not found'
      })
    })
  })

  describe('deleteSchedule', () => {
    it('should delete a schedule successfully', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      const mockDoc = {
        exists: true,
        data: () => ({
          userId: 'test-user-id',
          status: 'pending'
        })
      }

      mockFirestore.collection().doc().get.mockResolvedValue(mockDoc)
      mockFirestore.collection().doc().delete.mockResolvedValue({})

      mockRequest.method = 'DELETE'
      mockRequest.params = { scheduleId: 'schedule-1' }

      await deleteSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(200)
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Schedule deleted successfully'
      })
    })

    it('should prevent deleting executed schedules', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'test-user-id' })

      const mockDoc = {
        exists: true,
        data: () => ({
          userId: 'test-user-id',
          status: 'executed' // Already executed
        })
      }

      mockFirestore.collection().doc().get.mockResolvedValue(mockDoc)

      mockRequest.method = 'DELETE'
      mockRequest.params = { scheduleId: 'schedule-1' }

      await deleteSchedule(mockRequest, mockResponse)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Cannot delete executed schedule'
      })
    })
  })
})