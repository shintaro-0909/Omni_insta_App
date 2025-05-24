# Omniy - Instagram予約投稿WEBアプリ

## 📱 プロジェクト概要

Omniyは、インフルエンサーや中小企業向けのInstagram予約投稿プラットフォームです。Instagram公式APIを使用した安全な投稿自動化により、「日時指定」「繰り返し」「ランダム」投稿を実現します。

### 🎯 主要機能

**Must（必須機能）:**
- ✅ 日時指定予約投稿
- ✅ 曜日×時刻の繰り返し投稿  
- ✅ ランダム投稿
- ✅ マルチアカウント管理
- ✅ 自動投稿実行とリトライ
- ✅ Firebase認証・決済連携

**Should（望ましい機能）:**
- 🔄 プロキシ設定・管理
- 📊 活動ログ・監視ダッシュボード
- 👥 アカウントグループ化

**Could（できれば実装）:**
- 📅 カレンダー表示
- 👁️ 投稿プレビュー
- 🌐 多言語対応

## 🏗️ 技術スタック

### フロントエンド
- **Framework**: Vue.js 3 + TypeScript
- **UI Library**: Vuetify / Element Plus
- **State Management**: Pinia
- **Hosting**: Firebase Hosting

### バックエンド
- **Runtime**: Cloud Functions (2nd Gen) + Cloud Run
- **Database**: Cloud Firestore
- **Authentication**: Firebase Authentication
- **Scheduler**: Cloud Scheduler
- **Payment**: Stripe

### 外部連携
- **SNS API**: Instagram Graph API
- **Proxy**: 高品質プロキシプール
- **Notification**: Gmail SMTP

## 📁 プロジェクト構造

```
omniy/
├── frontend/                 # Vue.js SPA
│   ├── src/
│   │   ├── components/      # UIコンポーネント
│   │   ├── views/          # ページコンポーネント
│   │   ├── stores/         # Pinia状態管理
│   │   ├── services/       # API通信
│   │   └── utils/          # ユーティリティ
│   ├── public/
│   └── package.json
├── functions/               # Cloud Functions
│   ├── src/
│   │   ├── api/            # REST API
│   │   ├── schedulers/     # 定期実行
│   │   ├── webhooks/       # Webhook処理
│   │   └── utils/          # 共通ユーティリティ
│   └── package.json
├── firestore.rules         # Firestoreセキュリティルール
├── firestore.indexes.json  # Firestoreインデックス
├── firebase.json           # Firebase設定
└── docs/                   # プロジェクトドキュメント
```

## 🚀 セットアップ手順

### 1. 前提条件
- Node.js 18+ 
- Firebase CLI
- Google Cloud CLI

### 2. プロジェクト初期化
```bash
# リポジトリクローン
git clone <repository-url>
cd omniy

# 依存関係インストール
npm install

# Firebase初期化
firebase init

# 環境変数設定
cp .env.example .env.local
```

### 3. 開発サーバー起動
```bash
# フロントエンド開発サーバー
cd frontend
npm run dev

# Cloud Functions エミュレータ
cd functions  
npm run serve

# Firebase エミュレータ（統合）
firebase emulators:start
```

## 📋 開発進捗

**現在のSprint 1進捗: 92% (11/12 Must タスク完了)**

### Sprint 0: 環境構築・基盤整備 ✅
- [x] ENV-01: GCPプロジェクト・Firebase初期設定
- [x] ENV-02: フロントエンドSPA初期構築  
- [x] ENV-03: Cloud Functions初期構築

### Sprint 1: MVPコア機能
- [x] T01-T09: 予約投稿機能（日時指定・繰返・ランダム・自動実行）
- [x] T06: IGアカウント管理
- [x] T10: Firebase Auth + Firestore基本ルール（バックエンド）
- [x] T11: Stripe決済・プラン管理
- [x] POSTS: コンテンツライブラリ
- [ ] T12: プラン制限チェック（次回実装）

> **進捗管理**: 詳細な進捗状況は `docs/dev_tasks_userstories.md` を参照

## 🔄 進捗管理ルール

### 必須実行事項
1. **タスク完了時**: `docs/dev_tasks_userstories.md` の進捗表を更新
2. **詳細記載**: 実装した具体的な内容（ファイル名・関数名）を記載
3. **部分完了時**: 次回作業の開始点を明確化
4. **進捗率更新**: Sprint全体の進捗率を再計算

### 進捗管理ファイル
- **メイン**: `docs/dev_tasks_userstories.md`
- **ルール**: `.cursor/rules/progress-management.mdc`

## 🔧 開発ガイドライン

### コーディング規約
- TypeScript strict mode使用
- ESLint + Prettier設定
- コミットメッセージ: Conventional Commits

### テスト戦略  
- 単体テスト: Jest + Vue Test Utils
- E2Eテスト: Cypress
- API テスト: Supertest

### セキュリティ
- Firestoreセキュリティルール
- 入力値検証・サニタイゼーション
- アクセストークン暗号化

## 📞 サポート

開発に関する質問や問題については、GitHubのIssuesをご利用ください。

---

**開発開始日**: 2024年12月
**想定リリース**: 2025年Q1 