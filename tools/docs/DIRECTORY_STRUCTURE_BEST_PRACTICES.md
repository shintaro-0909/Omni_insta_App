Claude Rules :look👀

# 📁 プロ開発者のディレクトリ構造ベストプラクティス

> **効率的で保守しやすいプロジェクト構成の作り方**  
> **対象**: 1人開発から大規模チームまで対応  
> **最終更新**: 2025-05-31

---

## 🎯 **なぜディレクトリ構造が重要なのか**

### **悪い構造の問題点**
```
❌ ファイルが見つからない（探すのに5分）
❌ どこに何を書けば良いかわからない
❌ 似たような機能が散らばる
❌ 新機能追加時に影響範囲がわからない
❌ チーム開発で混乱する
```

### **良い構造の効果**
```
✅ 必要なファイルが3秒で見つかる
✅ 新機能をどこに書くか迷わない
✅ 関連機能がまとまっている
✅ 変更の影響範囲が明確
✅ 新人でもすぐに理解できる
```

---

## 🏗️ **Omniy の改良されたディレクトリ構造**

### **現在の構造**
```
Omni_insta/                    # 🔸 プロジェクトルート
├── 📄 DEVELOPER_MASTER_GUIDE.md    # 👑 開発者向け全体ガイド
├── 📄 CLAUDE.md                    # 🤖 AI開発ルール
├── 📄 firebase.json                # ⚙️ Firebase設定
├── 📄 firestore.rules              # 🔒 セキュリティルール
├── 📄 package.json                 # 📦 プロジェクト依存関係
│
├── 📁 frontend/                # 🎨 フロントエンド（Vue.js）
│   ├── 📁 src/
│   │   ├── 📁 components/      # 🧩 再利用可能コンポーネント
│   │   ├── 📁 views/          # 📱 ページレベルコンポーネント
│   │   ├── 📁 stores/         # 🗄️ 状態管理（Pinia）
│   │   ├── 📁 composables/    # 🔧 ロジック再利用
│   │   ├── 📁 utils/          # 🛠️ ユーティリティ関数
│   │   └── 📁 types/          # 📝 TypeScript型定義
│   ├── 📄 package.json        # 📦 フロントエンド依存関係
│   └── 📄 vite.config.ts      # ⚙️ ビルド設定
│
├── 📁 functions/              # ⚡ バックエンド（Firebase Functions）
│   ├── 📁 src/
│   │   ├── 📁 api/           # 🌐 HTTPエンドポイント
│   │   ├── 📁 schedulers/    # ⏰ バックグラウンド処理
│   │   ├── 📁 utils/         # 🛠️ 共通ユーティリティ
│   │   └── 📁 webhooks/      # 🪝 外部API連携
│   └── 📄 package.json       # 📦 バックエンド依存関係
│
├── 📁 tools/                 # 🔧 開発・運用ツール
│   ├── 📁 docs/             # 📚 ドキュメント
│   └── 📁 scripts/          # 📜 自動化スクリプト
│
└── 📁 .github/              # 🤖 GitHub設定
    └── 📁 workflows/        # ⚙️ CI/CD自動化
```

### **改良点の提案**

#### **📁 frontend/src/ の詳細構造**
```
frontend/src/
├── 📁 components/              # 🧩 UIコンポーネント
│   ├── 📁 common/             # 共通コンポーネント
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue
│   │   └── BaseModal.vue
│   ├── 📁 forms/              # フォーム関連
│   │   ├── PostFormDialog.vue
│   │   └── ScheduleFormDialog.vue
│   ├── 📁 layouts/            # レイアウト
│   │   ├── AppHeader.vue
│   │   └── AppSidebar.vue
│   └── 📁 widgets/            # 複合ウィジェット
│       ├── UsageDashboard.vue
│       └── InstagramPreview.vue
│
├── 📁 views/                   # 📱 ページ
│   ├── 📁 auth/               # 認証関連ページ
│   │   ├── LoginView.vue
│   │   └── RegisterView.vue
│   ├── 📁 dashboard/          # ダッシュボード
│   │   ├── DashboardView.vue
│   │   └── AnalyticsView.vue
│   └── 📁 content/            # コンテンツ管理
│       ├── ContentView.vue
│       └── SchedulesView.vue
│
├── 📁 stores/                  # 🗄️ 状態管理
│   ├── auth.ts               # 認証状態
│   ├── posts.ts              # 投稿データ
│   ├── schedules.ts          # スケジュール
│   └── index.ts              # ストア統合
│
├── 📁 composables/             # 🔧 ロジック再利用
│   ├── 📁 api/               # API関連
│   │   ├── useFirestore.ts
│   │   └── useAuth.ts
│   ├── 📁 ui/                # UI関連
│   │   ├── useModal.ts
│   │   └── useForm.ts
│   └── 📁 business/          # ビジネスロジック
│       ├── useImageUpload.ts
│       └── useScheduler.ts
│
├── 📁 utils/                   # 🛠️ ユーティリティ
│   ├── 📁 api/               # API関連
│   ├── 📁 date/              # 日付処理
│   ├── 📁 validation/        # バリデーション
│   └── constants.ts          # 定数定義
│
├── 📁 types/                   # 📝 型定義
│   ├── api.ts                # API型
│   ├── auth.ts               # 認証型
│   ├── posts.ts              # 投稿型
│   └── global.d.ts           # グローバル型
│
└── 📁 assets/                  # 🎨 静的リソース
    ├── 📁 images/
    ├── 📁 icons/
    └── 📁 styles/
```

#### **📁 functions/src/ の詳細構造**
```
functions/src/
├── 📁 api/                     # 🌐 HTTP API
│   ├── 📁 v1/                # バージョン管理
│   │   ├── auth.ts
│   │   ├── posts.ts
│   │   └── schedules.ts
│   └── 📁 v2/                # 新バージョン
│       └── posts.ts
│
├── 📁 schedulers/              # ⏰ 定期処理
│   ├── postExecutor.ts       # 投稿実行
│   ├── healthMonitor.ts      # 監視システム
│   └── cleanup.ts            # データクリーンアップ
│
├── 📁 services/                # 🔧 ビジネスロジック
│   ├── 📁 auth/              # 認証サービス
│   ├── 📁 instagram/         # Instagram API
│   ├── 📁 storage/           # ファイル処理
│   └── 📁 notification/      # 通知システム
│
├── 📁 utils/                   # 🛠️ 共通処理
│   ├── 📁 database/          # DB操作
│   ├── 📁 validation/        # バリデーション
│   ├── 📁 error/             # エラーハンドリング
│   └── constants.ts          # 定数
│
├── 📁 types/                   # 📝 型定義
│   ├── api.ts
│   ├── database.ts
│   └── services.ts
│
└── 📁 config/                  # ⚙️ 設定
    ├── firebase.ts
    ├── instagram.ts
    └── environment.ts
```

---

## 🎯 **ディレクトリ設計の原則**

### **1. 機能ベース分割**
```
✅ 良い例: 機能ごとにフォルダを分ける
📁 auth/          # 認証機能
├── LoginView.vue
├── useAuth.ts
└── auth.types.ts

❌ 悪い例: ファイル種類ごとに分ける
📁 views/         # すべてのページ
📁 composables/   # すべてのロジック
📁 types/         # すべての型
```

### **2. 深さの制限**
```
✅ 良い例: 3-4階層まで
src/components/forms/PostForm.vue

❌ 悪い例: 5階層以上
src/modules/content/components/forms/advanced/PostForm.vue
```

### **3. 命名規則の統一**
```
✅ ファイル名: PascalCase（Vue コンポーネント）
PostFormDialog.vue
UserProfileCard.vue

✅ フォルダ名: kebab-case
user-management/
api-integration/

✅ 変数・関数: camelCase
const userName = 'test'
function getUserData() {}
```

### **4. 関心の分離**
```
✅ UI層: components/, views/
✅ ロジック層: composables/, services/
✅ データ層: stores/, api/
✅ 設定層: config/, utils/
```

---

## 🔧 **プロが使う管理テクニック**

### **1. Index.ts パターン**
```typescript
// stores/index.ts
export { useAuthStore } from './auth'
export { usePostsStore } from './posts'
export { useSchedulesStore } from './schedules'

// 使用時
import { useAuthStore, usePostsStore } from '@/stores'
```

### **2. バレルエクスポート**
```typescript
// utils/index.ts
export * from './date'
export * from './validation'
export * from './api'
export { default as constants } from './constants'
```

### **3. パスエイリアス**
```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types')
    }
  }
})

// 使用例
import { PostForm } from '@components/forms'
import { formatDate } from '@utils/date'
```

### **4. README.md の活用**
```markdown
# 各フォルダにREADME.md を配置
components/README.md
stores/README.md
utils/README.md

内容例:
# Components

## 命名規則
- PascalCase で命名
- 機能を表す明確な名前

## 分類
- common/: 共通コンポーネント
- forms/: フォーム関連
- layouts/: レイアウト
```

---

## 📊 **大規模プロジェクトでの工夫**

### **1. モジュール分割**
```
src/
├── 📁 modules/
│   ├── 📁 auth/              # 認証モジュール
│   │   ├── components/
│   │   ├── stores/
│   │   ├── composables/
│   │   └── types/
│   ├── 📁 content/           # コンテンツモジュール
│   └── 📁 analytics/         # 分析モジュール
│
└── 📁 shared/                # 共通モジュール
    ├── components/
    ├── utils/
    └── types/
```

### **2. 依存関係の管理**
```
ルール:
- modules/ 内は相互依存禁止
- shared/ から modules/ への依存禁止
- modules/ から shared/ への依存は OK
```

### **3. 段階的リファクタリング**
```
Phase 1: 現在の構造を理解
Phase 2: 小さな改善から開始
Phase 3: モジュール分割検討
Phase 4: 大幅なリストラクチャ
```

---

## 🛠️ **Omniy 向け改善提案**

### **即座に実行可能（30分）**
```bash
# 1. ディレクトリ作成
mkdir -p frontend/src/components/{common,forms,layouts,widgets}
mkdir -p frontend/src/views/{auth,dashboard,content}
mkdir -p frontend/src/composables/{api,ui,business}
mkdir -p frontend/src/utils/{api,date,validation}

# 2. 既存ファイルの移動
mv frontend/src/components/PostFormDialog.vue frontend/src/components/forms/
mv frontend/src/components/UsageDashboard.vue frontend/src/components/widgets/

# 3. Index.ts ファイル作成
touch frontend/src/components/index.ts
touch frontend/src/stores/index.ts
touch frontend/src/utils/index.ts
```

### **週末プロジェクト（2-3時間）**
```typescript
// 1. パスエイリアス設定
// vite.config.ts に追加

// 2. バレルエクスポート作成
// index.ts ファイルの充実

// 3. 型定義の整理
// types/ フォルダの構造化

// 4. README.md 作成
// 各フォルダにガイド追加
```

### **長期改善（1ヶ月）**
```
1. モジュール分割の検討
2. 依存関係の可視化
3. 命名規則の統一
4. 自動化ツールの導入
```

---

## 📈 **効果測定**

### **改善前後の比較**
```yaml
ファイル検索時間:
  改善前: 平均2-5分
  改善後: 平均10-30秒

新機能開発時間:
  改善前: 構造理解に30分
  改善後: 構造理解に5分

バグ修正時間:
  改善前: 影響範囲特定に20分
  改善後: 影響範囲特定に5分

新人オンボーディング:
  改善前: 1週間
  改善後: 2-3日
```

### **チェックリスト**
```
□ 必要なファイルが30秒以内に見つかる
□ 新機能をどこに実装するか迷わない
□ 関連ファイルが近くにまとまっている
□ 命名規則が統一されている
□ README.md で構造が説明されている
```

---

## 🎯 **まとめ: プロジェクト成功の鍵**

### **重要な原則**
```
1. 一貫性 > 完璧性
   → 統一されたルールが最重要

2. 進化可能性 > 現在の最適化
   → 将来の変更に対応できる柔軟性

3. 可読性 > 短縮
   → 略語より明確な名前

4. チーム > 個人
   → 他の人が理解できる構造
```

### **実践的アドバイス**
```
🎯 小さく始めて段階的に改善
📝 変更理由を必ずドキュメント化
🔄 定期的な見直しとリファクタリング
🤝 チームでのルール共有と遵守
```

**良いディレクトリ構造は、開発効率を10倍にします！** 🚀

*今日から少しずつ改善していきましょう。完璧を求めず、継続的な改善が成功の鍵です。*