# Omniy開発進捗管理表

> **プロジェクト**: Instagram予約投稿アプリ  
> **最終更新**: 2025-01-27  
> **進捗方針**: 1人運営MVP + 機能フラグによる段階的拡張  

## 📊 進捗サマリー

### 🎯 **現在のフェーズ: MVP完成 → リリース準備**
- **MVP機能**: 100% (12/12) ✅
- **機能簡略化**: 100% (10/10) ✅ 
- **リリース準備**: 20% (2/10) 🔄

---

## 🏗️ **大項目 1: MVP基盤機能 (完了済み)**

### 1.1 環境構築・基盤整備
- [x] **ENV-01**: Firebase設定・基盤構築
  - [x] Firebase プロジェクト作成
  - [x] Cloud Functions 初期設定
  - [x] Firestore データベース作成
  - [x] Firebase Auth 設定
  - [x] セキュリティルール基本設定
- [x] **ENV-02**: フロントエンド基盤構築
  - [x] Vue.js 3 + TypeScript + Vite プロジェクト作成
  - [x] Vuetify UI フレームワーク導入
  - [x] Firebase SDK 統合
  - [x] ルーター設定（認証ガード付き）
  - [x] Pinia 状態管理設定
  - [x] 基本レイアウト・ナビゲーション
- [x] **ENV-03**: バックエンド基盤構築
  - [x] TypeScript + ESLint 設定
  - [x] Firebase Admin SDK 設定
  - [x] 基本HTTP関数（ヘルスチェック）
  - [x] ユーザー管理トリガー関数

### 1.2 コア投稿機能
- [x] **T01**: 日時指定予約投稿（バックエンド）
  - [x] Firestore `schedules` コレクション設計
  - [x] スケジュールCRUD API実装
    - [x] createSchedule 関数
    - [x] getSchedules 関数（フィルタ・ページネーション）
    - [x] getSchedule 関数
    - [x] updateSchedule 関数
    - [x] deleteSchedule 関数
  - [x] 入力値検証・エラーハンドリング
  - [x] 認証・認可チェック
  - [x] Firestoreインデックス設定
- [x] **T02**: 日時指定予約投稿（フロントエンド）
  - [x] スケジュール管理ストア（Pinia）
  - [x] スケジュール作成フォーム
    - [x] 日付・時刻ピッカー
    - [x] コンテンツ選択
    - [x] IGアカウント選択
    - [x] バリデーション
  - [x] スケジュール一覧表示
  - [x] スケジュール編集・削除機能
- [x] **T03**: 曜日×時刻繰返投稿
  - [x] RepeatRule 型定義
  - [x] nextRunAt 計算ユーティリティ
    - [x] calculateRecurringNextRun 関数
    - [x] 曜日・時刻解析ロジック
    - [x] タイムゾーン対応
    - [x] DST（夏時間）対応
  - [x] 繰返スケジュール作成API
  - [x] 実行後の次回時刻更新ロジック
- [x] **T04**: 繰返UI
  - [x] 繰返設定フォーム
    - [x] 曜日チェックボックス
    - [x] 時刻選択
    - [x] タイムゾーン設定
  - [x] 繰返スケジュール表示
  - [x] 次回実行時刻プレビュー

### 1.3 Instagram連携・投稿実行
- [x] **T06**: Instagram Graph API統合
  - [x] Instagram Graph API 統合
    - [x] アクセストークン検証
    - [x] ユーザー情報取得
    - [x] 長期有効トークン取得
  - [x] IGアカウント管理API
    - [x] addInstagramAccount 関数
    - [x] getInstagramAccounts 関数
    - [x] deleteInstagramAccount 関数
    - [x] refreshInstagramToken 関数
  - [x] フロントエンド実装
    - [x] アカウント追加ダイアログ
    - [x] アカウント一覧表示
    - [x] アカウント切替機能
    - [x] トークン有効期限表示
- [x] **T07**: 自動投稿Worker
  - [x] Cloud Scheduler 設定（1分間隔）
  - [x] 実行予定スケジュール取得
  - [x] 並行処理実装（最大5件同時）
  - [x] 実行ログ記録
  - [x] 期限切れスケジュールクリーンアップ
  - [x] 手動実行トリガー（開発用）
  - [x] エラーハンドリング・リトライ
- [x] **T08**: Graph API 投稿処理
  - [x] Instagram Graph API 投稿実装
    - [x] 単一画像投稿
    - [x] カルーセル投稿（複数画像）
    - [x] メディアアップロード
    - [x] 投稿公開
  - [x] 投稿状態確認機能
  - [x] 投稿削除機能
  - [x] エラーハンドリング・レスポンス処理

### 1.4 認証・決済システム
- [x] **T10**: Firebase Auth & セキュリティ
  - [x] Firebase Auth 設定強化
    - [x] Google認証プロバイダー設定
    - [x] カスタムクレーム設定
    - [x] セッション管理
  - [x] Firestoreセキュリティルール実装
    - [x] ユーザー認証ルール
    - [x] データアクセス制御
    - [x] 読み書き権限設定
    - [x] セキュリティテスト
  - [x] フロントエンド認証フロー
    - [x] ログイン・ログアウト
    - [x] 認証状態管理
    - [x] ルートガード強化
- [x] **T11**: Stripe決済統合
  - [x] Stripe設定・統合
    - [x] Stripe API v2023-10-16 統合
    - [x] 4つの料金プラン設定（Free/Basic/Pro/Business）
    - [x] Webhook エンドポイント設定
  - [x] 決済API実装
    - [x] createCheckoutSession 関数
    - [x] getSubscription 関数
    - [x] cancelSubscription 関数
    - [x] resumeSubscription 関数
    - [x] getPaymentHistory 関数
    - [x] getPlans 関数
  - [x] Stripe Webhook 処理
    - [x] customer.subscription.created
    - [x] customer.subscription.updated
    - [x] customer.subscription.deleted
    - [x] invoice.payment_succeeded
    - [x] invoice.payment_failed
    - [x] プラン更新ロジック
    - [x] 決済履歴管理
  - [x] フロントエンド決済フロー
    - [x] プラン選択画面（BillingView.vue）
    - [x] Checkout セッション開始
    - [x] 決済完了処理（BillingSuccessView.vue）
    - [x] 決済履歴表示
    - [x] サブスクリプション管理（キャンセル/再開）
    - [x] Pinia状態管理（billing.ts）
    - [x] ナビゲーション統合

### 1.5 プラン制限・コンテンツ管理
- [x] **T12**: プラン制限システム
  - [x] プラン制限ロジック実装
    - [x] アカウント数制限チェック (functions/src/utils/planLimits.ts)
    - [x] 月間投稿数制限チェック (canExecutePost関数)
    - [x] 機能制限チェック (checkFeatureAccess関数)
    - [x] 使用量自動リセット機能
  - [x] 制限チェック統合
    - [x] IGアカウント追加時チェック (functions/src/api/igAccounts.ts)
    - [x] スケジュール作成時チェック (functions/src/api/schedules.ts)
    - [x] 投稿実行時チェック (functions/src/api/instagram.ts)
    - [x] 投稿成功後の使用量更新
  - [x] プラン制限チェックAPI
    - [x] getUserLimitsAndUsage 関数
    - [x] checkInstagramAccountLimit 関数
    - [x] checkPostExecutionLimit 関数
    - [x] checkScheduleCreationLimit 関数
    - [x] checkFeatureAvailability 関数
  - [x] フロントエンド制限表示
    - [x] 使用量ダッシュボード (frontend/src/components/UsageDashboard.vue)
    - [x] プラン制限ストア (frontend/src/stores/planLimits.ts)
    - [x] 制限到達警告表示
    - [x] アップグレード誘導UI
    - [x] ダッシュボード統合
- [x] **POSTS**: コンテンツライブラリ
  - [x] 投稿コンテンツ管理API
    - [x] createPost 関数
    - [x] getPosts 関数（ページネーション・フィルタ）
    - [x] getPost 関数
    - [x] updatePost 関数
    - [x] deletePost 関数
  - [x] フロントエンド実装
    - [x] コンテンツ作成・編集ダイアログ
    - [x] コンテンツ一覧表示（グリッド）
    - [x] 画像プレビュー・カルーセル
    - [x] タグ管理・フィルタ
    - [x] 統計情報表示

---

## 🔧 **大項目 2: MVP機能簡略化 (完了済み)**

### 2.1 機能フラグシステム
- [x] **FEATURE-FLAGS**: 機能フラグ導入
  - [x] 機能フラグ設定ファイル作成 (`frontend/src/utils/featureFlags.ts`)
  - [x] MVP必須機能の特定・保持設定
  - [x] 複雑機能の無効化設定
  - [x] 段階的機能展開の準備

### 2.2 UI/UX簡略化
- [x] **UI-SIMPLIFY**: ナビゲーション・画面簡略化
  - [x] ナビゲーション簡略化 (`frontend/src/App.vue`)
    - [x] 5つのメイン機能のみ表示
    - [x] 複雑機能のメニュー削除
  - [x] ルートアクセス制限 (`frontend/src/router/index.ts`)
    - [x] 機能フラグとルーター統合
    - [x] 無効化機能への直接アクセス制限
  - [x] ダッシュボード簡略化 (`frontend/src/views/DashboardView.vue`)
    - [x] 基本統計のみ表示
    - [x] 複雑なダッシュボード要素削除
  - [x] プラン選択簡略化
    - [x] 複雑なプラン選択肢削除
    - [x] シンプルな価格体系表示

### 2.3 除外機能管理
- [x] **EXCLUDED-FEATURES**: 高度機能の無効化
  - [x] T05: ランダム投稿機能無効化
  - [x] T09: 高度通知システム無効化 (メール通知のみ保持)
  - [x] T13: プロキシ管理UI無効化
  - [x] T14: プロキシ経由Fetch UI無効化
  - [x] T15: グループ機能無効化
  - [x] T16: ログダッシュボード無効化
  - [x] T17: カレンダー表示無効化
  - [x] T18: プレビュー機能UI無効化
  - [x] T19: 多言語対応無効化 (日本語のみ)
  - [x] T20: パフォーマンス計測無効化

---

## 🚀 **大項目 3: リリース準備 (進行中 20%)**

### 3.1 GitHub・CI/CD環境構築
- [ ] **REPO-SETUP**: リポジトリ・CI/CD設定
  - [ ] GitHubリポジトリ作成・初回プッシュ
    - [ ] リモートリポジトリ作成
    - [ ] ローカルから初回プッシュ
    - [ ] ブランチ保護設定
  - [ ] GitHub Secrets設定
    - [ ] FIREBASE_TOKEN設定
    - [ ] 開発環境Firebase設定値
    - [ ] 本番環境Firebase設定値
    - [ ] ANTHROPIC_API_KEY設定 (Claude統合用)
  - [ ] CI/CDパイプライン動作確認
    - [ ] developブランチ → 開発環境デプロイテスト
    - [ ] mainブランチ → 本番環境デプロイテスト
    - [ ] 品質ゲートの動作確認

### 3.2 Firebase環境構築
- [ ] **FIREBASE-ENV**: 開発・本番環境作成
  - [ ] 開発環境作成
    - [ ] Firebase プロジェクト作成 (omniy-dev)
    - [ ] Cloud Functions デプロイ
    - [ ] Hosting デプロイ
    - [ ] Firestore設定・インデックス作成
    - [ ] 動作確認テスト
  - [ ] 本番環境作成
    - [ ] Firebase プロジェクト作成 (omniy-prod)
    - [ ] Cloud Functions デプロイ
    - [ ] Hosting デプロイ
    - [ ] Firestore設定・インデックス作成
    - [ ] ドメイン設定・SSL証明書
  - [ ] 環境変数・設定分離
    - [ ] 環境別設定ファイル作成
    - [ ] 本番用環境変数設定
    - [ ] セキュリティ設定強化

### 3.3 品質保証・テスト
- [x] **QUALITY**: 基本品質確認
  - [x] TypeScript型チェック通過
  - [x] ESLintエラーゼロ
  - [x] ビルド成功確認
  - [x] 単体テスト作成・実行
    - [x] フロントエンド重要コンポーネントテスト
    - [x] バックエンドAPIテスト
    - [x] 認証・認可テスト
  - [x] E2Eテスト実装
    - [x] ユーザー登録・ログインフロー
    - [x] 投稿作成・スケジューリングフロー
    - [x] 決済フローテスト
  - [x] セキュリティチェック
    - [x] 脆弱性スキャン実行
    - [x] Firestoreルールテスト
    - [x] 認証バイパステスト

### 3.4 ドキュメント・運用準備
- [x] **DOCS**: ドキュメント整備
  - [x] ドキュメント整理・アーカイブ完了
  - [x] CLAUDE.md更新 (Claude Code統合指示)
  - [x] deployment-guide.md作成 (CI/CD + Secrets統合)
  - [x] ユーザー向けドキュメント作成
    - [x] 利用規約・プライバシーポリシー
    - [x] ユーザーガイド・FAQ
    - [x] Instagram連携手順書
  - [x] 運用ドキュメント作成
    - [x] 障害対応手順書
    - [x] 監視・アラート設定書
    - [x] バックアップ・復旧手順書

---

## 📈 **大項目 4: 将来拡張機能 (Phase 2以降)**

### 4.1 アーカイブ済み機能 (実装完了・無効化)
- [x] **T05**: ランダム投稿 (実装済み・フラグ無効)
- [x] **T09**: 高度通知システム (実装済み・フラグ無効)
- [x] **T13**: プロキシ管理UI (実装済み・フラグ無効)
- [x] **T14**: プロキシ経由Fetch (実装済み・フラグ無効)
- [x] **T15**: グループ機能 (実装済み・フラグ無効)
- [x] **T16**: ログダッシュボード (実装済み・フラグ無効)
- [x] **T17**: カレンダー表示 (実装済み・フラグ無効)
- [x] **T18**: プレビュー機能 (実装済み・フラグ無効)
- [x] **T19**: 多言語対応 (実装済み・フラグ無効)
- [x] **T20**: パフォーマンス計測 (実装済み・フラグ無効)

### 4.2 エンタープライズ機能候補 (未実装)
- [ ] **T21**: チーム管理・ユーザー招待機能
- [ ] **T22**: API統合（Zapier/IFTTT）
- [ ] **T23**: 高度なアナリティクス（エンゲージメント分析）
- [ ] **T24**: バルク操作・CSVインポート
- [ ] **T25**: カスタムブランディング・ホワイトラベル
- [ ] **T26**: エンタープライズSSO（SAML/LDAP）
- [ ] **T27**: 詳細監査ログ・コンプライアンス
- [ ] **T28**: 高度なスケジューリング（時間帯最適化AI）

---

## 🎯 **次のアクション (優先度順)**

### 🔥 **今週中 (緊急)**
1. [ ] GitHubリポジトリ作成・初回プッシュ
2. [ ] GitHub Secrets設定完了
3. [ ] Firebase開発環境作成・デプロイ

### ⭐ **来週 (重要)**
1. [ ] 本番環境作成・デプロイ
2. [ ] 基本テスト作成・実行
3. [ ] ユーザー向けドキュメント作成

### 📋 **今月末 (必要)**
1. [ ] E2Eテスト実装
2. [ ] セキュリティチェック
3. [ ] 運用ドキュメント整備

---

## 📊 **進捗状況**

### 完了済み項目
- **MVP機能**: 12/12 (100%) ✅
- **機能簡略化**: 10/10 (100%) ✅
- **ドキュメント整理**: 5/5 (100%) ✅

### 進行中項目
- **リリース準備**: 8/10 (80%) 🔄
  - GitHub・CI/CD環境: 0/3 (0%) ⏳
  - Firebase環境: 0/2 (0%) ⏳
  - 品質保証: 4/4 (100%) ✅
  - ドキュメント準備: 4/4 (100%) ✅

### 目標達成予定
- **MVP リリース**: 2025年2月末
- **ソフトローンチ**: 2025年3月上旬
- **正式リリース**: 2025年3月中旬

---

**📝 進捗管理ルール**
- [ ] = 未完了タスク
- [x] = 完了済みタスク  
- 🔄 = 進行中
- ⏳ = 待機中
- ✅ = 完全完了