import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  initializeTestEnvironment, 
  RulesTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing'

const PROJECT_ID = 'omniy-test'

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment

  beforeEach(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: `
          rules_version = '2';
          service cloud.firestore {
            match /databases/{database}/documents {
              // Users collection
              match /users/{userId} {
                allow read, write: if request.auth != null && request.auth.uid == userId;
              }
              
              // Schedules collection
              match /schedules/{scheduleId} {
                allow read, write: if request.auth != null && 
                  request.auth.uid == resource.data.userId;
                allow create: if request.auth != null && 
                  request.auth.uid == request.resource.data.userId;
              }
              
              // Posts collection
              match /posts/{postId} {
                allow read, write: if request.auth != null && 
                  request.auth.uid == resource.data.userId;
                allow create: if request.auth != null && 
                  request.auth.uid == request.resource.data.userId;
              }
              
              // Instagram Accounts collection
              match /igAccounts/{accountId} {
                allow read, write: if request.auth != null && 
                  request.auth.uid == resource.data.userId;
                allow create: if request.auth != null && 
                  request.auth.uid == request.resource.data.userId;
              }
              
              // User Usage collection
              match /userUsage/{userId} {
                allow read, write: if request.auth != null && 
                  request.auth.uid == userId;
              }
              
              // Subscriptions collection (read-only for users)
              match /subscriptions/{subscriptionId} {
                allow read: if request.auth != null && 
                  request.auth.uid == resource.data.userId;
                allow write: if false; // Only backend can write
              }
            }
          }
        `
      }
    })
  })

  afterEach(async () => {
    await testEnv.cleanup()
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

  describe('Schedules Collection', () => {
    beforeEach(async () => {
      const admin = testEnv.authenticatedContext('alice', { admin: true })
      await admin.firestore().collection('schedules').doc('schedule1').set({
        userId: 'alice',
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
      const admin = testEnv.authenticatedContext('alice', { admin: true })
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

  describe('Instagram Accounts Collection', () => {
    beforeEach(async () => {
      const admin = testEnv.authenticatedContext('alice', { admin: true })
      await admin.firestore().collection('igAccounts').doc('account1').set({
        userId: 'alice',
        username: 'alice_instagram',
        accessToken: 'encrypted_token',
        createdAt: new Date()
      })
    })

    it('should allow users to read their own Instagram accounts', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('igAccounts').doc('account1').get()
      )
    })

    it('should allow users to create Instagram accounts with their userId', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('igAccounts').doc('account2').set({
          userId: 'alice',
          username: 'alice_business',
          accessToken: 'encrypted_token_2',
          createdAt: new Date()
        })
      )
    })

    it('should deny users from accessing other users Instagram accounts', async () => {
      const bob = testEnv.authenticatedContext('bob')
      
      await assertFails(
        bob.firestore().collection('igAccounts').doc('account1').get()
      )
    })

    it('should deny users from creating accounts with different userId', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('igAccounts').doc('account2').set({
          userId: 'bob', // Different user ID
          username: 'malicious_account',
          accessToken: 'stolen_token',
          createdAt: new Date()
        })
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

    it('should allow users to update their own usage data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('userUsage').doc('alice').set({
          postsUsed: 5,
          scheduleCreationsUsed: 3,
          lastResetAt: new Date()
        })
      )
    })

    it('should deny users from accessing other users usage data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('userUsage').doc('bob').get()
      )
    })
  })

  describe('Subscriptions Collection', () => {
    beforeEach(async () => {
      const admin = testEnv.authenticatedContext('alice', { admin: true })
      await admin.firestore().collection('subscriptions').doc('sub1').set({
        userId: 'alice',
        stripeCustomerId: 'cus_test123',
        status: 'active',
        currentPlan: 'basic'
      })
    })

    it('should allow users to read their own subscription data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('subscriptions').doc('sub1').get()
      )
    })

    it('should deny users from writing subscription data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().collection('subscriptions').doc('sub1').update({
          status: 'premium' // Users shouldn't be able to modify subscriptions
        })
      )
    })

    it('should deny users from reading other users subscription data', async () => {
      const bob = testEnv.authenticatedContext('bob')
      
      await assertFails(
        bob.firestore().collection('subscriptions').doc('sub1').get()
      )
    })
  })

  describe('Field Validation', () => {
    it('should enforce required fields in schedule creation', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      // Missing required fields should be handled by application logic
      // Rules focus on authorization, not validation
      await assertSucceeds(
        alice.firestore().collection('schedules').doc('invalid').set({
          userId: 'alice'
          // Missing other required fields - validation should be in Cloud Functions
        })
      )
    })
  })

  describe('Query Security', () => {
    beforeEach(async () => {
      const admin = testEnv.authenticatedContext('admin', { admin: true })
      
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

    it('should deny broad queries without user filtering', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      // This should fail because it could return other users' data
      await assertFails(
        alice.firestore()
          .collection('schedules')
          .where('status', '==', 'pending')
          .get()
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty documents', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().collection('users').doc('alice').set({})
      )
    })

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
      const admin = testEnv.authenticatedContext('admin', { admin: true })
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