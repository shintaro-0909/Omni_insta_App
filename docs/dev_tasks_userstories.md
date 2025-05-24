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
- [ ] フロントエンド認証フロー
  - [ ] ログイン・ログアウト
  - [ ] 認証状態管理
  - [ ] ルートガード強化

### T11: Stripe Checkout
- [ ] Stripe設定・統合
  - [ ] Stripe アカウント設定
  - [ ] 商品・価格設定
  - [ ] Webhook エンドポイント設定
- [ ] 決済API実装
  - [ ] createCheckoutSession 関数
  - [ ] Stripe Webhook 処理
  - [ ] プラン更新ロジック
  - [ ] 決済履歴管理
- [ ] フロントエンド決済フロー
  - [ ] プラン選択画面
  - [ ] Checkout セッション開始
  - [ ] 決済完了処理
  - [ ] 決済履歴表示

### T12: Plan制限チェック
- [ ] プラン制限ロジック実装
  - [ ] アカウント数制限チェック
  - [ ] 月間投稿数制限チェック
  - [ ] 機能制限チェック
- [ ] 制限チェック統合
  - [ ] IGアカウント追加時チェック
  - [ ] スケジュール作成時チェック
  - [ ] 投稿実行時チェック
- [ ] フロントエンド制限表示
  - [ ] 使用量表示
  - [ ] 制限到達警告
  - [ ] アップグレード誘導

---

## Sprint 2: Should機能

### T13: Proxy設定 (管理UI)
- [ ] プロキシ管理機能
- [ ] プロキシ設定UI
- [ ] プロキシ割当機能

### T14: CF: Proxy経由Fetch
- [ ] NodeFetch + Proxy実装
- [ ] IP確認テスト
- [ ] プロキシローテーション

### T15: アカウントグループ機能
- [ ] Firestore subcollection `groups`
- [ ] グループ管理UI
- [ ] グループ単位プロキシ設定

### T16: ログダッシュボード
- [ ] 実行ログ表示機能
- [ ] 成功/失敗グラフ
- [ ] フィルタ・検索機能
- [ ] 24時間以内ログ表示

---

## Sprint 3: Could機能

### T17: カレンダー表示
- [ ] FullCalendar ライブラリ統合
- [ ] 月表示投稿サマリ
- [ ] カレンダーイベント管理

### T18: 投稿プレビュー
- [ ] Instagram風カードUI
- [ ] 画像&caption整形確認
- [ ] プレビュー機能

### T19: 多言語対応基盤
- [ ] Vue-i18n setup
- [ ] 日英翻訳key管理
- [ ] 言語切替機能

### T20: パフォーマンス計測
- [ ] Lighthouse計測
- [ ] CF cold-start計測
- [ ] PWAスコア >80達成

---

## 進捗サマリー

**Sprint 1 進捗: 75% (9/12 Must タスク完了)**

### 完了済み ✅
- ENV-01, ENV-02, ENV-03: 環境構築・基盤整備
- T01-T09: コア機能（スケジュール管理、自動投稿、通知）
- POSTS: コンテンツライブラリ

### 進行中 🔄
- T10: Auth & Firestore ルール
- T11: Stripe Checkout  
- T12: Plan制限チェック

### 次期Sprint 📋
- T13-T16: Should機能
- T17-T20: Could機能