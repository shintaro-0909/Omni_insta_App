Claude Rules :look👀

# Omniy コード品質基準書

## 📝 コメント品質ガイドライン

### A. JSDoc標準化

#### 必須JSDocセクション
```typescript
/**
 * Instagram投稿スケジュール作成
 * 
 * @description 指定された日時にInstagramに自動投稿するスケジュールを作成します。
 * 重複チェック、アクセス権限検証、コンテンツ検証を実行します。
 * 
 * @param scheduleData - スケジュール作成データ
 * @param options - 作成オプション（プレビューモード、テスト実行等）
 * 
 * @returns スケジュール作成結果（ID、実行予定時刻、検証結果）
 * 
 * @throws {ValidationError} 入力データが無効な場合
 * @throws {PermissionError} アカウントへのアクセス権限がない場合
 * @throws {RateLimitError} API呼び出し制限に達した場合
 * 
 * @example
 * ```typescript
 * const result = await createSchedule({
 *   userId: 'user123',
 *   accountId: 'ig456',
 *   content: { caption: 'Hello World!', mediaUrls: ['...'] },
 *   scheduledAt: new Date('2024-02-01T12:00:00Z')
 * })
 * console.log(`Created schedule: ${result.scheduleId}`)
 * ```
 * 
 * @since v1.0.0
 * @see {@link getSchedule} - スケジュール取得
 * @see {@link updateSchedule} - スケジュール更新
 */
export async function createSchedule(
  scheduleData: CreateScheduleData,
  options: CreateOptions = {}
): Promise<CreateScheduleResult> {
  // 実装...
}
```

### B. アルゴリズム解説コメント

#### 複雑ロジックの詳細解説
```typescript
/**
 * 繰り返しスケジュールの次回実行時刻計算
 * 
 * ⚠️ 複雑なアルゴリズム：夏時間、祝日、API制限を考慮
 * 
 * 計算ステップ:
 * 1. 基準時刻から指定曜日の次回発生日を算出
 * 2. タイムゾーン変換（UTC → ユーザーローカル → Instagram API）
 * 3. 夏時間（DST）移行期間の調整
 * 4. Instagram APIレート制限時間帯の回避
 * 5. 祝日・メンテナンス時間の回避
 * 
 * @param baseTime - 計算基準時刻（UTC）
 * @param repeatRule - 繰り返し設定（曜日、時刻、タイムゾーン）
 * @param constraints - 制約条件（祝日、メンテナンス時間等）
 */
export function calculateNextRecurringRun(
  baseTime: Date,
  repeatRule: RepeatRule,
  constraints: TimeConstraints
): Date {
  // Step 1: 基本的な次回実行日計算
  let nextRun = findNextWeekdayOccurrence(baseTime, repeatRule.dayOfWeek)
  
  // Step 2: タイムゾーン変換
  // Instagram APIは太平洋時間基準のため、複雑な変換が必要
  nextRun = convertToInstagramTimezone(nextRun, repeatRule.timezone)
  
  // Step 3: 夏時間調整
  // 春の時計進行時: 2:00 AM → 3:00 AM（1時間スキップ）
  // 秋の時計後退時: 2:00 AM → 1:00 AM（1時間重複）
  if (isDSTTransitionPeriod(nextRun, repeatRule.timezone)) {
    nextRun = adjustForDSTTransition(nextRun, repeatRule.timezone)
  }
  
  // Step 4: APIレート制限回避
  // Instagram APIは特定時間帯（0:00-2:00 PST）で制限強化
  if (isHighRateLimitPeriod(nextRun)) {
    nextRun = adjustToAvoidRateLimit(nextRun)
  }
  
  // Step 5: 制約条件チェック
  while (violatesConstraints(nextRun, constraints)) {
    nextRun = addDays(nextRun, 7) // 1週間後に延期
  }
  
  return nextRun
}
```

### C. ビジネスロジック説明

#### ドメイン知識の記録
```typescript
/**
 * Instagram投稿制限チェック
 * 
 * 🏢 ビジネスルール:
 * - Basic Displayアカウント: 25投稿/日
 * - Business/Creatorアカウント: 250投稿/日  
 * - ストーリー: 100投稿/日（全アカウント共通）
 * - リール: 10投稿/日（推奨値、API制限ではない）
 * 
 * 📊 計測方法:
 * - カウント期間: アカウントのタイムゾーンで0:00-23:59
 * - 削除済み投稿もカウントに含む（Instagram側の仕様）
 * - 下書き保存は投稿数にカウントしない
 * 
 * ⚠️ 制限超過時の動作:
 * - 即時エラーではなく、スケジュール作成は許可
 * - 実行時にAPI呼び出しでエラー検出
 * - 自動的に次の利用可能時刻に延期
 */
export class InstagramPostingLimits {
  // 実装...
}
```

## 🔍 静的解析強化

### ESLint カスタムルール

#### 新設: .eslintrc.custom.js
```javascript
module.exports = {
  extends: ['@vue/typescript/recommended'],
  rules: {
    // Omniy固有ルール
    'omniy/no-any-type': 'error',           // any型禁止
    'omniy/require-jsdoc': 'error',         // public関数のJSDoc必須
    'omniy/no-direct-firebase-import': 'error', // Firebase直接importの禁止
    'omniy/consistent-error-handling': 'error', // エラーハンドリング統一
    
    // TypeScript厳密化
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    
    // Vue.js特化
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/custom-event-name-casing': ['error', 'kebab-case']
  }
}
```

### SonarQube統合

#### 新設: sonar-project.properties
```properties
sonar.projectKey=omniy-instagram-scheduler
sonar.organization=omniy-team
sonar.sources=frontend/src,functions/src
sonar.tests=frontend/test,functions/__tests__
sonar.coverage.exclusions=**/*test*/**,**/node_modules/**,**/demos/**
sonar.typescript.tsconfigPath=frontend/tsconfig.json,functions/tsconfig.json

# 品質ゲート設定
sonar.qualitygate.wait=true
sonar.coverage.minimum=80
sonar.duplicated_lines_density.maximum=3
sonar.cognitive_complexity.maximum=15
```

## 🧪 高度なテスト戦略

### Contract Testing（契約ベーステスト）

#### Instagram API契約テスト
```typescript
// functions/__tests__/contracts/instagram-api.contract.test.ts
import { Pact } from '@pact-foundation/pact'

describe('Instagram API Contract', () => {
  const provider = new Pact({
    consumer: 'omniy-backend',
    provider: 'instagram-graph-api'
  })

  test('should publish media successfully', async () => {
    await provider
      .given('valid access token and media data')
      .uponReceiving('a media publish request')
      .withRequest({
        method: 'POST',
        path: '/me/media',
        headers: { 'Authorization': like('Bearer token') },
        body: {
          image_url: like('https://example.com/image.jpg'),
          caption: like('Test post'),
          access_token: like('valid_token')
        }
      })
      .willRespondWith({
        status: 200,
        body: {
          id: like('12345'),
          permalink: like('https://instagram.com/p/xxx')
        }
      })

    // 実際のテスト実行
  })
})
```

### Property-Based Testing

#### ドメインロジックの徹底検証
```typescript
// frontend/src/utils/__tests__/schedule-calculation.property.test.ts
import fc from 'fast-check'

describe('Schedule Calculation Properties', () => {
  test('次回実行時刻は常に未来である', () => {
    fc.assert(fc.property(
      fc.date(),  // 任意の基準時刻
      fc.record({ // 任意の繰り返しルール
        dayOfWeek: fc.integer(0, 6),
        hour: fc.integer(0, 23),
        minute: fc.integer(0, 59),
        timezone: fc.constantFrom('Asia/Tokyo', 'America/New_York', 'UTC')
      }),
      (baseTime, repeatRule) => {
        const nextRun = calculateNextRecurringRun(baseTime, repeatRule)
        expect(nextRun.getTime()).toBeGreaterThan(baseTime.getTime())
      }
    ))
  })

  test('同一設定での計算結果は決定的である', () => {
    fc.assert(fc.property(
      fc.date(),
      fc.record({
        dayOfWeek: fc.integer(0, 6),
        hour: fc.integer(0, 23),
        minute: fc.integer(0, 59),
        timezone: fc.constant('Asia/Tokyo')
      }),
      (baseTime, repeatRule) => {
        const result1 = calculateNextRecurringRun(baseTime, repeatRule)
        const result2 = calculateNextRecurringRun(baseTime, repeatRule)
        expect(result1.getTime()).toBe(result2.getTime())
      }
    ))
  })
})
```

## 📊 期待される効果

### 品質向上指標
- **バグ発見率**: 現在比 40% 向上
- **開発効率**: 型安全性による修正時間 60% 削減  
- **保守性**: コメント品質向上により新規参入コスト 70% 削減
- **テスト信頼性**: Contract/Property testing により Edge case coverage 90% 向上

### 実行優先度
1. **即時実行（1週間）**: 型安全性パターン導入、JSDoc標準化
2. **短期実行（2週間）**: ESLintカスタムルール、実行時検証
3. **中期実行（1ヶ月）**: SonarQube統合、Contract testing
4. **長期実行（2ヶ月）**: Property-based testing完全導入