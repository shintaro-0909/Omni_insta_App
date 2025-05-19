# 開発タスク一覧 – ユーザーストーリー単位 (Sprint 0–1)

> **凡例**  
> - `PRI` = Priority (M=Must, S=Should, C=Could) – MoSCoW  
> - `AC`  = Acceptance Criteria  
> - 規模見積は **Story Points (SP)**

| ID | User Story | PRI | Task内容 | AC | SP |
|----|------------|-----|---------|----|----|
| T01 | 日時指定予約投稿 | M | Firestore: `schedules` コレクションCRUD API (CF) | Create, Read, Update, Delete が REST & SDK で可能 | 3 |
| T02 | 日時指定予約投稿 | M | フロント: 予約フォーム (日付+時刻Picker) | 正常入力→Firestoreにドキュメント生成 | 2 |
| T03 | 曜日×時刻繰返投稿 | M | CF: Repeat Rule 解析 & `nextRunAt` 自動計算ユーティリティ | Monday 10:00などをUNIX日時へ展開 | 3 |
| T04 | 繰返UI | M | フロント: 繰返設定UI (曜日チェックボックス+時刻) | 保存/編集/削除が可能 | 2 |
| T05 | ランダム投稿 | M | CF: ランダム抽選ロジック + `nextRunAt` 更新 | 候補リストから均等分布で抽選 | 2 |
| T06 | マルチアカウントUI | M | フロント: アカウント切替ドロップダウン & 一覧 | 切替でスケジュールが動的更新 | 2 |
| T07 | 自動投稿Worker | M | CF Scheduler関数: 1分毎に`nextRunAt`<=nowタスク実行 | 100件/sec 扱える性能確認 | 5 |
| T08 | Graph API 投稿処理 | M | CF: IGメディア作成→公開 2段階呼び出し | 正常レスポンスでログに success | 5 |
| T09 | 投稿リトライ & 通知 | M | CF: 失敗時 Exponential Backoff + Gmail通知 | 3回失敗でユーザー通知 | 3 |
| T10 | Auth & Firestore ルール | M | Firebase Auth (+ Google) & ルール実装 | 他ユーザー参照不可確認 | 3 |
| T11 | Stripe Checkout | M | CF: `/createCheckoutSession` + Webhook| 購入→`currentPlan` 更新 | 5 |
| T12 | Plan制限チェック | M | CF: アカウント追加時にプラン上限検証 | 上限超過でエラー返却 | 2 |
| T13 | Proxy設定 (管理UI) | S | フロント: プロキシ入力フォーム & 割当 | DB保存 & 反映 | 3 |
| T14 | CF: Proxy経由Fetch | S | UrlFetchApp ではなく NodeFetch + Proxy in CF | IP確認で異なることをテスト | 5 |
| T15 | アカウントグループ機能 | S | Firestore subcollection `groups` + UI | グループ単位でProxy設定可能 | 3 |
| T16 | ログダッシュボード | S | フロント: 成功/失敗グラフ & フィルタ | 24h以内ログ表示 | 3 |
| T17 | カレンダー表示 | C | FullCalendar ライブラリ統合 | 月表示で投稿サマリ | 3 |
| T18 | 投稿プレビュー | C | Instagram風カードUI プレビュー | 画像&caption整形確認 | 2 |
| T19 | 多言語対応基盤 | C | i18n setup (Vue-i18n / React-intl) | key 翻訳切替で日英表示 | 3 |
| T20 | パフォーマンス計測 | C | Lighthouse & CF cold-start計測 | PWAスコア >80 | 2 |