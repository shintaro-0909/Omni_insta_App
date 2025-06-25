# 📱 Multi-SNS Platform Support Guide

## 🎯 実装状況

### ✅ 完了済み
- **Instagram**: 既存機能（Instagram Graph API）
- **アーキテクチャ基盤**: Adapter Pattern, Factory, Mock実装完了
- **UI基盤**: ScheduleGridでのプラットフォーム選択準備完了

### 🔄 開発中（モックで動作確認可能）
- **X (Twitter)**: API v2 準備中
- **Facebook**: Graph API 準備中  
- **TikTok**: for Business API 準備中
- **LinkedIn**: API v2 準備中

## 💰 API料金・制限

### Instagram Graph API
- **料金**: 無料（Facebookアプリ経由）
- **制限**: 5投稿/時間、25投稿/日
- **認証**: OAuth 2.0 + long-lived tokens
- **機能**: 画像・動画投稿、Stories、Reels

### X API v2
- **料金**: Basic $100/月、Pro $5,000/月
- **制限**: Basic 10K投稿/月、Pro 1M投稿/月
- **認証**: OAuth 2.0
- **機能**: テキスト・画像・動画投稿、スレッド

### Facebook Graph API
- **料金**: 無料（ページ投稿）
- **制限**: 200投稿/時間（プラットフォーム共通）
- **認証**: OAuth 2.0 + Page Access Token
- **機能**: テキスト・画像・動画投稿、イベント

### TikTok for Business API
- **料金**: 要審査（ビジネス用途）
- **制限**: 非公開（審査後決定）
- **認証**: OAuth 2.0 + Business account
- **機能**: 動画投稿のみ

### LinkedIn API v2
- **料金**: 無料（制限あり）、Premium $60/月〜
- **制限**: 500投稿/日（無料）、5K投稿/日（Premium）
- **認証**: OAuth 2.0 + Company Page
- **機能**: テキスト・画像・動画投稿、記事

## 🏗️ 技術アーキテクチャ

### Adapter Pattern構成
```typescript
interface BaseSocialMediaAdapter {
  publishPost(content: PostContent): Promise<PostResult>
  validateContent(content: PostContent): ValidationResult
  getLimits(): PlatformLimits
  // ... 他統一メソッド
}

// 各プラットフォーム実装
class InstagramAdapter extends BaseSocialMediaAdapter
class XAdapter extends BaseSocialMediaAdapter  
class FacebookAdapter extends BaseSocialMediaAdapter
```

### Factory Pattern
```typescript
const adapter = await AdapterFactory.createAdapter(
  'instagram', 
  credentials
);
```

### Feature Flag制御
```typescript
// .env
VITE_ENABLE_REAL_POST=false  // 実API無効
VITE_ENABLE_X=true           // UI表示有効

// 段階的リリース制御
if (isFeatureEnabled('PLATFORM_X')) {
  // X投稿UI表示
}
```

## 📊 プラットフォーム特性比較

| Platform | Text制限 | Media制限 | ハッシュタグ | 動画時間 | スケジュール |
|----------|----------|-----------|-------------|----------|-------------|
| Instagram | 2,200文字 | 10個 | 30個 | 60秒 | ❌ |
| X | 280文字 | 4個 | 5個推奨 | 140秒 | ❌ |
| Facebook | 63K文字 | 10個 | 50個 | 4時間 | ✅ |
| TikTok | 2,200文字 | 1動画 | 20個 | 10分 | ❌ |
| LinkedIn | 3K文字 | 9個 | 制限なし | 10分 | ✅ |

## 🚀 段階的展開計画

### Phase 1: 基盤準備（完了）
- [x] Adapter Pattern実装
- [x] Mock System構築
- [x] UI基盤準備
- [x] Feature Flag設定

### Phase 2: X (Twitter) 対応
- [ ] X API v2 認証実装
- [ ] 投稿機能実装
- [ ] テスト・動作確認
- [ ] フィーチャーフラグ有効化

### Phase 3: Facebook対応
- [ ] Facebook Graph API実装
- [ ] ページ投稿機能
- [ ] スケジュール機能統合

### Phase 4: その他SNS
- [ ] TikTok for Business API
- [ ] LinkedIn API v2
- [ ] カスタムプラットフォーム対応

## 💡 実装ガイド

### 新プラットフォーム追加手順

1. **Adapter実装**
```typescript
// functions/src/adapters/newPlatformAdapter.ts
class NewPlatformAdapter extends BaseSocialMediaAdapter {
  async publishPost(content: PostContent): Promise<PostResult> {
    // プラットフォーム固有の投稿ロジック
  }
}
```

2. **Factory登録**
```typescript
// adapterFactory.ts
case 'newplatform':
  return new NewPlatformAdapter(platform, credentials);
```

3. **UI追加**
```typescript
// ScheduleGridView.vue
const platformOptions = [
  { value: 'instagram', icon: 'mdi-instagram' },
  { value: 'newplatform', icon: 'mdi-new-icon' }
];
```

4. **Feature Flag**
```typescript
// featureFlags.ts
PLATFORM_NEWPLATFORM: boolean;
```

### モック開発フロー

1. **MockAdapterで機能テスト**
```bash
# モック環境でのテスト
VITE_ENABLE_REAL_POST=false npm run dev:emu
```

2. **実API統合**
```bash
# 実API有効化（段階的）
VITE_ENABLE_REAL_POST=true npm run dev
```

3. **プロダクション展開**
```bash
# 本番環境での制御
VITE_ENABLE_X=true npm run build:production
```

## 🔧 開発環境セットアップ

### 必要な環境変数
```bash
# 開発環境（全プラットフォーム表示、モック使用）
VITE_ENABLE_MULTI_PLATFORM=true
VITE_ENABLE_REAL_POST=false
VITE_ENABLE_X=true
VITE_ENABLE_FACEBOOK=true

# 本番環境（Instagram のみ、実API）
VITE_ENABLE_MULTI_PLATFORM=false
VITE_ENABLE_REAL_POST=true
VITE_ENABLE_X=false
```

### テスト実行
```bash
# Adapter単体テスト
npm run test -- adapters

# E2Eテスト（モック）
npm run test:e2e:mock

# 統合テスト
npm run test:integration
```

## ⚠️ 注意事項

### セキュリティ
- 各プラットフォームのAPI Keyは環境変数で管理
- OAuth認証フローの適切な実装
- トークンの暗号化保存

### レート制限
- プラットフォーム別の制限を厳密に守る
- 制限超過時の適切なエラーハンドリング
- バックオフ・リトライ戦略

### コスト管理
- 実API使用時の課金監視
- 無料枠の効率的活用
- モック環境での十分なテスト

## 📈 将来拡張

### 高度機能
- 複数プラットフォーム同時投稿
- プラットフォーム間でのコンテンツ最適化
- 統合分析・レポート機能
- AIによる最適投稿時間提案

### エンタープライズ
- チーム管理・権限制御
- API経由でのサードパーティ連携
- ホワイトラベル・カスタマイズ対応