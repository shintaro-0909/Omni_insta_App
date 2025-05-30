# Omniy Project Structure

## 📁 Root Directory
```
Omni_insta/
├── 📁 frontend/         # Vue.js フロントエンドアプリケーション
├── 📁 functions/        # Firebase Cloud Functions バックエンド
├── 📁 mcp-servers/      # Claude MCP サーバー統合
├── 📁 tools/            # 開発ツールとドキュメント
├── 📄 firebase.json     # Firebase 設定
├── 📄 firestore.rules   # Firestore セキュリティルール
└── 📄 README.md         # プロジェクト概要
```

## 🎨 Frontend Structure
```
frontend/
├── 📁 src/
│   ├── 📁 components/      # 再利用可能なVueコンポーネント
│   │   ├── 📁 __tests__/   # コンポーネントテスト
│   │   └── 📁 interactions/ # AI駆動インタラクション
│   ├── 📁 composables/     # Vue 3 Composition API ロジック
│   ├── 📁 stores/          # Pinia状態管理
│   ├── 📁 views/           # ページレベルコンポーネント
│   │   └── 📁 demos/       # 革新的UIデモ
│   │       ├── 📁 styles/  # 7つのUI革新スタイル
│   │       │   ├── 📁 modern/         # 現代的ニューラルネット
│   │       │   ├── 📁 stylish/        # 洗練された高級感
│   │       │   ├── 📁 cyberpunk/      # サイバーパンク未来
│   │       │   ├── 📁 neumorphism/    # バイオメトリック
│   │       │   ├── 📁 glassmorphism/  # ガラス質透明感
│   │       │   ├── 📁 minimalist/     # ミニマリスト
│   │       │   └── 📁 retro-futuristic/ # レトロフューチャー
│   │       ├── 📁 components/  # デモ共通コンポーネント
│   │       ├── 📁 dashboards/ # ダッシュボードバリエーション
│   │       ├── 📁 landing-pages/ # ランディングページ
│   │       └── 📁 posting/    # 投稿機能デモ
│   ├── 📁 utils/          # ユーティリティ関数
│   ├── 📁 types/          # TypeScript型定義
│   ├── 📁 plugins/        # Vue プラグイン
│   ├── 📁 router/         # Vue Router 設定
│   ├── 📁 locales/        # 国際化ファイル
│   └── 📁 config/         # 設定ファイル
├── 📁 cypress/           # E2Eテスト
├── 📁 test/              # ユニットテスト設定
└── 📁 public/            # 静的アセット
```

## ⚡ Backend Structure
```
functions/
├── 📁 src/
│   ├── 📁 api/            # HTTP APIエンドポイント
│   ├── 📁 schedulers/     # バックグラウンドジョブ
│   ├── 📁 utils/          # 共通ユーティリティ
│   └── 📁 webhooks/       # Webhook処理
├── 📁 __tests__/         # バックエンドテスト
└── 📁 scripts/           # 初期化スクリプト
```

## 🛠 Tools & Documentation
```
tools/
├── 📁 docs/              # プロジェクトドキュメント
│   ├── 📁 archive/       # アーカイブされたドキュメント
│   ├── 📄 tasks.md       # タスク管理（Claude Rules適用）
│   ├── 📄 project-state.md # プロジェクト状態
│   └── 📄 *.md           # 各種仕様書
└── 📁 scripts/           # 開発支援スクリプト
```

## 🤖 MCP Servers
```
mcp-servers/
├── 📁 firebase-admin/    # Firebase管理サーバー
└── 📁 instagram-api/     # Instagram API統合
```

## 📊 Key Features

### 🎨 革新的UIデモシステム
- **7つの革新的スタイル**: Modern、Stylish、Cyberpunk、Neumorphism、Glassmorphism、Minimalist、Retro-futuristic
- **100点超えのクオリティ**: 各スタイルが業界標準を超越
- **アクセシビリティ完全対応**: WCAG 2.1 AAA準拠
- **パフォーマンス最適化**: 60fps以上の滑らかなアニメーション

### 🤖 AI駆動機能
- **適応型UI**: ユーザー行動に基づく動的調整
- **予測的インタラクション**: 先読み操作とプリロード
- **インテリジェントアニメーション**: コンテキスト認識型演出
- **デバイス間連携**: シームレスな継続性管理

### 🔒 エンタープライズレベル
- **包括的テスト**: ユニット、統合、E2E、アクセシビリティ
- **セキュリティ**: Firestore rules、入力検証、認証
- **監視・ログ**: 詳細なパフォーマンス監視とエラー追跡
- **国際化**: 多言語対応（日本語・英語）

## 🚀 Development Workflow

1. **開発環境**: `npm run dev` (フロントエンド) + `firebase emulators:start`
2. **テスト**: `npm run test` (ユニット) + `npm run test:e2e` (E2E)
3. **ビルド**: `npm run build` (TypeScript検証含む)
4. **デプロイ**: `firebase deploy` (ステージング・本番)

## 📈 Quality Metrics

- **テストカバレッジ**: 85%以上
- **TypeScript型安全性**: 100%
- **アクセシビリティ**: WCAG 2.1 AAA
- **パフォーマンス**: Lighthouse 95点以上
- **セキュリティ**: 包括的認証・認可

---

*このプロジェクト構造は継続的に進化し、最新のベストプラクティスと革新的技術を反映します。*