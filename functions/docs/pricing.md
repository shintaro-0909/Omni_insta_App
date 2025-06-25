# Grandfather Pricing + Price-Ladder システム

## 概要

Omniyは、Plan-Basedからより柔軟な**Grandfather Pricing + Price-Ladder**システムに移行しました。このシステムでは：

- **段階的値上げ**: 100ユーザーごとに¥500値上げ
- **既存顧客据え置き**: 契約時の価格を永続的に維持
- **値下げ防止**: 解約により人数が減っても価格は下がらない

## システム仕様

### 価格階層

| ユーザー数 | 価格 (月額) | Tier | Lookup Key |
|-----------|------------|------|------------|
| 1-100     | ¥4,980     | 0    | tier_000   |
| 101-200   | ¥5,480     | 1    | tier_001   |
| 201-300   | ¥5,980     | 2    | tier_002   |
| ...       | ...        | ...  | ...        |
| 1,901-2,000+ | ¥14,800 | 20   | tier_020   |

### 重要な仕様

1. **peakSubscribers基準**: 価格判定は「過去最大の同時課金者数」を基準とする
2. **値下げ禁止**: 解約により人数が減っても価格は絶対に下がらない
3. **Grandfather価格**: 既存ユーザーは契約時の価格を永続的に維持
4. **再加入時**: 解約→再契約時は現行価格を適用

## アーキテクチャ

### システムフロー図

```mermaid
graph TD
    A[新規ユーザー Checkout] --> B[stats.currentSubscribers++]
    B --> C[peakSubscribers = max(peak, current + 1)]
    C --> D{価格上限チェック}
    D -->|必要| E[新Price作成 → Stripe]
    D -->|不要| F[現在価格で契約]
    E --> G[price_history更新]
    G --> F
    F --> H[Grandfathered価格で保存]
    
    I[解約発生] --> J[stats.currentSubscribers--]
    J --> K[peakSubscribers は変更しない]
    K --> L[価格据え置き]
    
    M[Checkout Session作成] --> N[stats.currentPriceId取得]
    N --> O[現在価格でCheckout]
```

### データベース設計

#### stats/global コレクション
```typescript
interface GlobalStats {
  currentSubscribers: number;    // 現在の課金者数
  peakSubscribers: number;       // 過去最大課金者数 ★値下げ防止の核心
  currentPriceId: string;        // 現在適用中の価格ID
  lastUpdated: Timestamp;        // 最終更新日時
}
```

#### price_history コレクション
```typescript
interface PriceHistoryRecord {
  priceId: string;               // Stripe Price ID
  lookupKey: string;             // tier_000, tier_001, etc.
  maxSubscribers: number;        // この価格が適用される最大加入者数
  amount: number;                // 価格（円）
  currency: string;              // 通貨コード
  createdAt: Timestamp;          // 作成日時
  isActive: boolean;             // 現在アクティブか
  metadata: {
    tier: string;
    createdBy: string;           // auto_rotate, manual, migration
    maxSubscribers: string;
  };
}
```

#### subscriptions コレクション（更新版）
```typescript
interface Subscription {
  userId: string;
  planId: "subscription";        // 新システムでは統一
  priceTier: string;            // tier_000, tier_001, etc.
  stripeSubscriptionId: string;
  stripePriceId: string;
  originalPrice: number;         // Grandfather価格 ★重要
  currentPrice: number;          // 現在の価格（参考値）
  isGrandfathered: boolean;      // Grandfathered契約か
  // ... その他標準フィールド
}
```

## 実装詳細

### 価格計算ロジック

```typescript
// 100人ごとに¥500値上げ、上限¥14,800
export const calculatePriceForSubscribers = (subscriberCount: number): number => {
  if (subscriberCount <= 0) return 4980;
  
  const stepCount = Math.max(0, Math.ceil(subscriberCount / 100) - 1);
  const calculatedPrice = 4980 + (stepCount * 500);
  
  return Math.min(calculatedPrice, 14800);
};
```

### 価格ローテーション

```typescript
// 1分間隔で実行
export const rotatePriceHandler = functions.pubsub
  .schedule(\"every 1 minutes\")\n  .onRun(async () => {\n    // A. peakSubscribers更新（値下げ防止）\n    peakSubscribers = max(peakSubscribers, currentSubscribers + 1);\n    \n    // B. 値上げ判定\n    if (peakSubscribers > currentPriceRecord.maxSubscribers) {\n      // 新しいPrice作成 → price_history更新\n    }\n    \n    // C. 値下げロジックは実装しない ★重要\n  });
```

### Webhook処理

```typescript
// Checkout完了時
case \"checkout.session.completed\":\n  await incrementCurrentSubscribers();\n  await rotatePrice(); // 価格ローテーションをトリガー\n\n// サブスクリプション削除時\ncase \"customer.subscription.deleted\":\n  await decrementCurrentSubscribers();\n  // peakSubscribersは変更しない ★値下げ防止
```

## FAQ

### Q: 人数が減ったら価格は下がらないの？

A: **下がりません**。これがGrandfather Pricing + Price-Ladderシステムの核心的な仕様です。

- **価格判定**: `peakSubscribers`（過去最大加入者数）を基準とする
- **解約時**: `currentSubscribers`は減るが、`peakSubscribers`は変更しない
- **理由**: 既存ユーザーの価格安定性とビジネス収益の予測可能性を両立

### Q: 既存ユーザーの価格はどうなる？

A: **契約時の価格を永続的に維持**します（Grandfather価格）。

- **移行時**: 全既存ユーザーは¥4,980でGrandfathered
- **新規契約**: 現在価格で契約（将来Grandfathered）
- **再契約**: 解約→再契約時は現行価格を適用

### Q: テストするにはどうすれば？

A: 以下のテストケースを実行：

```bash
# 価格計算テスト
npm run test:pricing

# Grandfather Pricingテスト  
npm run test:grandfather

# 統合テスト
npm run test
```

### Q: 移行はどう行う？

A: 段階的な移行プロセス：

```bash
# 1. 初期化
npm run migrate:init-stats
npm run migrate:init-prices

# 2. 既存データ移行
npm run migrate:to-grandfather

# 3. 検証
npm run test:all

# 4. デプロイ
npm run deploy
```

## 運用・監視

### 重要な監視項目

1. **stats.peakSubscribers**: 絶対に減少していないかチェック
2. **価格ローテーション**: 正常に動作しているかログ確認
3. **Grandfathered契約**: 既存ユーザーの価格が維持されているか
4. **Stripe同期**: price_historyとStripeの整合性

### アラート設定

- `peakSubscribers` の異常な減少
- 価格ローテーション関数のエラー
- Webhook処理の失敗
- Stripe API の呼び出し制限

### ログ監視

```bash
# 価格ローテーションログ
firebase functions:log --only rotatePriceHandler

# Webhookログ
firebase functions:log --only stripeWebhook

# エラーログ
firebase functions:log --severity error
```

## トラブルシューティング

### よくある問題

1. **価格が更新されない**
   - Cloud Scheduler が有効か確認
   - 環境変数 `STRIPE_PRODUCT_ID` が設定されているか確認

2. **Grandfathered価格が正しくない**
   - サブスクリプションの `originalPrice` フィールドを確認
   - 移行スクリプトが正常に実行されたか確認

3. **Stripe との同期エラー**
   - Stripe API キーの有効性を確認
   - レート制限に引っかかっていないか確認

### 緊急時のロールバック

```bash
# 移行をロールバック（緊急時のみ）
npm run migrate:rollback

# 手動でstats/globalとprice_historyを削除
# 旧システムのCloud Functionsをデプロイ
```

## 今後の拡張

### 可能な機能追加

1. **ティア別制限**: 価格に応じた機能制限
2. **地域別価格**: 通貨や地域に応じた価格設定
3. **企業向けプラン**: 大規模ユーザー向けの特別価格
4. **割引制度**: 長期契約やボリューム割引

### システム設計での考慮点

- すべての機能は**既存ユーザーのGrandfather価格を保護**する前提で設計
- 新機能は**price_history**スキーマの拡張で対応
- **peakSubscribers の一方向性**は絶対に維持