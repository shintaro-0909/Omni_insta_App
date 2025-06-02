Claude Rules :look👀

# CLAUDE.md

必ず日本語で答えてください。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏗️ **Directory Structure Rules (ALWAYS FOLLOW)**

### **New File/Folder Creation Rules**

**CRITICAL: All new files and folders MUST follow professional directory structure patterns:**

#### **Frontend Structure (Vue.js + TypeScript)**
```
frontend/src/
├── components/           # UI Components (PascalCase naming)
│   ├── common/          # Reusable base components (LanguageSwitcher.vue, InstagramPreview.vue)
│   ├── forms/           # Form-related components (PostFormDialog.vue, ScheduleFormDialog.vue)
│   ├── layouts/         # Layout components (UnifiedNavigation.vue)
│   ├── shared/          # Shared components (ComponentsTest.vue, PerformanceDashboardRefactored.vue)
│   └── widgets/         # Complex composite components (UsageDashboard.vue, PerformanceDashboard.vue)
├── views/               # Page-level components (PascalCase)
│   ├── auth/           # Authentication pages (LoginView.vue)
│   ├── dashboard/      # Dashboard pages (DashboardView.vue)
│   └── content/        # Content management pages (ContentView.vue)
├── stores/             # State management (camelCase files)
│   ├── auth.ts         # Authentication state
│   ├── posts.ts        # Posts data
│   ├── billing.ts      # Stripe subscription management
│   ├── igAccounts.ts   # Instagram account management
│   ├── planLimits.ts   # Usage limits and restrictions
│   ├── schedules.ts    # Schedule management
│   └── index.ts        # Store aggregation (ALWAYS create)
├── composables/        # Logic reuse (camelCase)
│   ├── business/      # Business logic composables (useImageUpload.ts)
│   └── index.ts       # Composables aggregation
├── utils/             # Utility functions (camelCase)
│   ├── api/           # API utilities (performanceInterceptor.ts)
│   ├── date/          # Date processing utilities
│   ├── validation/    # Validation helpers (errorHandler.ts)
│   └── index.ts       # Utils aggregation
├── types/             # TypeScript type definitions
│   └── global.d.ts    # Global types
├── plugins/           # Vue plugins
│   ├── i18n.ts        # Internationalization
│   └── vuetify.ts     # Vuetify configuration
├── services/          # External services
│   └── firebase.ts    # Firebase configuration
├── locales/           # I18n language files
│   ├── en.json        # English translations
│   └── ja.json        # Japanese translations
└── styles/           # Global styles
    ├── settings.scss  # SCSS settings
    └── variables.scss # SCSS variables
```

#### **Backend Structure (Firebase Functions)**
```
functions/src/
├── api/                # HTTP API endpoints
│   ├── auth.ts         # Authentication endpoints
│   ├── groups.ts       # Groups management
│   ├── igAccounts.ts   # Instagram accounts
│   ├── instagram.ts    # Instagram API integration
│   ├── logs.ts         # Activity logs
│   ├── optimizedPosts.ts # Optimized posting
│   ├── planLimits.ts   # Plan limits management
│   ├── posts.ts        # Posts management
│   ├── proxies.ts      # Proxy management
│   ├── schedules.ts    # Schedule management
│   ├── stripe.ts       # Stripe payments
│   └── stripeWebhook.ts # Stripe webhooks
├── schedulers/         # Background jobs
│   ├── batchOptimizedPostExecutor.ts
│   ├── healthMonitor.ts
│   ├── optimizedPostExecutor.ts
│   ├── postExecutor.ts
│   └── postExecutorRefactored.ts
├── middleware/         # Request middleware
│   └── security.ts    # Security middleware
├── utils/             # Shared utilities
│   ├── batchProcessor.ts
│   ├── functionOptimizations.ts
│   ├── inputValidator.ts
│   ├── monitoring.ts
│   ├── notifications.ts
│   ├── planLimits.ts
│   ├── proxyFetch.ts
│   ├── rateLimiter.ts
│   └── scheduleUtils.ts
└── webhooks/          # Webhook handlers
```

### **File Creation Rules**

1. **Components (frontend/src/components/)**
   - MUST use PascalCase: `PostFormDialog.vue`
   - MUST categorize by function: forms/, common/, layouts/, widgets/, shared/
   - MUST include TypeScript: `<script setup lang="ts">`
   - MUST create corresponding types if complex props

2. **API Endpoints (functions/src/api/)**
   - MUST use camelCase: `createPost.ts`
   - MUST include input validation
   - MUST include error handling
   - MUST update firestore.rules if database access

3. **Stores (frontend/src/stores/)**
   - MUST use camelCase: `auth.ts`, `posts.ts`
   - MUST update index.ts barrel export
   - MUST include TypeScript interfaces
   - MUST follow Pinia patterns

4. **Composables (frontend/src/composables/)**
   - MUST start with 'use': `useImageUpload.ts`
   - MUST categorize: business/
   - MUST be reusable across components
   - MUST include TypeScript return types

5. **Utils (both frontend/backend)**
   - MUST be pure functions when possible
   - MUST categorize by domain: api/, date/, validation/
   - MUST include unit tests for complex logic
   - MUST update index.ts exports

### **Index.ts Barrel Pattern (ALWAYS IMPLEMENT)**

```typescript
// Every major folder MUST have index.ts
// stores/index.ts
export { useAuthStore } from './auth'
export { usePostsStore } from './posts'
export { useBillingStore } from './billing'
export { useIgAccountsStore } from './igAccounts'
export { usePlanLimitsStore } from './planLimits'
export { useSchedulesStore } from './schedules'

// components/index.ts
export { default as PostFormDialog } from './forms/PostFormDialog.vue'
export { default as UsageDashboard } from './widgets/UsageDashboard.vue'
export { default as UnifiedNavigation } from './layouts/UnifiedNavigation.vue'

// utils/index.ts
export * from './date'
export * from './validation'
export * from './api'
```

### **Path Alias Configuration (ALWAYS SET UP)**

```typescript
// vite.config.ts - MUST include these aliases
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    '@stores': path.resolve(__dirname, './src/stores'),
    '@utils': path.resolve(__dirname, './src/utils'),
    '@types': path.resolve(__dirname, './src/types'),
    '@composables': path.resolve(__dirname, './src/composables')
  }
}

// Usage examples:
import { PostFormDialog } from '@components/forms'
import { useAuthStore } from '@stores'
import { formatDate } from '@utils/date'
```

### **Naming Conventions (STRICTLY ENFORCE)**

1. **Files & Folders:**
   - Vue Components: PascalCase (`PostFormDialog.vue`)
   - TypeScript files: camelCase (`useImageUpload.ts`)
   - Folders: kebab-case (`user-management/`)
   - API endpoints: camelCase (`createPost.ts`)

2. **Code:**
   - Variables/Functions: camelCase (`userName`, `getUserData()`)
   - Classes: PascalCase (`ImageProcessor`)
   - Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
   - Types/Interfaces: PascalCase (`UserProfile`, `ApiResponse`)

### **Quality Gates (ENFORCE BEFORE COMPLETION)**

Before any new file/folder creation is complete, verify:

- [ ] File is in correct category folder
- [ ] Naming convention is followed
- [ ] index.ts is updated (if applicable)
- [ ] Path aliases work correctly
- [ ] README.md exists for new folders
- [ ] TypeScript types are defined
- [ ] Related files are updated (stores, routes, etc.)

This directory structure ensures scalability, maintainability, and team collaboration effectiveness.

## Project Overview

**Omniy** is an Instagram scheduling SaaS for influencers and small businesses. It provides scheduled posting, recurring posts, and random posting through Instagram Graph API integration. The app uses Firebase/GCP infrastructure with Vue.js frontend and Cloud Functions backend.

**🎯 Current Status: ULTRATHINK統合システム完成 + プロジェクト整理完了**

## Common Commands

### Frontend Development
```bash
npm run dev              # Development server
npm run build           # Production build  
npm run build-check     # Build with TypeScript checking
npm run lint            # ESLint with auto-fix
npm run type-check      # TypeScript type checking
npm run test:unit       # Run unit tests (31 tests)
npm run test:coverage   # Test coverage report
```

### Backend Development
```bash
cd functions
npm run build           # Compile TypeScript
npm run serve           # Local emulator with functions
npm run lint            # ESLint backend code
npm run test            # Run Jest tests
npm run test:coverage   # Backend test coverage
```

### Firebase Operations
```bash
firebase emulators:start  # Start all emulators (port 4000 for UI)
firebase deploy --only functions  # Deploy functions only
firebase deploy --only hosting   # Deploy frontend only
```

### Root Level Operations
```bash
npm run build           # Build both frontend and backend
npm run build:frontend  # Build frontend only
npm run build:functions # Build backend only
npm run test:unit       # Run frontend unit tests
```

### Emulator Ports
- UI Dashboard: http://localhost:4000
- Hosting: http://localhost:5000
- Functions: http://localhost:5001
- Firestore: http://localhost:8080
- Auth: http://localhost:9099

## Architecture Overview

### Tech Stack
- **Frontend**: Vue.js 3 + TypeScript + Vuetify + Pinia + Vite
- **Backend**: Cloud Functions (2nd Gen) + Cloud Firestore
- **Authentication**: Firebase Auth with Google provider
- **Testing**: Vitest + Happy-DOM + Cypress
- **Payments**: Stripe with webhook integration
- **Scheduling**: Cloud Scheduler (1-minute intervals)
- **External API**: Instagram Graph API

### Key Architecture Patterns

#### **ULTRATHINK統合システム (2024年最新)**

プロジェクトは以下の統合システムが完成しています：

1. **統合コンポーネントシステム**
   - common/: 基本再利用コンポーネント
   - forms/: フォーム専用コンポーネント  
   - layouts/: レイアウトコンポーネント
   - shared/: 共有コンポーネント
   - widgets/: 複合ウィジェット

2. **統合状態管理 (Pinia)**
   - 全Storeでindex.tsバレルパターン実装済み
   - TypeScript統一 (v5.8.3)
   - 完全なテストカバレッジ

3. **統合テストシステム**
   - Happy-DOM環境で31テスト全通過
   - Auth Store, Component, Utils全て対応
   - CI/CD準備完了

#### Store Pattern (Pinia)
- `stores/auth.ts` - Authentication state
- `stores/billing.ts` - Stripe subscription management  
- `stores/igAccounts.ts` - Instagram account management
- `stores/planLimits.ts` - Usage limits and restrictions
- `stores/posts.ts` - Content library management
- `stores/schedules.ts` - Schedule management
- `stores/groups.ts` - Groups management
- `stores/logs.ts` - Activity logs
- `stores/performance.ts` - Performance metrics
- `stores/proxies.ts` - Proxy management
- `stores/preview.ts` - Preview functionality
- `stores/errorMonitoring.ts` - Error monitoring

#### Cloud Functions Structure
- `api/` - HTTP endpoints for CRUD operations
- `schedulers/` - Background job processing (optimizedPostExecutor.ts)
- `utils/` - Shared utilities (planLimits.ts, scheduleUtils.ts)
- `webhooks/` - Stripe webhook handling
- `middleware/` - Security middleware

#### Data Flow
1. User creates schedule via Vue.js frontend
2. Frontend calls Cloud Functions API
3. Schedule stored in Firestore with `nextRunAt` timestamp
4. Cloud Scheduler triggers `optimizedPostExecutor` every minute
5. Executor queries pending schedules and processes via Instagram Graph API
6. Usage tracking updates user's plan limits

## Core Features Implementation

### Schedule Types
- **One-time**: `scheduleType: 'once'` with specific `scheduledAt`
- **Recurring**: `scheduleType: 'recurring'` with `repeatRule` (days of week + time)
- **Random**: `scheduleType: 'random'` with min/max intervals and time windows

### Plan Limits System
- Free: 1 account, 10 posts/month
- Basic: 3 accounts, 100 posts/month
- Pro: 10 accounts, 1000 posts/month
- Business: Unlimited accounts, 10000 posts/month

Usage tracking in `userUsage` collection with automatic monthly resets.

### Instagram Integration
Graph API endpoints used:
- `/{user-id}/media` - Upload media
- `/{user-id}/media_publish` - Publish posts
- `/{user-id}` - Get account info
- `/oauth/access_token` - Token refresh

## Development Workflow

### Testing Requirements
- **Frontend**: `npm run test:unit` (31 tests passing)
- **TypeScript**: `npm run type-check` (unified v5.8.3)
- **Linting**: `npm run lint` (ESLint + auto-fix)
- **Build**: `npm run build` (frontend + backend)

### Branch Strategy
- `feature/T{number}-{description}` for new features
- `fix/issue-{number}-{description}` for bug fixes
- `docs/{description}` for documentation
- `refactor/{target}` for refactoring

### Commit Convention
Use Conventional Commits format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore, perf, ci

## Security Considerations

### Firestore Security Rules
- User data isolated by `userId`
- Authentication required for all operations
- Plan limits enforced at database level

### API Keys Management
- Instagram tokens encrypted in Firestore
- Stripe keys via environment variables
- No secrets in client-side code
- **開発環境**: エミュレーター強制モード有効

### Input Validation
- All Cloud Functions validate input parameters
- Rate limiting through plan restrictions
- Sanitization of user-generated content

## Key Files to Understand

### **✅ 整理済みコアファイル**

#### Backend Core
- `functions/src/schedulers/optimizedPostExecutor.ts` - メイン投稿ロジック
- `functions/src/utils/planLimits.ts` - 使用量検証
- `functions/src/utils/scheduleUtils.ts` - スケジュール計算
- `functions/src/api/instagram.ts` - Graph API統合

#### Frontend Core
- `frontend/src/views/SchedulesView.vue` - スケジュール管理UI
- `frontend/src/views/ContentView.vue` - コンテンツライブラリ
- `frontend/src/views/AccountsView.vue` - Instagram アカウント管理
- `frontend/src/components/widgets/UsageDashboard.vue` - プラン制限表示

#### Configuration
- `firestore.rules` - データベースセキュリティルール
- `firestore.indexes.json` - クエリ最適化
- `firebase.json` - プロジェクト設定

### **🗑️ 削除済みファイル（機能に影響なし）**
- ~~`frontend/src/views/demos/`~~ (2.1MB削減)
- ~~`frontend/dist/`~~ (自動生成)
- ~~`frontend/coverage/`~~ (自動生成)
- ~~`frontend/cypress/videos/`~~ (9.2MB削減)
- ~~`frontend/cypress/screenshots/`~~ (1.3MB削減)
- ~~`functions/lib/`~~ (自動生成)

## Current State

**🎯 統合システム完成状態 (2024年12月)**

### **✅ 完成項目**
1. **ULTRATHINK統合システム**: 100%完成
2. **プロジェクト整理**: 87%のファイル削減完了
3. **テストシステム**: 31テスト全通過
4. **TypeScript統一**: v5.8.3で統一
5. **ビルドシステム**: フロントエンド・バックエンド両方正常

### **📊 品質指標**
- **ビルド時間**: フロントエンド 6.99s
- **テスト通過率**: 100% (31/31)
- **プロジェクトファイル数**: 1,624 (実質ファイル)
- **TypeScriptバージョン**: 統一完了
- **機能整合性**: 100%保持

### **🚀 次期開発フォーカス**
- 新機能開発準備完了
- プロキシ管理システム拡張
- アクティビティログ詳細化
- パフォーマンス監視強化

## Task Management Rules (重要: 必ず確認)

### tasks.mdファイルの作成と管理

**重要**: すべてのプロジェクトにおいて、以下のタスク管理ルールを必ず実行してください。

1. **tasks.mdファイルの作成**
   - プロジェクト開始時またはタスク整理時に`tasks.md`ファイルを作成
   - ドキュメントフォルダ（`docs/`または`tools/docs/`）に配置
   - ファイル冒頭に必ず「Claude Rules :look👀」を記載

2. **タスクの記載内容**
   - すべてのタスクをチェックボックス形式で記載: `- [ ] タスク名`
   - 各タスクに明確な完了条件を定義
   - 優先順位を設定（最優先、高、中、低）
   - カテゴリー別に整理（例: リリース準備、品質保証、機能改善）

3. **進捗管理**
   - タスク開始時: `- [ ]` → `- [進行中]`
   - タスク完了時: 完了条件を確認後 `- [x]`
   - 進捗率を定期的に更新

4. **更新ルール**
   - タスク完了ごとに即座に更新（バッチ更新は禁止）
   - 新規タスク追加時は理由を記載
   - 定期的に全体進捗をレビュー

5. **ルール確認マーカー**
   - このルールを確認・適用したファイルには「Claude Rules :look👀」を冒頭に追加
   - これによりルール適用状況を視覚的に確認可能

### 実装例

```markdown
Claude Rules :look👀

# プロジェクトタスクリスト

## 🚀 最優先タスク
- [x] 環境構築
  - 完了条件: 開発環境で動作確認済み
- [x] ULTRATHINK統合システム構築
  - 完了条件: すべてのコンポーネント統合完了
- [x] プロジェクト整理
  - 完了条件: 不要ファイル削除・ディレクトリ最適化完了
```

このルールにより、プロジェクトの進捗が常に可視化され、タスクの抜け漏れを防ぐことができます。

## アーキテクチャ更新ルール (必須)

### 自動アーキテクチャ図更新

**重要**: プロジェクト更新時は必ずアーキテクチャ図を最新状態に保つこと。

1. **更新対象ファイル**
   - メインアーキテクチャ図: `tools/docs/ULTRATHINK_ARCHITECTURE_DIAGRAM.md`
   - 必要に応じてシステム概要図も更新

2. **更新トリガー**
   - 新機能追加時（composables、components、utils追加）
   - システム構成変更時（統合、分離、リファクタリング）
   - 外部サービス統合時（API、ライブラリ追加）
   - アーキテクチャパターン変更時
   - 重要なバグ修正後（システムフロー影響時）

3. **更新内容**
   - Mermaid図の関係性を最新状態に更新
   - 新しいコンポーネント・システムを図に追加
   - 削除されたコンポーネントを図から削除
   - データフローの変更を反映
   - メトリクス・成果指標を最新数値に更新

4. **更新手順**
   ```markdown
   1. 変更内容を分析
   2. 影響するアーキテクチャ層を特定
   3. Mermaid図を更新
   4. メトリクス・成果を更新
   5. 関係図の整合性を確認
   6. コミットメッセージに「docs(architecture): 📐」を含める
   ```

5. **品質保証**
   - 図の論理的整合性確認
   - 全コンポーネントの関係性チェック
   - 実装と図の一致性検証
   - 見やすさ・理解しやすさの確保

### 例: 更新が必要なケース

✅ **更新必要**
- 新しいComposableシステム追加
- 統合システム導入
- データベース構成変更
- API エンドポイント追加・変更
- セキュリティシステム強化

❌ **更新不要**
- 小さなバグ修正
- スタイル調整のみ
- テキスト変更のみ
- 設定ファイル微調整

このルールにより、プロジェクトのアーキテクチャ文書は常に最新かつ正確な状態を維持できます。

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.