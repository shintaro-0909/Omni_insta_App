// Import types only when needed

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
      add: jest.fn(),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn()
          })),
          get: jest.fn()
        }))
      }))
    }))
  })),
  FieldValue: {
    serverTimestamp: jest.fn(() => 'mock-timestamp'),
    arrayUnion: jest.fn()
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

// Mock the index file to avoid initialization issues
jest.mock('../index', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn()
          })),
          get: jest.fn()
        }))
      }))
    }))
  }
}))

// Mock utils
jest.mock('../utils/planLimits', () => ({
  canCreateSchedule: jest.fn().mockResolvedValue(true),
  getUserPlanLimits: jest.fn().mockResolvedValue({
    instagramAccountLimit: 10,
    monthlyPostLimit: 1000,
    dailyPostLimitPerAccount: 50,
    scheduledPosts: true,
    recurringPosts: true,
    randomPosts: true
  })
}))

jest.mock('../utils/scheduleUtils', () => ({
  calculateNextRunAt: jest.fn().mockReturnValue(new Date('2024-12-31T23:59:59.000Z')),
  updateNextRunAfterExecution: jest.fn(),
  validateScheduleData: jest.fn().mockReturnValue(true),
  createTimestamp: jest.fn().mockReturnValue(new Date()),
  ScheduleType: {
    ONCE: 'once',
    RECURRING: 'recurring',
    RANDOM: 'random'
  },
  ScheduleStatus: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    COMPLETED: 'completed'
  }
}))

// Import after mocks
const { createSchedule, getSchedules, updateSchedule, deleteSchedule } = require('../api/schedules')
const { canCreateSchedule } = require('../utils/planLimits')
const { db } = require('../index')

describe('Schedules API', () => {
  let mockContext: any
  let mockData: any

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()
    
    // Setup context for authenticated user
    mockContext = {
      auth: {
        uid: 'test-user-id',
        token: {}
      }
    }

    // Setup default data
    mockData = {
      igAccountId: 'ig-account-1',
      contentId: 'content-1',
      type: 'once',
      title: 'Test Schedule',
      scheduledAt: '2024-12-31T23:59:59.000Z'
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createSchedule', () => {
    it('should create a schedule successfully', async () => {
      // Mock Firestore operations
      const mockDocRef = { id: 'new-schedule-id' }
      db.collection().add.mockResolvedValue(mockDocRef)
      
      // Mock account verification
      db.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ userId: 'test-user-id' })
      })

      // Call the function
      const result = await createSchedule(mockData, mockContext)

      // Verify the result
      expect(result).toEqual({
        success: true,
        scheduleId: 'new-schedule-id'
      })

      // Verify plan limits were checked
      expect(canCreateSchedule).toHaveBeenCalledWith('test-user-id')

      // Verify Firestore add was called
      expect(db.collection().add).toHaveBeenCalled()
    })

    it('should throw error when not authenticated', async () => {
      mockContext.auth = null

      await expect(createSchedule(mockData, mockContext)).rejects.toThrow(
        'Authentication required'
      )
    })

    it('should throw error when account does not exist', async () => {
      // Mock account not found
      db.collection().doc().get.mockResolvedValue({
        exists: false
      })

      await expect(createSchedule(mockData, mockContext)).rejects.toThrow(
        'Instagram account not found'
      )
    })

    it('should throw error when plan limit exceeded', async () => {
      // Mock plan limit exceeded
      canCreateSchedule.mockResolvedValue(false)

      // Mock account verification
      db.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ userId: 'test-user-id' })
      })

      await expect(createSchedule(mockData, mockContext)).rejects.toThrow(
        'スケジュール作成上限に達しました'
      )
    })
  })

  describe('getSchedules', () => {
    it('should get schedules successfully', async () => {
      const mockSchedules = [
        { id: 'schedule-1', data: () => ({ title: 'Schedule 1' }) },
        { id: 'schedule-2', data: () => ({ title: 'Schedule 2' }) }
      ]

      db.collection().where().orderBy().get.mockResolvedValue({
        docs: mockSchedules
      })

      const result = await getSchedules({}, mockContext)

      expect(result).toEqual({
        schedules: [
          { id: 'schedule-1', title: 'Schedule 1' },
          { id: 'schedule-2', title: 'Schedule 2' }
        ]
      })
    })

    it('should throw error when not authenticated', async () => {
      mockContext.auth = null

      await expect(getSchedules({}, mockContext)).rejects.toThrow(
        'Authentication required'
      )
    })

    it('should filter by account if provided', async () => {
      const mockSchedules = [
        { id: 'schedule-1', data: () => ({ title: 'Schedule 1' }) }
      ]

      db.collection().where().orderBy().get.mockResolvedValue({
        docs: mockSchedules
      })

      const result = await getSchedules({ igAccountId: 'ig-account-1' }, mockContext)

      expect(result).toEqual({
        schedules: [
          { id: 'schedule-1', title: 'Schedule 1' }
        ]
      })

      // Verify where clause was called
      expect(db.collection().where).toHaveBeenCalledWith('igAccountId', '==', 'ig-account-1')
    })
  })

  describe('updateSchedule', () => {
    it('should update schedule successfully', async () => {
      const updateData = {
        scheduleId: 'schedule-1',
        title: 'Updated Title'
      }

      // Mock schedule exists and belongs to user
      db.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ userId: 'test-user-id' })
      })

      db.collection().doc().update.mockResolvedValue({})

      const result = await updateSchedule(updateData, mockContext)

      expect(result).toEqual({ success: true })
      expect(db.collection().doc().update).toHaveBeenCalled()
    })

    it('should throw error when schedule not found', async () => {
      db.collection().doc().get.mockResolvedValue({
        exists: false
      })

      await expect(updateSchedule({ scheduleId: 'invalid' }, mockContext)).rejects.toThrow(
        'Schedule not found'
      )
    })

    it('should throw error when user does not own schedule', async () => {
      db.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ userId: 'different-user' })
      })

      await expect(updateSchedule({ scheduleId: 'schedule-1' }, mockContext)).rejects.toThrow(
        'Permission denied'
      )
    })
  })

  describe('deleteSchedule', () => {
    it('should delete schedule successfully', async () => {
      // Mock schedule exists and belongs to user
      db.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ userId: 'test-user-id' })
      })

      db.collection().doc().delete.mockResolvedValue({})

      const result = await deleteSchedule({ scheduleId: 'schedule-1' }, mockContext)

      expect(result).toEqual({ success: true })
      expect(db.collection().doc().delete).toHaveBeenCalled()
    })

    it('should throw error when schedule not found', async () => {
      db.collection().doc().get.mockResolvedValue({
        exists: false
      })

      await expect(deleteSchedule({ scheduleId: 'invalid' }, mockContext)).rejects.toThrow(
        'Schedule not found'
      )
    })

    it('should throw error when user does not own schedule', async () => {
      db.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({ userId: 'different-user' })
      })

      await expect(deleteSchedule({ scheduleId: 'schedule-1' }, mockContext)).rejects.toThrow(
        'Permission denied'
      )
    })
  })
})