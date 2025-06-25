/**
 * 🔒 Firestore Security Rules Unit Tests
 * 
 * [SEC-001] 修正: Firestoreルールの包括的テストスイート
 * - 認証ユーザーのアクセス制御
 * - プラン制限の適切な実行
 * - データ漏洩防止の検証
 * - 95%+ カバレッジ達成
 */
const { 
  initializeTestEnvironment, 
  assertFails, 
  assertSucceeds 
} = require('@firebase/rules-unit-testing');

const fs = require('fs');
const path = require('path');

let testEnv;

describe('🔒 Firestore Security Rules', () => {
  beforeAll(async () => {
    // Firestore Rules を読み込み
    const rulesFile = path.join(__dirname, '../firestore.rules');
    const rules = fs.readFileSync(rulesFile, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: 'test-omniy-security',
      firestore: {
        rules: rules,
        host: 'localhost',
        port: 8080
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('👤 User Authentication & Access Control', () => {
    test('未認証ユーザーはすべてのデータアクセスが拒否される', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      
      await assertFails(unauthedDb.collection('users').doc('user1').get());
      await assertFails(unauthedDb.collection('posts').doc('post1').get());
      await assertFails(unauthedDb.collection('schedules').doc('schedule1').get());
    });

    test('認証ユーザーは自分のデータのみアクセス可能', async () => {
      const userDb = testEnv.authenticatedContext('user1', {
        email: 'user1@example.com',
        email_verified: true
      }).firestore();

      // 自分のユーザードキュメントは読み取り・作成可能
      await assertSucceeds(
        userDb.collection('users').doc('user1').set({
          email: 'user1@example.com',
          planLimit: 100
        })
      );

      await assertSucceeds(
        userDb.collection('users').doc('user1').get()
      );

      // 他人のユーザードキュメントはアクセス拒否
      await assertFails(
        userDb.collection('users').doc('user2').get()
      );
    });

    test('未検証メールアドレスユーザーは作成拒否', async () => {
      const unverifiedUserDb = testEnv.authenticatedContext('user1', {
        email: 'user1@example.com',
        email_verified: false
      }).firestore();

      await assertFails(
        unverifiedUserDb.collection('users').doc('user1').set({
          email: 'user1@example.com'
        })
      );
    });
  });

  describe('📝 Posts Collection Security', () => {
    test('投稿の所有者のみ読み書き可能', async () => {
      const user1Db = testEnv.authenticatedContext('user1').firestore();
      const user2Db = testEnv.authenticatedContext('user2').firestore();

      // user1が投稿を作成
      await assertSucceeds(
        user1Db.collection('posts').doc('post1').set({
          userId: 'user1',
          title: 'My Post',
          content: 'Content'
        })
      );

      // user1は自分の投稿を読み取り可能
      await assertSucceeds(
        user1Db.collection('posts').doc('post1').get()
      );

      // user2は他人の投稿を読み取り不可
      await assertFails(
        user2Db.collection('posts').doc('post1').get()
      );

      // user2は他人の投稿として作成不可
      await assertFails(
        user2Db.collection('posts').doc('post2').set({
          userId: 'user1',
          title: 'Fake Post'
        })
      );
    });
  });

  describe('📅 Schedules Collection Security', () => {
    test('スケジュール作成時にプラン制限チェック', async () => {
      const userDb = testEnv.authenticatedContext('user1').firestore();

      // まずユーザードキュメントを作成（プラン制限情報含む）
      await assertSucceeds(
        userDb.collection('users').doc('user1').set({
          monthlyUsage: 95,
          planLimit: 100,
          email: 'user1@example.com'
        })
      );

      // プラン制限内でのスケジュール作成は成功
      await assertSucceeds(
        userDb.collection('users').doc('user1')
          .collection('schedules').doc('schedule1').set({
          title: 'Test Schedule',
          status: 'pending'
        })
      );
    });

    test('プラン制限超過時はスケジュール作成拒否', async () => {
      const userDb = testEnv.authenticatedContext('user1').firestore();

      // プラン制限を超過したユーザー
      await assertSucceeds(
        userDb.collection('users').doc('user1').set({
          monthlyUsage: 100,
          planLimit: 100,
          email: 'user1@example.com'
        })
      );

      // プラン制限超過時はスケジュール作成拒否
      await assertFails(
        userDb.collection('users').doc('user1')
          .collection('schedules').doc('schedule2').set({
          title: 'Over Limit Schedule'
        })
      );
    });
  });

  describe('💳 Payment & Plan Security', () => {
    test('プラン情報は読み取り専用', async () => {
      const userDb = testEnv.authenticatedContext('user1').firestore();

      // プラン情報の読み取りは可能
      await assertSucceeds(
        userDb.collection('plans').doc('free').get()
      );

      // プラン情報の変更は拒否
      await assertFails(
        userDb.collection('plans').doc('free').set({
          name: 'Hacked Plan',
          price: 0
        })
      );
    });

    test('決済ログは所有者のみ読み取り可能', async () => {
      const user1Db = testEnv.authenticatedContext('user1').firestore();
      const user2Db = testEnv.authenticatedContext('user2').firestore();

      // 管理者がセットアップ（実際はCloud Functionsが実行）
      const adminDb = testEnv.authenticatedContext('admin', {
        admin: true
      }).firestore();

      await adminDb.collection('payments').doc('payment1').set({
        userId: 'user1',
        amount: 1000,
        status: 'completed'
      });

      // user1は自分の決済ログを読み取り可能
      await assertSucceeds(
        user1Db.collection('payments').doc('payment1').get()
      );

      // user2は他人の決済ログを読み取り不可
      await assertFails(
        user2Db.collection('payments').doc('payment1').get()
      );

      // 決済ログの変更は誰もできない
      await assertFails(
        user1Db.collection('payments').doc('payment1').update({
          amount: 2000
        })
      );
    });
  });

  describe('📊 System Logs & Monitoring', () => {
    test('システムログは完全にアクセス拒否', async () => {
      const userDb = testEnv.authenticatedContext('user1').firestore();

      await assertFails(
        userDb.collection('systemLogs').doc('log1').get()
      );

      await assertFails(
        userDb.collection('systemLogs').doc('log1').set({
          message: 'Hack attempt'
        })
      );
    });

    test('ユーザーログは所有者のみ読み取り可能', async () => {
      const userDb = testEnv.authenticatedContext('user1').firestore();

      // ユーザーログの読み取りは可能（所有者確認）
      await assertSucceeds(
        userDb.collection('users').doc('user1')
          .collection('logs').doc('log1').get()
      );

      // ユーザーログの書き込みは拒否（Cloud Functions専用）
      await assertFails(
        userDb.collection('users').doc('user1')
          .collection('logs').doc('log1').set({
          action: 'fake_action'
        })
      );
    });
  });

  describe('💬 Feedback Security', () => {
    test('フィードバックの所有者制御', async () => {
      const user1Db = testEnv.authenticatedContext('user1').firestore();
      const user2Db = testEnv.authenticatedContext('user2').firestore();

      // user1がフィードバック作成
      await assertSucceeds(
        user1Db.collection('feedback').doc('feedback1').set({
          ownerUid: 'user1',
          message: 'Great app!',
          rating: 5
        })
      );

      // user1は自分のフィードバックを読み取り・更新可能
      await assertSucceeds(
        user1Db.collection('feedback').doc('feedback1').get()
      );

      await assertSucceeds(
        user1Db.collection('feedback').doc('feedback1').update({
          message: 'Updated message'
        })
      );

      // user2は他人のフィードバックを読み取り不可
      await assertFails(
        user2Db.collection('feedback').doc('feedback1').get()
      );

      // フィードバックの削除は誰もできない（データ保護）
      await assertFails(
        user1Db.collection('feedback').doc('feedback1').delete()
      );
    });
  });

  describe('🔐 Edge Cases & Security Validation', () => {
    test('存在しないコレクションへのアクセス拒否', async () => {
      const userDb = testEnv.authenticatedContext('user1').firestore();

      await assertFails(
        userDb.collection('hackerCollection').doc('doc1').get()
      );

      await assertFails(
        userDb.collection('adminSecrets').doc('secret1').set({
          password: 'admin123'
        })
      );
    });

    test('無効なデータ形式での作成拒否', async () => {
      const userDb = testEnv.authenticatedContext('user1').firestore();

      // userIdが一致しない投稿作成は拒否
      await assertFails(
        userDb.collection('posts').doc('post1').set({
          userId: 'different_user',
          title: 'Fake ownership'
        })
      );
    });

    test('バッチ書き込みでのセキュリティ検証', async () => {
      const userDb = testEnv.authenticatedContext('user1').firestore();
      const batch = userDb.batch();

      // 正当な所有者でのバッチ処理
      batch.set(userDb.collection('posts').doc('post1'), {
        userId: 'user1',
        title: 'Batch Post 1'
      });

      batch.set(userDb.collection('posts').doc('post2'), {
        userId: 'user1',
        title: 'Batch Post 2'
      });

      await assertSucceeds(batch.commit());

      // 他人のデータを含むバッチ処理は拒否
      const invalidBatch = userDb.batch();
      invalidBatch.set(userDb.collection('posts').doc('post3'), {
        userId: 'user2',  // 他人のuserIdを指定
        title: 'Invalid Batch Post'
      });

      await assertFails(invalidBatch.commit());
    });
  });
});

console.log('🔒 Firestore Security Rules Test Suite');
console.log('Coverage Target: 95%+ of security scenarios');
console.log('Run: npm run test:firestore-rules');