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

### Starter プラン
- **プランID**: `starter`
- **価格**: ¥1,980/月 (初期3ヶ月) → ¥2,980/月
- **Stripe Price ID**: `price_starter_monthly_jpy`
- **機能**:
  - Instagramアカウント: 3個
  - 月間投稿数: 100回
  - 予約投稿: 全機能
  - 繰り返し投稿: 対応
  - ランダム投稿: 対応
  - サポート: メール

### Pro プラン
- **プランID**: `pro`
- **価格**: ¥4,980/月 (初期3ヶ月) → ¥6,980/月
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
- **価格**: ¥14,800/月 (初期3ヶ月) → ¥19,800/月
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
    dailyPostLimitPerAccount: number;
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

## 🆕 投稿上限ポリシー（2025-01 改訂）

> **変更理由**: Instagram Graph API の仕様に合わせ、有料プラン利用者が最大限の投稿パフォーマンスを得られるようにする。無料プランは従来通りの制限を維持。

| プラン | 1アカウントあたりの投稿上限 | アカウント上限 | 月間総投稿上限* |
|--------|-----------------------------|----------------|-----------------
| Free | 10回 / 月 | 1 | 10回 |
| Basic | **50回 / 日** | 3 | 4,500回（理論値） |
| Pro | **50回 / 日** | 10 | 15,000回（理論値） |
| Business | **50回 / 日** | 無制限 | 無制限 |

\*月間総投稿上限は「50回×30日×アカウント数」で理論値計算。実装上は**日次上限で判定**し、月次は参考値とする。

### 実装方針
1. Firestore `plans.features` に `dailyPostLimitPerAccount` (number) を追加。
2. Cloud Functions 側で **日次使用量** を `usage.dailyPostCount.{igAccountId}` でトラッキングし、日付リセットを実装。
3. フロントエンド使用量ダッシュボードに「今日の投稿数」メトリクスを追加。

---

## 💰 1人運営向け現実的価格戦略

> **段階的価格設定**: 初期ユーザー獲得 → 機能追加で適正価格化
> **既存ユーザー優遇**: 6ヶ月間価格据え置き保証

### 価格改定スケジュール

| 期間 | Starter | Pro | Business | 戦略 |
|------|---------|-----|----------|------|
| Month 1-3 | ¥1,980 | ¥4,980 | ¥14,800 | 低価格で初期ユーザー獲得 |
| Month 4-6 | ¥2,980 | ¥6,980 | ¥19,800 | AI機能追加で値上げ |
| Month 7+ | ¥2,980 | ¥6,980 | ¥19,800 | 価格安定、機能追加 |

### 既存ユーザー保護ポリシー
- 価格改定時、既存ユーザーは6ヶ月間旧価格で利用可能
- 新機能も制限なく利用可能
- 早期採用者への感謝の意を示す

> 月間収益目標: **Phase 1: ¥250K, Phase 2: ¥1,600K, Phase 3: ¥5,000K**

### 価格帯 & 必要契約数（概算）
| プラン | 月額 (税込) | 目標契約数 | 売上 | 目標比率 |
|--------|-------------|-----------|-------|-----------|
| Basic | ¥1,280 | 400 | ¥512,000 | 40 % |
| Pro | ¥3,480 | 140 | ¥487,200 | 38 % |
| Business | ¥12,800 | 10 | ¥128,000 | 10 % |
| その他 (Free→有料転換) | — | — | ¥ (残差) | 12 % |
| **合計** | — | 550 | **¥1,127,200** | 113 % |

*価格改定案: 既存 `¥980/¥2,980/¥9,800` → 値上げし機能強化 (投稿上限、サポート)。*

### マーケティング施策
- Free → Basic へのフェアユース制限ポップアップ (月間10件超でバナー表示)。
- Pro 以上は **代理店向け割引 (年払い10%OFF)** を追加。
- Business 契約で **APIアクセス & ホワイトラベル** 提供。

> 詳細な利益計算・コスト分析は `docs/pricing_strategy.md` を参照。（新規追加）

---

<!-- 既存プランテーブルは変更せず、上記セクションを追加し差分を明示 --> 