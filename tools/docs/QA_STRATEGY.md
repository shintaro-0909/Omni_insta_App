Claude Rules :look👀

# Omniy 品質保証戦略 - 1人運営最適化

## 🎯 戦略概要

### 品質保証の挑戦
- **1人運営**: 限られたリソースでの包括的品質保証
- **外部API依存**: Instagram、Stripe等の不安定要素
- **リアルタイム性**: スケジュール実行の正確性要求
- **コスト制約**: テスト実行コストの最小化

### 戦略原則
1. **予防重視**: バグ発生を根本的に防ぐ設計
2. **自動化最大化**: 手動テストの最小化
3. **効率的カバレッジ**: 重要度に応じた段階的テスト
4. **継続的改善**: メトリクス駆動の品質向上

---

## 🏗️ テストピラミッド最適化

### A. 1人運営特化テスト配分

```mermaid
pyramid TB
    E2E[E2E Tests<br/>5% - Critical Path Only<br/>自動実行: 週1回]
    INT[Integration Tests<br/>15% - API & Service Layer<br/>自動実行: 日1回]
    UNIT[Unit Tests<br/>70% - Business Logic<br/>自動実行: コミット毎]
    STATIC[Static Analysis<br/>10% - Type Safety & Linting<br/>自動実行: 保存毎]
    
    style E2E fill:#ff6b6b
    style INT fill:#4ecdc4  
    style UNIT fill:#45b7d1
    style STATIC fill:#96ceb4
```

### B. 効率的テスト戦略

#### 1. 超高速ユニットテスト（70%）
```typescript
// frontend/src/utils/__tests__/schedule-logic.test.ts
import { describe, test, expect, vi } from 'vitest'
import { calculateNextRecurringRun } from '../schedule-logic'

describe('Schedule Logic - Core Business Rules', () => {
  // 🚀 Pure Function テスト - 0.1秒以内
  test('次回実行時刻計算の正確性', () => {
    const baseTime = new Date('2025-01-15T10:00:00Z') // 水曜日
    const repeatRule = {
      dayOfWeek: [1, 3, 5], // 月水金
      hour: 12,
      minute: 0,
      timezone: 'Asia/Tokyo'
    }
    
    const nextRun = calculateNextRecurringRun(baseTime, repeatRule)
    const expectedNext = new Date('2025-01-17T03:00:00Z') // 金曜日12:00 JST
    
    expect(nextRun).toEqual(expectedNext)
  })

  // 🧪 Property-Based Testing - Edge Case 網羅
  test('曜日計算の網羅性', () => {
    fc.assert(fc.property(
      fc.date(),
      fc.array(fc.integer(0, 6), { minLength: 1, maxLength: 7 }),
      fc.integer(0, 23),
      fc.integer(0, 59),
      (baseDate, dayOfWeek, hour, minute) => {
        const nextRun = calculateNextRecurringRun(baseDate, {
          dayOfWeek: [...new Set(dayOfWeek)], // 重複除去
          hour,
          minute,
          timezone: 'UTC'
        })
        
        // Property: 次回実行時刻は必ず未来
        expect(nextRun.getTime()).toBeGreaterThan(baseDate.getTime())
        
        // Property: 指定された曜日のいずれかに該当
        expect(dayOfWeek).toContain(nextRun.getDay())
      }
    ))
  })

  // ⚡ モック最小化パターン
  test('外部依存なし - 純粋ロジックテスト', () => {
    // モック不要、高速実行
    const result = validateScheduleData({
      caption: 'Test post',
      mediaUrls: ['https://example.com/image.jpg'],
      scheduledAt: new Date(Date.now() + 3600000)
    })
    
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual([])
  })
})

// functions/src/__tests__/unit/schedule-validation.test.ts
describe('Schedule Validation - Business Rules', () => {
  // 🔥 Firebase依存なしテスト
  test('投稿制限チェック - 純粋ロジック', () => {
    const userUsage = {
      postsThisMonth: 45,
      planLimit: 50,
      accountType: 'basic'
    }
    
    const validation = checkPostingLimits(userUsage, 1)
    
    expect(validation.allowed).toBe(true)
    expect(validation.remainingPosts).toBe(4)
  })

  test('制限超過時のエラーメッセージ', () => {
    const userUsage = {
      postsThisMonth: 50,
      planLimit: 50,
      accountType: 'basic'
    }
    
    const validation = checkPostingLimits(userUsage, 1)
    
    expect(validation.allowed).toBe(false)
    expect(validation.errorCode).toBe('MONTHLY_LIMIT_EXCEEDED')
    expect(validation.suggestedAction).toBe('UPGRADE_PLAN')
  })
})
```

#### 2. 統合テスト（15% - API層重点）
```typescript
// functions/__tests__/integration/schedule-api.test.ts
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing'

describe('Schedule API Integration', () => {
  let testEnv: RulesTestEnvironment

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'omniy-test-' + Date.now(),
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8')
      }
    })
  })

  afterAll(async () => {
    await testEnv.cleanup()
  })

  // 🔄 リアルFirestore使用 - データ整合性テスト
  test('スケジュール作成 → 取得 → 実行のフル流れ', async () => {
    const userId = 'test-user-123'
    const context = testEnv.authenticatedContext(userId)
    
    // 1. スケジュール作成
    const createResult = await context.functions()
      .httpsCallable('createScheduleV2')({
        caption: 'Integration test post',
        mediaUrls: ['https://test.example.com/image.jpg'],
        scheduledAt: new Date(Date.now() + 60000).toISOString(),
        isRecurring: false
      })
    
    expect(createResult.data.success).toBe(true)
    const scheduleId = createResult.data.scheduleId
    
    // 2. データ永続化確認
    const scheduleDoc = await context.firestore()
      .collection(`users/${userId}/schedules`)
      .doc(scheduleId)
      .get()
    
    expect(scheduleDoc.exists).toBe(true)
    expect(scheduleDoc.data()?.status).toBe('pending')
    
    // 3. スケジュール実行シミュレーション
    const executeResult = await context.functions()
      .httpsCallable('executeSchedule')({ scheduleId })
    
    expect(executeResult.data.success).toBe(true)
    
    // 4. 実行後状態確認
    const updatedDoc = await scheduleDoc.ref.get()
    expect(updatedDoc.data()?.status).toBe('completed')
  })

  // 🚨 エラーケーステスト
  test('認証失敗 → 権限エラー', async () => {
    const unauthenticatedContext = testEnv.unauthenticatedContext()
    
    await expect(
      unauthenticatedContext.functions()
        .httpsCallable('createScheduleV2')({})
    ).rejects.toMatchObject({
      code: 'unauthenticated'
    })
  })

  // 📊 パフォーマンステスト
  test('大量スケジュール処理性能', async () => {
    const userId = 'perf-test-user'
    const context = testEnv.authenticatedContext(userId)
    
    const startTime = Date.now()
    
    // 50件同時作成
    const promises = Array.from({ length: 50 }, (_, i) =>
      context.functions().httpsCallable('createScheduleV2')({
        caption: `Performance test ${i}`,
        mediaUrls: ['https://test.example.com/image.jpg'],
        scheduledAt: new Date(Date.now() + 60000 + i * 1000).toISOString()
      })
    )
    
    const results = await Promise.all(promises)
    const duration = Date.now() - startTime
    
    // すべて成功
    expect(results.every(r => r.data.success)).toBe(true)
    
    // パフォーマンス基準: 50件を5秒以内
    expect(duration).toBeLessThan(5000)
  })
})
```

#### 3. E2Eテスト（5% - Critical Path Only）
```typescript
// frontend/cypress/e2e/critical-user-journey.cy.ts
describe('Critical User Journey - Monthly Execution', () => {
  beforeEach(() => {
    // 🔧 テストデータ準備
    cy.task('seedTestData', {
      userId: 'e2e-test-user',
      accountData: {
        instagramAccounts: [
          {
            id: 'ig-test-account',
            username: 'test_account',
            accessToken: 'mock-token'
          }
        ]
      }
    })
    
    // モック設定
    cy.intercept('POST', '**/functions/createScheduleV2', {
      fixture: 'schedule-creation-success.json'
    }).as('createSchedule')
    
    cy.intercept('GET', '**/instagram-api/accounts', {
      fixture: 'instagram-accounts.json'  
    }).as('getAccounts')
  })

  // 🎯 最重要ユーザージャーニー（月1回実行）
  test('新規ユーザー → 初回投稿予約 → 成功', () => {
    // 1. ログイン
    cy.visit('/login')
    cy.get('[data-cy=login-button]').click()
    cy.url().should('include', '/dashboard')
    
    // 2. アカウント接続確認
    cy.get('[data-cy=connected-accounts]').should('contain', 'test_account')
    
    // 3. 投稿予約作成
    cy.get('[data-cy=create-schedule-button]').click()
    cy.get('[data-cy=schedule-form]').should('be.visible')
    
    cy.get('[data-cy=caption-input]').type('My first scheduled post!')
    cy.get('[data-cy=image-upload]').selectFile('cypress/fixtures/test-image.jpg')
    cy.get('[data-cy=datetime-picker]').type('2025-02-01T15:00')
    
    cy.get('[data-cy=submit-schedule]').click()
    cy.wait('@createSchedule')
    
    // 4. 成功確認
    cy.get('[data-cy=success-message]').should('contain', '予約が完了しました')
    cy.get('[data-cy=schedule-list]').should('contain', 'My first scheduled post!')
    
    // 5. スケジュール詳細確認
    cy.get('[data-cy=schedule-item]').first().click()
    cy.get('[data-cy=schedule-detail]').should('contain', '2025-02-01 15:00')
    cy.get('[data-cy=schedule-status]').should('contain', '予約中')
  })

  // 🚨 クリティカルエラーケース（月1回実行）
  test('Instagram連携エラー → 適切なエラー表示', () => {
    // Instagram API エラーをシミュレート
    cy.intercept('POST', '**/functions/createScheduleV2', {
      statusCode: 400,
      body: { error: 'Instagram token expired' }
    }).as('createScheduleError')
    
    cy.visit('/schedules')
    cy.get('[data-cy=create-schedule-button]').click()
    
    // フォーム入力
    cy.get('[data-cy=caption-input]').type('Test post')
    cy.get('[data-cy=submit-schedule]').click()
    cy.wait('@createScheduleError')
    
    // エラー処理確認
    cy.get('[data-cy=error-message]')
      .should('contain', 'Instagramの認証が必要です')
    cy.get('[data-cy=reconnect-button]').should('be.visible')
  })
})
```

---

## 🤖 外部API依存テスト戦略

### A. Instagram API テスト

#### Contract Testing（契約ベーステスト）
```typescript
// functions/__tests__/contracts/instagram-api.contract.test.ts
import { Pact } from '@pact-foundation/pact'

describe('Instagram API Contract', () => {
  const provider = new Pact({
    consumer: 'omniy-backend',
    provider: 'instagram-graph-api',
    port: 1234,
    log: './logs/pact.log',
    dir: './pacts',
    logLevel: 'INFO'
  })

  beforeAll(() => provider.setup())
  afterEach(() => provider.verify())
  afterAll(() => provider.finalize())

  test('メディア投稿成功パターン', async () => {
    // API契約定義
    await provider
      .given('有効なアクセストークン')
      .uponReceiving('メディア投稿リクエスト')
      .withRequest({
        method: 'POST',
        path: '/v18.0/me/media',
        headers: {
          'Authorization': like('Bearer VALID_TOKEN'),
          'Content-Type': 'application/json'
        },
        body: {
          image_url: like('https://example.com/image.jpg'),
          caption: like('Test post caption'),
          access_token: like('VALID_TOKEN')
        }
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: like('12345_67890')
        }
      })

    // 実際のテスト
    const response = await fetch('http://localhost:1234/v18.0/me/media', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer VALID_TOKEN',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: 'https://example.com/image.jpg',
        caption: 'Test post caption',
        access_token: 'VALID_TOKEN'
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.id).toBeDefined()
  })

  test('トークン期限切れエラーパターン', async () => {
    await provider
      .given('期限切れアクセストークン')
      .uponReceiving('メディア投稿リクエスト')
      .withRequest({
        method: 'POST',
        path: '/v18.0/me/media',
        headers: { 'Authorization': like('Bearer EXPIRED_TOKEN') }
      })
      .willRespondWith({
        status: 401,
        body: {
          error: {
            message: 'Access token has expired',
            type: 'OAuthException',
            code: 190
          }
        }
      })

    // エラーハンドリングテスト
    const response = await fetch('http://localhost:1234/v18.0/me/media', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer EXPIRED_TOKEN' }
    })

    expect(response.status).toBe(401)
    const error = await response.json()
    expect(error.error.type).toBe('OAuthException')
  })
})
```

#### 統合テスト用モックサーバー
```typescript
// functions/__tests__/mocks/instagram-mock-server.ts
import { setupServer } from 'msw/node'
import { rest } from 'msw'

/**
 * Instagram API モックサーバー
 * 開発・テスト環境での安定したAPI応答を提供
 */
export const instagramMockServer = setupServer(
  // メディア作成成功
  rest.post('https://graph.instagram.com/v18.0/me/media', (req, res, ctx) => {
    const { image_url, caption } = req.body as any
    
    // バリデーション
    if (!image_url || !caption) {
      return res(
        ctx.status(400),
        ctx.json({
          error: {
            message: 'Missing required fields',
            type: 'InvalidRequestException'
          }
        })
      )
    }
    
    // 成功レスポンス
    return res(
      ctx.delay(500), // リアルなレスポンス時間
      ctx.status(200),
      ctx.json({
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
    )
  }),

  // メディア公開
  rest.post('https://graph.instagram.com/v18.0/me/media_publish', (req, res, ctx) => {
    const { creation_id } = req.body as any
    
    return res(
      ctx.delay(1000), // 投稿処理時間
      ctx.status(200),
      ctx.json({
        id: `published_${creation_id}`
      })
    )
  }),

  // レート制限エラー（テスト用）
  rest.post('https://graph.instagram.com/v18.0/rate_limit_test', (req, res, ctx) => {
    return res(
      ctx.status(429),
      ctx.json({
        error: {
          message: 'Application request limit reached',
          type: 'OAuthException',
          code: 4
        }
      })
    )
  })
)

// テストセットアップ
beforeAll(() => instagramMockServer.listen())
afterEach(() => instagramMockServer.resetHandlers())
afterAll(() => instagramMockServer.close())
```

### B. Stripe API テスト

#### Webhook テスト戦略
```typescript
// functions/__tests__/integration/stripe-webhook.test.ts
import Stripe from 'stripe'
import { createRequest, createResponse } from 'node-mocks-http'

describe('Stripe Webhook Handling', () => {
  const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
    apiVersion: '2023-10-16'
  })

  test('サブスクリプション作成Webhook処理', async () => {
    // Stripeイベント作成
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      metadata: { userId: 'test-user-123' }
    })

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_test_basic_plan' }]
    })

    // Webhook イベント構築
    const event = stripe.webhooks.constructEvent(
      JSON.stringify({
        type: 'customer.subscription.created',
        data: { object: subscription }
      }),
      'test-signature',
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    // 関数実行
    const req = createRequest({
      method: 'POST',
      body: event,
      headers: {
        'stripe-signature': 'test-signature'
      }
    })
    const res = createResponse()

    await stripeWebhookHandler(req, res)

    // 結果検証
    expect(res._getStatusCode()).toBe(200)
    
    // Firestore更新確認
    const userDoc = await admin.firestore()
      .collection('users')
      .doc('test-user-123')
      .get()
    
    expect(userDoc.data()?.subscription?.status).toBe('active')
    expect(userDoc.data()?.subscription?.planId).toBe('basic')
  })

  test('支払い失敗Webhook処理', async () => {
    const paymentIntent = {
      id: 'pi_test_failed',
      status: 'payment_failed',
      customer: 'cus_test_customer',
      metadata: { userId: 'test-user-456' }
    }

    const event = {
      type: 'payment_intent.payment_failed',
      data: { object: paymentIntent }
    }

    const req = createRequest({
      method: 'POST',
      body: event
    })
    const res = createResponse()

    await stripeWebhookHandler(req, res)

    // エラー処理確認
    expect(res._getStatusCode()).toBe(200)
    
    // ユーザー通知確認（メール送信等）
    const userDoc = await admin.firestore()
      .collection('users')
      .doc('test-user-456')
      .get()
    
    expect(userDoc.data()?.paymentStatus).toBe('failed')
    expect(userDoc.data()?.notifications?.paymentFailed).toBeDefined()
  })
})
```

---

## 🔍 静的解析とセキュリティテスト

### A. SonarQube統合

#### 品質ゲート設定
```typescript
// sonar-project.properties
sonar.projectKey=omniy-instagram-scheduler
sonar.organization=omniy-team

# ソースとテスト
sonar.sources=frontend/src,functions/src,mcp-servers
sonar.tests=frontend/test,functions/__tests__,mcp-servers/__tests__
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/demos/**

# 言語設定
sonar.typescript.tsconfigPath=frontend/tsconfig.json,functions/tsconfig.json

# 品質ゲート基準（1人運営最適化）
sonar.qualitygate.wait=true

# カバレッジ基準
sonar.coverage.minimum=80
sonar.coverage.exclusions=**/*test*/**,**/demos/**

# 複雑度基準
sonar.cognitive_complexity.maximum=15
sonar.cyclomatic_complexity.maximum=10

# 重複コード基準
sonar.duplicated_lines_density.maximum=3

# セキュリティ基準
sonar.security_hotspots.inherit=true
sonar.vulnerabilities.inherit=true
```

#### GitHub Actions統合
```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # SonarQube分析用

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../functions && npm ci

      - name: Run tests with coverage
        run: |
          cd frontend && npm run test:coverage
          cd ../functions && npm run test:coverage

      - name: SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: Quality Gate Check
        run: |
          if [ "${{ steps.sonarqube-quality-gate-check.outputs.quality-gate-status }}" != "PASSED" ]; then
            echo "Quality gate failed"
            exit 1
          fi
```

### B. セキュリティテスト自動化

#### 依存関係脆弱性スキャン
```typescript
// package.json (scripts追加)
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:fix": "npm audit fix",
    "security:snyk": "snyk test",
    "security:full": "npm run security:audit && npm run security:snyk"
  },
  "devDependencies": {
    "snyk": "^1.1200.0"
  }
}

// .github/workflows/security-scan.yml
name: Security Scan
on:
  schedule:
    - cron: '0 6 * * 1'  # 毎週月曜日朝6時
  workflow_dispatch:

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

---

## 📊 品質メトリクスとモニタリング

### A. リアルタイム品質ダッシュボード

#### メトリクス収集
```typescript
// functions/src/utils/quality-metrics.ts
export class QualityMetricsCollector {
  private static metrics = new Map<string, any>()

  static recordTestExecution(testType: string, duration: number, success: boolean) {
    const metric = {
      testType,
      duration,
      success,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV
    }

    this.metrics.set(`${testType}_${Date.now()}`, metric)
    
    // Firebase Analytics送信
    this.sendToAnalytics('test_execution', metric)
  }

  static recordBugDetection(bugType: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    const metric = {
      bugType,
      severity,
      detectedAt: Date.now(),
      version: process.env.npm_package_version
    }

    this.sendToAnalytics('bug_detected', metric)
  }

  static recordDeploymentQuality(deploymentId: string, metrics: {
    testCoverage: number
    buildTime: number
    bundleSize: number
    errors: number
  }) {
    this.sendToAnalytics('deployment_quality', {
      deploymentId,
      ...metrics,
      timestamp: Date.now()
    })
  }

  private static sendToAnalytics(eventName: string, data: any) {
    // Firebase Analytics or Custom Analytics
    admin.analytics().logEvent(eventName, data)
  }
}
```

### B. 自動改善提案システム

#### AI駆動品質改善
```typescript
// tools/scripts/quality-analyzer.ts
export class QualityAnalyzer {
  async analyzeCodebaseQuality(): Promise<QualityReport> {
    const metrics = await this.collectMetrics()
    const issues = await this.identifyIssues(metrics)
    const suggestions = await this.generateSuggestions(issues)

    return {
      overallScore: this.calculateScore(metrics),
      criticalIssues: issues.filter(i => i.severity === 'critical'),
      improvements: suggestions,
      trends: await this.analyzeTrends(metrics)
    }
  }

  private async collectMetrics(): Promise<QualityMetrics> {
    return {
      testCoverage: await this.getTestCoverage(),
      codeComplexity: await this.getCodeComplexity(),
      duplicateCode: await this.getDuplicateCode(),
      securityVulnerabilities: await this.getSecurityIssues(),
      performanceMetrics: await this.getPerformanceMetrics()
    }
  }

  private generateSuggestions(issues: QualityIssue[]): QualityImprovement[] {
    return issues.map(issue => ({
      type: issue.type,
      priority: this.calculatePriority(issue),
      effort: this.estimateEffort(issue),
      impact: this.estimateImpact(issue),
      actionPlan: this.generateActionPlan(issue)
    }))
  }
}
```

## 🎯 期待される効果

### 品質向上指標
```yaml
バグ検出率:
  - 本番バグ: 現在 3件/月 → 目標 0.5件/月 (83%削減)
  - ユーザー報告バグ: 現在 8件/月 → 目標 2件/月 (75%削減)
  - セキュリティ問題: 現在 1件/四半期 → 目標 0件 (100%削減)

開発効率:
  - テスト実行時間: 現在 12分 → 目標 5分 (58%短縮)
  - デバッグ時間: 現在 4時間/問題 → 目標 1時間/問題 (75%短縮)
  - リリースサイクル: 現在 2週間 → 目標 1週間 (50%短縮)

運用コスト:
  - サポート対応: 現在 8時間/週 → 目標 2時間/週 (75%削減)
  - テスト実行コスト: 現在 ¥15,000/月 → 目標 ¥5,000/月 (67%削減)
  - 品質保証工数: 現在 40時間/月 → 目標 15時間/月 (63%削減)
```

この包括的品質保証戦略により、**1人運営でもエンタープライズ級の品質を維持**できるシステムが構築されます。