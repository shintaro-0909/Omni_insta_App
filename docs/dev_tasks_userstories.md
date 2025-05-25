# 開発タスク一覧 – ユーザーストーリー単位 (Sprint 0–1)

> **凡例**  
> - `PRI` = Priority (M=Must, S=Should, C=Could) – MoSCoW  
> - `AC`  = Acceptance Criteria  
> - 規模見積は **Story Points (SP)**
> - `[x]` = 完了, `[ ]` = 未完了

## Sprint 0: 環境構築・基盤整備 ✅

### ENV-01: Firebase設定・基盤構築
- [x] Firebase プロジェクト作成
- [x] Cloud Functions 初期設定
- [x] Firestore データベース作成
- [x] Firebase Auth 設定
- [x] セキュリティルール基本設定

### ENV-02: フロントエンド基盤構築
- [x] Vue.js 3 + TypeScript + Vite プロジェクト作成
- [x] Vuetify UI フレームワーク導入
- [x] Firebase SDK 統合
- [x] ルーター設定（認証ガード付き）
- [x] Pinia 状態管理設定
- [x] 基本レイアウト・ナビゲーション

### ENV-03: バックエンド基盤構築
- [x] TypeScript + ESLint 設定
- [x] Firebase Admin SDK 設定
- [x] 基本HTTP関数（ヘルスチェック）
- [x] ユーザー管理トリガー関数

---

## Sprint 1: MVPコア機能開発

### T01: 日時指定予約投稿（バックエンド） ✅
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

### T02: 日時指定予約投稿（フロントエンド） ✅
- [x] スケジュール管理ストア（Pinia）
- [x] スケジュール作成フォーム
  - [x] 日付・時刻ピッカー
  - [x] コンテンツ選択
  - [x] IGアカウント選択
  - [x] バリデーション
- [x] スケジュール一覧表示
- [x] スケジュール編集・削除機能

### T03: 曜日×時刻繰返投稿 ✅
- [x] RepeatRule 型定義
- [x] nextRunAt 計算ユーティリティ
  - [x] calculateRecurringNextRun 関数
  - [x] 曜日・時刻解析ロジック
  - [x] タイムゾーン対応
  - [x] DST（夏時間）対応
- [x] 繰返スケジュール作成API
- [x] 実行後の次回時刻更新ロジック

### T04: 繰返UI ✅
- [x] 繰返設定フォーム
  - [x] 曜日チェックボックス
  - [x] 時刻選択
  - [x] タイムゾーン設定
- [x] 繰返スケジュール表示
- [x] 次回実行時刻プレビュー

### T05: ランダム投稿 ✅
- [x] ランダム投稿ロジック実装
  - [x] calculateRandomNextRun 関数
  - [x] 最小・最大間隔設定
  - [x] 時間窓制約
  - [x] 均等分布アルゴリズム
- [x] ランダム設定UI
- [x] ランダムスケジュール管理

### T06: マルチアカウント管理 ✅
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

### T07: 自動投稿Worker ✅
- [x] Cloud Scheduler 設定（1分間隔）
- [x] 実行予定スケジュール取得
- [x] 並行処理実装（最大5件同時）
- [x] 実行ログ記録
- [x] 期限切れスケジュールクリーンアップ
- [x] 手動実行トリガー（開発用）
- [x] エラーハンドリング・リトライ

### T08: Graph API 投稿処理 ✅
- [x] Instagram Graph API 投稿実装
  - [x] 単一画像投稿
  - [x] カルーセル投稿（複数画像）
  - [x] メディアアップロード
  - [x] 投稿公開
- [x] 投稿状態確認機能
- [x] 投稿削除機能
- [x] エラーハンドリング・レスポンス処理

### T09: 投稿リトライ & 通知 ✅
- [x] リトライ機能実装
  - [x] Exponential Backoff（5分、15分、1時間）
  - [x] 最大3回リトライ
  - [x] 失敗時状態管理
- [x] 通知システム実装
  - [x] 投稿成功通知
  - [x] 投稿失敗通知
  - [x] メール通知（ログ記録）
  - [x] プッシュ通知（FCM）
  - [x] アプリ内通知
  - [x] Webhook通知
- [x] 通知設定管理
- [x] FCMトークン管理

### POSTS: コンテンツライブラリ ✅
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

## Sprint 1: 残りタスク

### T10: Auth & Firestore ルール ✅
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

### T11: Stripe Checkout ✅
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

### T12: Plan制限チェック ✅
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

---

## Sprint 2: Should機能

### T13: Proxy設定 (管理UI) ✅
- [x] プロキシ管理機能
- [x] プロキシ設定UI
- [x] プロキシ割当機能

### T14: CF: Proxy経由Fetch ✅
- [x] NodeFetch + Proxy実装
- [x] IP確認テスト
- [x] プロキシローテーション

### T15: アカウントグループ機能 ✅
- [x] Firestore subcollection `groups`
  - [x] Group型定義 (functions/src/api/groups.ts)
  - [x] groups CRUD API実装
  - [x] グループ作成・編集・削除機能
  - [x] プロキシ割当機能
- [x] グループ管理UI
  - [x] GroupFormDialog.vue コンポーネント
  - [x] GroupsView.vue 管理画面
  - [x] グループ統計表示
  - [x] フィルタ・検索機能
- [x] グループ単位プロキシ設定
  - [x] グループストア (frontend/src/stores/groups.ts)
  - [x] ナビゲーション・ルーター統合
  - [x] TypeScript型定義完備

### T16: ログダッシュボード ✅
- [x] 実行ログ表示機能
  - [x] 拡張ログAPI実装 (functions/src/api/logs.ts)
  - [x] ログ統計・日別統計API
  - [x] フィルタリング・ページネーション機能
  - [x] 既存postExecutor.tsにuserId追加
- [x] 成功/失敗グラフ
  - [x] Chart.js統合
  - [x] 日別実行統計チャート
  - [x] 成功率・失敗率表示
  - [x] リアルタイム統計カード
- [x] フィルタ・検索機能
  - [x] ステータス・期間・アカウント別フィルタ
  - [x] エラー内容・投稿IDでの検索
  - [x] ログストア (frontend/src/stores/logs.ts)
- [x] 24時間以内ログ表示
  - [x] LogsView.vue ダッシュボード
  - [x] ナビゲーション・ルーター統合
  - [x] CSVエクスポート機能

---

## Sprint 2: Should機能 ✅

### T13: Proxy設定 (管理UI) ✅
- [x] プロキシ管理機能
- [x] プロキシ設定UI
- [x] プロキシ割当機能

### T14: CF: Proxy経由Fetch ✅
- [x] NodeFetch + Proxy実装
- [x] IP確認テスト
- [x] プロキシローテーション

### T15: アカウントグループ機能 ✅
- [x] Firestore subcollection `groups`
  - [x] Group型定義 (functions/src/api/groups.ts)
  - [x] groups CRUD API実装
  - [x] グループ作成・編集・削除機能
  - [x] プロキシ割当機能
- [x] グループ管理UI
  - [x] GroupFormDialog.vue コンポーネント
  - [x] GroupsView.vue 管理画面
  - [x] グループ統計表示
  - [x] フィルタ・検索機能
- [x] グループ単位プロキシ設定
  - [x] グループストア (frontend/src/stores/groups.ts)
  - [x] ナビゲーション・ルーター統合
  - [x] TypeScript型定義完備

### T16: ログダッシュボード ✅
- [x] 実行ログ表示機能
  - [x] 拡張ログAPI実装 (functions/src/api/logs.ts)
  - [x] ログ統計・日別統計API
  - [x] フィルタリング・ページネーション機能
  - [x] 既存postExecutor.tsにuserId追加
- [x] 成功/失敗グラフ
  - [x] Chart.js統合
  - [x] 日別実行統計チャート
  - [x] 成功率・失敗率表示
  - [x] リアルタイム統計カード
- [x] フィルタ・検索機能
  - [x] ステータス・期間・アカウント別フィルタ
  - [x] エラー内容・投稿IDでの検索
  - [x] ログストア (frontend/src/stores/logs.ts)
- [x] 24時間以内ログ表示
  - [x] LogsView.vue ダッシュボード
  - [x] ナビゲーション・ルーター統合
  - [x] CSVエクスポート機能

---

## Sprint 3: Could機能

### T17: カレンダー表示 ✅
- [x] FullCalendar ライブラリ統合
  - [x] FullCalendar v6.1 + Vue3プラグイン導入
  - [x] 日本語ロケール設定
  - [x] dayGrid/timeGrid/listビュー対応
- [x] 月表示投稿サマリ
  - [x] カレンダーストア (frontend/src/stores/calendar.ts)
  - [x] スケジュール→イベント変換ロジック
  - [x] 繰り返しスケジュール展開機能
  - [x] イベント色分け（タイプ・ステータス別）
- [x] カレンダーイベント管理
  - [x] CalendarView.vue実装
  - [x] 統計サマリー・フィルタ機能
  - [x] 今日・近日予定サイドバー
  - [x] イベント詳細ダイアログ
  - [x] ナビゲーション・ルーター統合

### T18: 投稿プレビュー ✅
- [x] Instagram風カードUI
  - [x] InstagramPreview.vue コンポーネント実装
  - [x] レスポンシブデザインの投稿カード
  - [x] プロフィール画像・ユーザー名表示
  - [x] カルーセル対応（複数画像スワイプ）
- [x] 画像&caption整形確認
  - [x] 画像プレビュー機能
  - [x] キャプション文字数カウント
  - [x] ハッシュタグ・メンション検出
  - [x] 改行・絵文字対応
- [x] プレビュー機能
  - [x] 投稿作成時のリアルタイムプレビュー
  - [x] スケジュール詳細でのプレビュー表示
  - [x] プレビューストア（preview.ts）実装
  - [x] PostFormDialog・ScheduleFormDialog統合

### T19: 多言語対応基盤 ✅
- [x] Vue-i18n setup
  - [x] Vue I18n v9統合（frontend/src/plugins/i18n.ts）
  - [x] 翻訳ファイル構造設計（locales/ja.json, en.json）
  - [x] ネストしたキー構造対応
  - [x] フォールバックロケール設定
- [x] 日英翻訳key管理
  - [x] 日本語翻訳（locales/ja.json）- 全UI要素
  - [x] 英語翻訳（locales/en.json）- 全UI要素
  - [x] エラーメッセージ・通知文言の多言語化
  - [x] フォーム検証メッセージの翻訳
- [x] 言語切替機能
  - [x] LanguageSwitcher.vueコンポーネント
  - [x] ヘッダーナビゲーション統合
  - [x] 言語設定のローカルストレージ保存
  - [x] 全コンポーネントでt()関数統合

### T20: パフォーマンス計測 ✅
- [x] Lighthouse計測
  - [x] Lighthouse CI設定（lighthouserc.js）
  - [x] パフォーマンス自動計測パイプライン
  - [x] Core Web Vitals監視
  - [x] アクセシビリティスコア計測
- [x] CF cold-start計測
  - [x] パフォーマンスダッシュボード実装
  - [x] API応答時間監視（PerformanceDashboard.vue）
  - [x] Cold start検出・アラート機能
  - [x] パフォーマンスストア（performance.ts）
- [x] PWAスコア >80達成
  - [x] パフォーマンスメトリクス表示（PerformanceMetric.vue）
  - [x] APIインターセプター実装（performanceInterceptor.ts）
  - [x] リクエスト・レスポンス時間計測
  - [x] ダッシュボード統合・リアルタイム表示

---

## 進捗サマリー

**Sprint 1 進捗: 100% (12/12 Must タスク完了) 🎉**
**Sprint 2 進捗: 100% (4/4 Should タスク完了) 🎉**
**Sprint 3 進捗: 100% (4/4 Could タスク完了) 🎉**

### 完了済み ✅
**基盤・コア機能 (Sprint 1)**
- ENV-01, ENV-02, ENV-03: 環境構築・基盤整備
- T01-T12: 全コア機能（スケジュール管理、自動投稿、通知、決済、制限チェック）
- POSTS: コンテンツライブラリ
- T10: Auth & Firestore ルール
- T11: Stripe Checkout（完全実装）
- T12: Plan制限チェック（完全実装）

**拡張機能 (Sprint 2)**
- T13: プロキシ管理機能（完全実装）
- T14: プロキシ経由Fetch機能（完全実装）
- T15: アカウントグループ機能（完全実装）
- T16: ログダッシュボード（完全実装）

**高度機能 (Sprint 3)**
- T17: カレンダー表示（完全実装）
- T18: 投稿プレビュー機能（完全実装）
- T19: 多言語対応基盤（完全実装）
- T20: パフォーマンス計測・PWA対応（完全実装）

### 完了済み全機能 🎉
**All Sprint 1-3 Features Completed!**

**すべてのコア機能・拡張機能・高度機能が実装完了しました。**

---

## Sprint 4: エンタープライズ機能 (検討中)

### 候補機能リスト
- **T21**: チーム管理・ユーザー招待機能
- **T22**: API統合（Zapier/IFTTT）
- **T23**: 高度なアナリティクス（エンゲージメント分析）
- **T24**: バルク操作・CSVインポート
- **T25**: カスタムブランディング・ホワイトラベル
- **T26**: エンタープライズSSO（SAML/LDAP）
- **T27**: 詳細監査ログ・コンプライアンス
- **T28**: 高度なスケジューリング（時間帯最適化AI）

### テスト・品質保証タスク
- **TEST-01**: E2Eテスト自動化（Playwright/Cypress）
- **TEST-02**: ロードテスト・ストレステスト
- **TEST-03**: セキュリティペネトレーションテスト
- **TEST-04**: 多言語UI/UXテスト

### デプロイメント・運用タスク
- **OPS-01**: プロダクション環境セットアップ
- **OPS-02**: CI/CDパイプライン強化
- **OPS-03**: 監視・アラート（DataDog/Sentry統合）
- **OPS-04**: バックアップ・災害復旧計画
- **OPS-05**: カスタマーサポートツール統合