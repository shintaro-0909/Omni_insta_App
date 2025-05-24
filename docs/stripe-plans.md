# Stripe プラン設定

## 📋 プラン構成

### Free プラン
- **プランID**: `free`
- **価格**: ¥0/月
- **機能制限**:
  - Instagramアカウント: 1個
  - 月間投稿数: 10回
  - 予約投稿: 基本機能のみ
  - サポート: コミュニティ

### Basic プラン
- **プランID**: `basic`
- **価格**: ¥980/月
- **Stripe Price ID**: `price_basic_monthly_jpy`
- **機能**:
  - Instagramアカウント: 3個
  - 月間投稿数: 100回
  - 予約投稿: 全機能
  - 繰り返し投稿: 対応
  - ランダム投稿: 対応
  - サポート: メール

### Pro プラン
- **プランID**: `pro`
- **価格**: ¥2,980/月
- **Stripe Price ID**: `price_pro_monthly_jpy`
- **機能**:
  - Instagramアカウント: 10個
  - 月間投稿数: 500回
  - 予約投稿: 全機能
  - 繰り返し投稿: 対応
  - ランダム投稿: 対応
  - プロキシ設定: 対応
  - 優先サポート: 対応

### Business プラン
- **プランID**: `business`
- **価格**: ¥9,800/月
- **Stripe Price ID**: `price_business_monthly_jpy`
- **機能**:
  - Instagramアカウント: 無制限
  - 月間投稿数: 無制限
  - 全機能対応
  - 専用サポート
  - API アクセス

## 🗄️ Firestore スキーマ

### plans コレクション
```typescript
interface Plan {
  planId: string;
  name: string;
  description: string;
  price: number; // 円
  currency: 'jpy';
  interval: 'month';
  stripePriceId: string | null; // Freeプランはnull
  features: {
    instagramAccountLimit: number; // -1 = 無制限
    monthlyPostLimit: number; // -1 = 無制限
    scheduledPosts: boolean;
    recurringPosts: boolean;
    randomPosts: boolean;
    proxySupport: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### subscriptions コレクション
```typescript
interface Subscription {
  userId: string;
  planId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null; // Freeプランはnull
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### paymentHistory コレクション
```typescript
interface PaymentHistory {
  userId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: 'jpy';
  status: 'succeeded' | 'failed' | 'pending';
  planId: string;
  description: string;
  createdAt: Timestamp;
}
```

## 🔧 Stripe Webhook イベント

### 処理対象イベント
- `customer.subscription.created`: サブスクリプション作成
- `customer.subscription.updated`: サブスクリプション更新
- `customer.subscription.deleted`: サブスクリプション削除
- `invoice.payment_succeeded`: 支払い成功
- `invoice.payment_failed`: 支払い失敗

## 🚀 実装フェーズ

### Phase 1: 基本設定
- [ ] Stripe アカウント設定
- [ ] プラン情報のFirestore登録
- [ ] 環境変数設定

### Phase 2: バックエンド実装
- [ ] Stripe Checkout セッション作成
- [ ] Webhook 処理実装
- [ ] サブスクリプション管理API

### Phase 3: フロントエンド実装
- [ ] プラン選択画面
- [ ] 決済フロー
- [ ] サブスクリプション管理画面

### Phase 4: テスト・デプロイ
- [ ] テストモード動作確認
- [ ] 本番環境設定
- [ ] E2Eテスト実装 