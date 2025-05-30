import { 
  initializeTestEnvironment, 
  RulesTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing'
import * as fs from 'fs'
import * as path from 'path'

const PROJECT_ID = 'omniy-test'

// Load actual firestore rules
const rulesPath = path.resolve(__dirname, '../../../firestore.rules')
const rules = fs.readFileSync(rulesPath, 'utf8')

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: rules,
        host: 'localhost',
        port: 8080
      }
    })
  })

  afterAll(async () => {
    await testEnv.cleanup()
  })

  beforeEach(async () => {
    await testEnv.clearFirestore()
  })

  describe('Users Collection', () => {
    it('should allow users to read their own data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('users').doc('alice').get()
      )
    })

    it('should allow users to write their own data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('users').doc('alice').set({
          email: 'alice@example.com',
          displayName: 'Alice'
        })
      )
    })

    it('should deny users from reading other users data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('users').doc('bob').get()
      )
    })

    it('should deny users from writing other users data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('users').doc('bob').set({
          email: 'alice@example.com'
        })
      )
    })

    it('should deny unauthenticated access', async () => {
      const unauth = testEnv.unauthenticatedContext()
      
      await assertFails(
        unauth.firestore().collection('users').doc('alice').get()
      )
    })
  })

  describe('Instagram Accounts Subcollection', () => {
    it('should allow users to read their own Instagram accounts', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('users').doc('alice').collection('igAccounts').get()
      )
    })

    it('should allow users to create Instagram account', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('users').doc('alice').collection('igAccounts').doc().set({
          username: 'alice_instagram',
          igUserId: '123456',
          accessToken: 'encrypted_token'
        })
      )
    })

    it('should deny users from reading other users Instagram accounts', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('users').doc('bob').collection('igAccounts').get()
      )
    })

    it('should deny users from writing other users Instagram accounts', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('users').doc('bob').collection('igAccounts').doc().set({
          username: 'malicious',
          igUserId: '123456'
        })
      )
    })
  })

  describe('Schedules Collection', () => {
    beforeEach(async () => {
      // Setup test data using admin context
      const admin = testEnv.withSecurityRulesDisabled()
      await admin.firestore().collection('schedules').doc('schedule1').set({
        userId: 'alice',
        title: 'Test Schedule',
        caption: 'Test post',
        scheduledAt: new Date(),
        status: 'pending'
      })
    })

    it('should allow users to read their own schedules', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('schedules').doc('schedule1').get()
      )
    })

    it('should allow users to create schedules with their userId', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('schedules').doc('schedule2').set({
          userId: 'alice',
          title: 'New Schedule',
          caption: 'Another test post',
          scheduledAt: new Date(),
          status: 'pending'
        })
      )
    })

    it('should deny users from creating schedules with different userId', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('schedules').doc('schedule2').set({
          userId: 'bob', // Different user ID
          caption: 'Malicious post',
          scheduledAt: new Date(),
          status: 'pending'
        })
      )
    })

    it('should deny users from reading other users schedules', async () => {
      const bob = testEnv.authenticatedContext('bob')
      
      await assertFails(
        bob.firestore().collection('schedules').doc('schedule1').get()
      )
    })

    it('should allow users to update their own schedules', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('schedules').doc('schedule1').update({
          caption: 'Updated caption'
        })
      )
    })

    it('should deny users from updating other users schedules', async () => {
      const bob = testEnv.authenticatedContext('bob')
      
      await assertFails(
        bob.firestore().collection('schedules').doc('schedule1').update({
          caption: 'Hacked caption'
        })
      )
    })
  })

  describe('Posts Collection', () => {
    beforeEach(async () => {
      const admin = testEnv.withSecurityRulesDisabled()
      await admin.firestore().collection('posts').doc('post1').set({
        userId: 'alice',
        caption: 'Test post content',
        images: ['image1.jpg'],
        createdAt: new Date()
      })
    })

    it('should allow users to read their own posts', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('posts').doc('post1').get()
      )
    })

    it('should allow users to create posts with their userId', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('posts').doc('post2').set({
          userId: 'alice',
          caption: 'New post content',
          images: ['image2.jpg'],
          createdAt: new Date()
        })
      )
    })

    it('should deny users from creating posts with different userId', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('posts').doc('post2').set({
          userId: 'bob', // Different user ID
          caption: 'Unauthorized post',
          images: ['image2.jpg'],
          createdAt: new Date()
        })
      )
    })

    it('should deny users from reading other users posts', async () => {
      const bob = testEnv.authenticatedContext('bob')
      
      await assertFails(
        bob.firestore().collection('posts').doc('post1').get()
      )
    })
  })

  describe('User Usage Collection', () => {
    it('should allow users to read their own usage data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('userUsage').doc('alice').get()
      )
    })

    it('should deny users from accessing other users usage data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('userUsage').doc('bob').get()
      )
    })

    it('should deny users from writing usage data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      // Usage data should only be written by Cloud Functions
      await assertFails(
        alice.firestore().collection('userUsage').doc('alice').set({
          instagramAccountCount: 0,
          monthlyPostCount: 0
        })
      )
    })
  })

  describe('Plans Collection', () => {
    beforeEach(async () => {
      const admin = testEnv.withSecurityRulesDisabled()
      await admin.firestore().collection('plans').doc('free').set({
        planId: 'free',
        name: 'Free',
        price: 0,
        features: {
          instagramAccountLimit: 1,
          monthlyPostLimit: 10
        }
      })
    })

    it('should allow any authenticated user to read plans', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('plans').doc('free').get()
      )
    })

    it('should deny unauthenticated users from reading plans', async () => {
      const unauth = testEnv.unauthenticatedContext()
      
      await assertFails(
        unauth.firestore().collection('plans').doc('free').get()
      )
    })

    it('should deny users from creating or updating plans', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('plans').doc('custom').set({
          name: 'Custom Plan',
          price: 9999
        })
      )
    })
  })

  describe('Groups Collection', () => {
    beforeEach(async () => {
      const admin = testEnv.withSecurityRulesDisabled()
      await admin.firestore().collection('groups').doc('group1').set({
        userId: 'alice',
        name: 'Test Group',
        accountIds: ['account1', 'account2']
      })
    })

    it('should allow users to read their own groups', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('groups').doc('group1').get()
      )
    })

    it('should deny users from reading other users groups', async () => {
      const bob = testEnv.authenticatedContext('bob')
      
      await assertFails(
        bob.firestore().collection('groups').doc('group1').get()
      )
    })

    it('should allow users to create groups', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('groups').doc('group2').set({
          userId: 'alice',
          name: 'New Group',
          accountIds: []
        })
      )
    })

    it('should deny creating groups for other users', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('groups').doc('group2').set({
          userId: 'bob',
          name: 'Malicious Group',
          accountIds: []
        })
      )
    })
  })

  describe('Proxies Collection', () => {
    beforeEach(async () => {
      const admin = testEnv.withSecurityRulesDisabled()
      await admin.firestore().collection('proxies').doc('proxy1').set({
        userId: 'alice',
        name: 'Test Proxy',
        host: 'proxy.example.com',
        port: 8080,
        isActive: true
      })
    })

    it('should allow users to read their own proxies', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('proxies').doc('proxy1').get()
      )
    })

    it('should deny users from reading other users proxies', async () => {
      const bob = testEnv.authenticatedContext('bob')
      
      await assertFails(
        bob.firestore().collection('proxies').doc('proxy1').get()
      )
    })
  })

  describe('Logs Collection', () => {
    beforeEach(async () => {
      const admin = testEnv.withSecurityRulesDisabled()
      await admin.firestore().collection('logs').doc('log1').set({
        userId: 'alice',
        action: 'post_published',
        timestamp: new Date(),
        details: { postId: 'post123' }
      })
    })

    it('should allow users to read their own logs', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('logs').doc('log1').get()
      )
    })

    it('should deny users from reading other users logs', async () => {
      const bob = testEnv.authenticatedContext('bob')
      
      await assertFails(
        bob.firestore().collection('logs').doc('log1').get()
      )
    })

    it('should deny users from writing logs', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      // Logs should only be written by Cloud Functions
      await assertFails(
        alice.firestore().collection('logs').doc('log2').set({
          userId: 'alice',
          action: 'manual_log'
        })
      )
    })
  })

  describe('Query Security', () => {
    beforeEach(async () => {
      const admin = testEnv.withSecurityRulesDisabled()
      
      // Create test data for multiple users
      await admin.firestore().collection('schedules').doc('alice_schedule').set({
        userId: 'alice',
        caption: 'Alice post',
        status: 'pending'
      })
      
      await admin.firestore().collection('schedules').doc('bob_schedule').set({
        userId: 'bob',
        caption: 'Bob post',
        status: 'pending'
      })
    })

    it('should allow users to query their own data with where clause', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore()
          .collection('schedules')
          .where('userId', '==', 'alice')
          .get()
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle document deletion', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      // First create a document
      await alice.firestore().collection('posts').doc('to_delete').set({
        userId: 'alice',
        caption: 'To be deleted'
      })
      
      // Then delete it
      await assertSucceeds(
        alice.firestore().collection('posts').doc('to_delete').delete()
      )
    })

    it('should deny deletion of other users documents', async () => {
      const admin = testEnv.withSecurityRulesDisabled()
      await admin.firestore().collection('posts').doc('bob_post').set({
        userId: 'bob',
        caption: 'Bob post'
      })
      
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('posts').doc('bob_post').delete()
      )
    })
  })

  describe('Batch Operations', () => {
    it('should allow batch operations on user own data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      const batch = alice.firestore().batch()
      
      batch.set(alice.firestore().collection('posts').doc('batch1'), {
        userId: 'alice',
        caption: 'Batch post 1'
      })
      
      batch.set(alice.firestore().collection('posts').doc('batch2'), {
        userId: 'alice',
        caption: 'Batch post 2'
      })
      
      await assertSucceeds(batch.commit())
    })

    it('should deny batch operations containing other users data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      const batch = alice.firestore().batch()
      
      batch.set(alice.firestore().collection('posts').doc('alice_post'), {
        userId: 'alice',
        caption: 'Alice post'
      })
      
      batch.set(alice.firestore().collection('posts').doc('bob_post'), {
        userId: 'bob', // Different user
        caption: 'Unauthorized post'
      })
      
      await assertFails(batch.commit())
    })
  })
})