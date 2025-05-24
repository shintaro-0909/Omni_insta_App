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

### Sprint 0: 環境構築・基盤整備
- [ ] ENV-01: GCPプロジェクト・Firebase初期設定
- [ ] ENV-02: フロントエンドSPA初期構築  
- [ ] ENV-03: Cloud Functions初期構築

### Sprint 1: MVPコア機能
- [ ] T10: Firebase Auth + Firestore基本ルール
- [ ] T06: IGアカウント管理
- [ ] T01-T05: 予約投稿機能
- [ ] T07-T09: 自動投稿実行
- [ ] T11-T12: 決済・プラン管理

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