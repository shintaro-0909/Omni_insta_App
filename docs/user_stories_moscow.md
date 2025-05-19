# Instagram予約投稿ツール — ユーザーストーリー (MoSCoW分類)

## Must – 必須
- **日時指定予約投稿**
  - *As a user*, I want my post to be automatically published at a specific date & time so that I can prepare content in advance and hit prime time without manual effort.
- **曜日×時刻の繰り返し投稿**
  - *As a user*, I want to set a recurring schedule (e.g., every Monday 10:00) so that weekly campaigns are posted automatically.
- **ランダム投稿**
  - *As a user*, I want the system to choose from my content library at random within a time window, to maintain a natural posting pattern.
- **安定した自動投稿 & リトライ**
  - *As a user*, I need failed posts to retry automatically and notify me on persistent failure to prevent missed posts.
- **マルチアカウント管理 UI**
  - *As a multi‑account user*, I need an interface to switch accounts and view schedules per account for easy management.

## Should – 望ましい
- **プロキシ/IP 設定**
  - *As an admin*, I want to assign a dedicated proxy or IP per account to lower ban risk.
- **IP ローテーション間隔設定**
  - *As an admin*, I want to configure how often IP addresses rotate to balance safety and reliability.
- **アカウントグループ化**
  - *As a marketer*, I want to group accounts and apply shared proxy settings, avoiding cross‑contamination.
- **活動ログ & 監視ダッシュボード**
  - *As an admin*, I want detailed logs and alerts for unusual blocks so I can react quickly.

## Could – できれば
- **多言語 UI** (post‑launch)
  - Provide English and other languages once domestic traction is achieved.
- **投稿パフォーマンス分析**
  - Offer analytics on likes, reach, comment count for scheduled posts.
- **投稿プレビュー**
  - Show how the feed/grid will look before scheduling.
- **カレンダー ビュー**
  - Calendar visualization of all scheduled posts.

## Won’t – 今回は対象外
- 初期段階での多言語化（海外展開後に検討）
- 自動いいね・フォロー・DM 等のスパム機能
- 個人アカウント用の非公式API対応
- Twitter/Facebook 等ほかSNSへの同時投稿機能

---