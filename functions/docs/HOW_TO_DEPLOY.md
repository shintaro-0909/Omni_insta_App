# Grandfather Pricing システム デプロイガイド

## 前提条件

- Firebase CLI がインストール済み
- Node.js 18+ がインストール済み
- Stripe アカウントが設定済み
- 適切な権限でFirebaseプロジェクトにアクセス可能

## デプロイ手順

### Phase 1: 環境準備

#### 1. 環境変数の設定

`.env` ファイルを作成し、以下の値を設定：

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxx  # 本番環境では sk_live_
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRODUCT_ID=prod_xxx     # ★重要: 事前にStripeで作成

# Instagram API (既存)
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret

# Grandfather Pricing Configuration
CURRENT_PRICE_ID=price_tier_000     # ★重要: 事前にStripeで作成
PRICING_STEP_SIZE=100
PRICING_INCREMENT=500
PRICING_START_AMOUNT=4980
PRICING_MAX_AMOUNT=14800
PRICING_CURRENCY=jpy

# Environment
NODE_ENV=production
```

#### 2. Stripe での事前設定

```bash
# Stripe CLI でProductとPriceを作成
stripe products create \
  --name="Omniy Subscription" \
  --description="Instagram scheduling service"

# 初期価格を作成
stripe prices create \
  --unit-amount=4980 \
  --currency=jpy \
  --recurring[interval]=month \
  --product=prod_xxx \
  --lookup-key=tier_000 \
  --metadata[tier]=tier_000 \
  --metadata[maxSubscribers]=100 \
  --metadata[createdBy]=manual

# 作成されたPrice IDを CURRENT_PRICE_ID に設定
```

### Phase 2: データベース初期化

#### 3. 初期化スクリプト実行

```bash
cd functions

# 依存関係インストール
npm install

# TypeScriptビルド
npm run build

# stats/global コレクション初期化
npm run migrate:init-stats

# price_history コレクション初期化
npm run migrate:init-prices
```

#### 4. 検証

```bash
# Firestoreで確認
# - stats/global ドキュメントが作成されている
# - price_history コレクションに初期レコードが存在
# - currentSubscribers と peakSubscribers が正しい値
```

### Phase 3: 既存データ移行

#### 5. 移行前バックアップ

```bash
# Firestoreバックアップ
gcloud firestore export gs://your-backup-bucket/backup-$(date +%Y%m%d)

# 重要コレクションのエクスポート
firebase emulators:export ./pre-migration-backup
```

#### 6. 移行実行

```bash
# 移行スクリプト実行（本番環境では慎重に）
npm run migrate:to-grandfather

# 移行結果確認
# - ユーザーの currentPlan.isGrandfathered が true
# - サブスクリプションの originalPrice が設定
# - stats/global の値が正しい
```

### Phase 4: Cloud Functions デプロイ

#### 7. テスト実行

```bash
# 全テスト実行
npm run test:all

# Grandfather Pricing 特化テスト
npm run test:grandfather
npm run test:pricing
npm run test:plan-limits

# カバレッジ確認
npm run test:coverage
```

#### 8. 段階的デプロイ

```bash
# ステージング環境でテスト
npm run deploy:staging

# 本番環境デプロイ
npm run deploy:production

# またはシンプルデプロイ
firebase deploy --only functions
```

### Phase 5: 設定・検証

#### 9. Cloud Scheduler 有効化

```bash
# 価格ローテーション機能が有効化されているか確認
gcloud scheduler jobs list

# 手動でテスト実行
gcloud scheduler jobs run rotatePriceHandler-schedule
```

#### 10. Webhook 設定

Stripe Dashboard で以下のWebhookを設定：

```
エンドポイント: https://your-region-your-project.cloudfunctions.net/stripeWebhook
イベント:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated  
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

#### 11. 動作確認

```bash
# ログ監視
firebase functions:log --follow

# テスト課金（Stripeテストモード）
# 1. 新規ユーザー登録
# 2. 課金処理
# 3. stats.currentSubscribers が増加
# 4. peakSubscribers が更新
# 5. Grandfathered価格で保存
```

## 本番環境での確認項目

### 1. データ整合性チェック

```sql
-- Firestoreクエリ（概念的な表現）

-- stats/global の確認
stats.global: {
  currentSubscribers: 実際のアクティブサブスクリプション数,
  peakSubscribers: >= currentSubscribers,
  currentPriceId: 有効なStripe Price ID
}

-- price_history の確認
price_history WHERE isActive = true: 1件のみ存在

-- ユーザーデータの確認
users WHERE currentPlan.isGrandfathered = true: 移行ユーザー全員
```

### 2. 機能テスト

#### 新規課金テスト
```bash
# 1. Checkoutセッション作成
# 2. 決済完了
# 3. currentSubscribers++
# 4. 必要に応じて価格ローテーション
# 5. Grandfathered価格で保存
```

#### 解約テスト
```bash
# 1. サブスクリプション解約
# 2. currentSubscribers--
# 3. peakSubscribers は変更されない ★重要
# 4. 価格は据え置き
```

#### 価格ローテーションテスト
```bash
# peakSubscribers が閾値を超えた場合:
# 1. 新しいStripe Price作成
# 2. price_history 更新
# 3. stats.currentPriceId 更新
# 4. 既存ユーザーの価格は変更されない
```

### 3. 監視設定

#### Cloudwatch/Cloud Monitoring アラート

```yaml
alerts:
  - name: "PeakSubscribers Decrease"
    condition: "stats.peakSubscribers < previous_value"
    severity: "CRITICAL"
    
  - name: "Price Rotation Error"
    condition: "rotatePriceHandler function errors"
    severity: "HIGH"
    
  - name: "Stripe Webhook Failure"
    condition: "stripeWebhook function errors > 5"
    severity: "HIGH"
    
  - name: "Grandfather Price Violation"
    condition: "subscription.originalPrice changed"
    severity: "CRITICAL"
```

#### ログ監視

```bash
# 定期的に確認すべきログ
firebase functions:log --only rotatePriceHandler --since 1h
firebase functions:log --only stripeWebhook --since 1h
firebase functions:log --severity error --since 24h
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. 価格ローテーションが動作しない

**症状**: 新規ユーザー増加時に価格が更新されない

**確認点**:
```bash
# Cloud Schedulerが有効か
gcloud scheduler jobs list | grep rotatePriceHandler

# 環境変数が設定されているか
firebase functions:config:get

# Stripe Product IDが正しいか
echo $STRIPE_PRODUCT_ID
```

**解決方法**:
```bash
# Cloud Schedulerを手動実行
gcloud scheduler jobs run rotatePriceHandler-schedule

# 環境変数を再設定
firebase functions:config:set stripe.product_id="prod_xxx"
firebase deploy --only functions
```

#### 2. Grandfathered価格が正しくない

**症状**: 既存ユーザーの請求額が変わってしまった

**確認点**:
```bash
# サブスクリプションデータを確認
# subscriptions WHERE userId = "xxx"
# - originalPrice が正しいか
# - isGrandfathered = true か
# - stripePriceId が変更されていないか
```

**解決方法**:
```bash
# 緊急時: 手動でサブスクリプション修正
# Stripe Dashboardで該当サブスクリプションの価格を元に戻す
# Firestoreのデータも整合性を取る
```

#### 3. stats.peakSubscribers が異常に減少

**症状**: peakSubscribersが過去の値より小さくなっている

**重要度**: **CRITICAL** - システムの根幹に関わる

**確認点**:
```bash
# 最近のpeakSubscribers変更履歴
firebase functions:log --only rotatePriceHandler | grep peakSubscribers

# 手動操作やスクリプトでの変更がないか確認
```

**解決方法**:
```bash
# 緊急修正: 正しい値に戻す
# stats.global.peakSubscribers を過去最大値に設定
# 価格計算が正しくなることを確認
```

### 緊急時のロールバック手順

#### 完全ロールバック（最終手段）

```bash
# 1. 緊急停止
gcloud scheduler jobs pause rotatePriceHandler-schedule

# 2. データロールバック
npm run migrate:rollback

# 3. 旧システムのCloud Functions デプロイ
git checkout previous-stable-commit
firebase deploy --only functions

# 4. データ整合性確認
# 5. 段階的な復旧計画策定
```

## 本番環境での運用

### 定期メンテナンス

#### 毎日
- Cloud Functions エラーログ確認
- stats.peakSubscribers の異常チェック
- Stripe Webhook の成功率確認

#### 毎週  
- price_history データの整合性確認
- Grandfathered契約の請求額確認
- パフォーマンスメトリクス確認

#### 毎月
- Firestoreバックアップ実行
- 価格体系の見直し検討
- システム監視アラートの調整

### スケーリング考慮事項

#### Firestore制限
- 書き込み: 1秒間に10,000回まで
- stats.global への同時書き込み: ホットスポット対策必要
- 大量課金時のトランザクション競合

#### Cloud Functions制限
- 同時実行数: デフォルト1,000
- 実行時間: 最大9分（価格ローテーション用）
- メモリ使用量: 大量データ処理時の最適化

#### Stripe API制限
- 毎秒100リクエスト
- Price作成の頻度制限
- Webhook再試行の考慮

### セキュリティ

#### 重要な保護事項
1. **peakSubscribers の不正変更防止**
2. **originalPrice の改ざん防止**  
3. **Stripe Webhook の検証**
4. **環境変数の暗号化**
5. **管理者アクセスの監査**

これらのセキュリティ要件は、**Grandfather Pricing システムの信頼性**に直結する重要な要素です。