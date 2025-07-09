# 📱 Omniy - Instagram投稿管理アプリ

シンプルで効率的なInstagram予約投稿管理システム

**📖 Read this in other languages:** [English](README-en.md)

## 🎯 プロジェクト概要

Omniyは、Instagram投稿の予約管理を効率化するWebアプリケーションです。現在、最小限の機能で再構築されており、段階的に機能を追加していく予定です。

### 🏗️ 技術スタック

```
Frontend: Vue.js 3 + Vuetify + TypeScript
Backend: Firebase Functions + Firestore
Authentication: Firebase Auth
Hosting: Firebase Hosting
```

## 🚀 開発環境セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Firebase CLI
- Git

### 1. プロジェクトクローン

```bash
git clone [repository-url]
cd Omni_insta
```

### 2. 依存関係インストール

```bash
# フロントエンド
cd frontend
npm install

# バックエンド
cd ../functions
npm install
```

### 3. 環境設定

```bash
# フロントエンド環境設定
cp frontend/.env.example frontend/.env.local
# .env.localファイルを編集してFirebase設定を追加

# Firebase設定
firebase login
firebase use [project-id]
```

### 4. 開発サーバー起動

```bash
# フロントエンド開発サーバー
cd frontend
npm run dev

# Firebase Emulator（別ターミナル）
firebase emulators:start
```

## 📱 現在の機能

### ✅ 実装済み
- 基本的なVue.js 3セットアップ
- Firebase認証基盤
- シンプルなホームページ
- ログイン・ログアウト機能
- 基本的なダッシュボード

### 🔧 開発中
- Instagram API連携
- 投稿スケジューリング
- 複数アカウント管理
- 投稿分析機能

## 🗂️ プロジェクト構造

```
├── frontend/              # Vue.js フロントエンド
│   ├── src/
│   │   ├── components/    # 再利用可能コンポーネント
│   │   ├── views/         # ページコンポーネント
│   │   ├── stores/        # Pinia状態管理
│   │   ├── services/      # API通信
│   │   └── router/        # ルーティング
│   └── ...
├── functions/             # Firebase Functions
│   ├── src/
│   │   ├── api/          # API エンドポイント
│   │   ├── services/     # ビジネスロジック
│   │   └── utils/        # ユーティリティ
│   └── ...
├── CLAUDE.md             # AI開発支援設定
├── PROJECT_SPECIFICATIONS.md  # プロジェクト仕様
├── OPERATIONS_GUIDE.md   # 運用ガイド
└── README.md             # このファイル
```

## 🔧 開発コマンド

```bash
# フロントエンド開発
npm run dev          # 開発サーバー起動
npm run build        # 本番用ビルド
npm run preview      # ビルド結果プレビュー

# テスト
npm run test         # テスト実行
npm run test:coverage # カバレッジ測定

# コード品質
npm run lint         # ESLint実行
npm run type-check   # TypeScript型チェック
```

## 📚 ドキュメント

- [プロジェクト仕様書](PROJECT_SPECIFICATIONS.md)
- [運用ガイド](OPERATIONS_GUIDE.md)
- [開発者向けガイド](CLAUDE.md)

## 🔄 リセット履歴

このプロジェクトは2025年7月に、技術的負債の解消と開発効率向上のために一度リセットされました。重要な設定とドキュメントは保持され、フロントエンドは最小限の構成で再構築されています。

---

## 📄 ライセンス

このプロジェクトは[MIT License](LICENSE)の下で公開されています。

## 🤝 コントリビューション

プルリクエストやIssueでのコントリビューションを歓迎いたします！

---

🚀 **効率的なInstagram投稿管理を実現します！** 📱✨ 