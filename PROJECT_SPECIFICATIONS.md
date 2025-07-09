# 📊 Omniy プロジェクト統合仕様書

> **プロジェクト**: Omniy Instagram予約投稿アプリ  
> **バージョン**: 1.0  
> **最終更新**: 2025-01-09  
> **ステータス**: 承認済み

---

## 📋 **プロジェクト概要**

### **🚀 Omniy とは**
1人運営向けに最適化されたInstagram予約投稿プラットフォーム。シンプル・効率的・持続可能な設計により、月間売上¥5,000,000を目指す日本市場特化型SaaS。

### **✨ 特徴**
- 🎯 **シンプルな操作**: 3クリックで投稿予約完了
- ⚡ **高速パフォーマンス**: 最適化により30%高速化
- 🛡️ **安全・安心**: Instagram公式API使用
- 💰 **コスト効率**: 1人運営に最適化された料金設定
- 🔧 **保守性**: 70%の複雑性削除で運用しやすい

### **📈 プロジェクト進捗状況**

**現在の開発状況（2025年1月9日時点）:**
- **MVP基盤機能**: 12/12 (100%) ✅ 完了
- **機能簡略化**: 10/10 (100%) ✅ 完了  
- **リリース準備**: 8/10 (80%) 🔄 進行中
- **Phase 1拡張**: Facebook認証統合 3.5/4 (87.5%) 🔄 進行中

---

## 🎯 **ビジネス要件**

### **BR-001: 事業目標**
```yaml
要件ID: BR-001
分類: Must
概要: 1人運営で月間売上¥5,000,000達成

具体的指標:
  - 有料ユーザー数: 500名 (12ヶ月以内)
  - 月間売上: ¥5,000,000 (12ヶ月以内)
  - 利益率: 95%以上維持
  - 顧客獲得コスト: ¥5,000以下
  - システム稼働率: 99.9%以上

成功基準:
  - 連続3ヶ月で目標売上達成
  - 顧客チャーン率5%以下
  - サポート工数週20時間以内
```

### **BR-002: ターゲットユーザー**
```yaml
要件ID: BR-002
分類: Must
概要: 日本の個人・小規模事業者をターゲット

主要ペルソナ:
  - 個人インフルエンサー (フォロワー1,000-50,000)
  - 小規模事業者 (従業員1-10名)
  - フリーランス・クリエイター
  - 主婦・副業ワーカー

ニーズ:
  - Instagram運用時間90%削減
  - エンゲージメント30%向上
  - 投稿忘れゼロ
  - 簡単操作・日本語対応
```

### **BR-003: 価値提案**
```yaml
要件ID: BR-003
分類: Must
概要: 時間削減とエンゲージメント向上

提供価値:
  - 時間削減: 週10時間 → 1時間
  - エンゲージメント: 30%向上
  - 投稿一貫性: 100%達成
  - コスト削減: 他ツール比50%安

競合優位性:
  - 日本語特化UI/UX
  - Instagram公式API
  - 1人運営特化料金
  - 簡単操作重視
```

---

## 🔧 **機能要件**

### **MVP機能 (必須実装)**

#### **FR-001: 認証システム**
```yaml
要件ID: FR-001
分類: Must
概要: Firebase Auth + Google OAuth

実装内容:
  - Googleアカウントログイン
  - メール/パスワード認証
  - パスワードリセット
  - プロフィール管理

セキュリティ:
  - OAuth 2.0準拠
  - JWT Token管理
  - セッション管理
  - CSRF保護
```

#### **FR-002: Instagram連携**
```yaml
要件ID: FR-002
分類: Must
概要: Instagram Graph API v18.0統合

実装内容:
  - アカウント認証・接続
  - トークン自動更新
  - 投稿権限管理
  - エラーハンドリング

技術仕様:
  - Instagram Graph API v18.0
  - Facebook Business SDK
  - 60日トークン更新
  - レート制限対応
```

#### **FR-003: 投稿スケジューリング**
```yaml
要件ID: FR-003
分類: Must
概要: 柔軟なスケジュール機能

実装内容:
  - 日時指定投稿
  - 繰り返し投稿（日・週・月）
  - タイムゾーン対応
  - スケジュール編集・削除

技術仕様:
  - Cloud Scheduler連携
  - Firestore スケジュール管理
  - 複数アカウント対応
  - 失敗時リトライ機能
```

#### **FR-004: コンテンツ管理**
```yaml
要件ID: FR-004
分類: Must
概要: 投稿コンテンツライブラリ

実装内容:
  - 画像アップロード（最大10MB）
  - キャプション編集
  - ハッシュタグ管理
  - プレビュー機能

技術仕様:
  - Cloud Storage連携
  - 画像最適化・リサイズ
  - メタデータ管理
  - 重複チェック
```

#### **FR-005: 自動投稿実行**
```yaml
要件ID: FR-005
分類: Must
概要: 確実な自動投稿システム

実装内容:
  - スケジュール通り自動実行
  - 失敗時リトライ（最大3回）
  - 実行ログ記録
  - 成功率99.5%以上

技術仕様:
  - Cloud Functions実行
  - Dead Letter Queue
  - 実行状態管理
  - アラート通知
```

#### **FR-006: プラン・決済管理**
```yaml
要件ID: FR-006
分類: Must
概要: Stripe決済システム

プラン構成:
  - Free: 月5投稿
  - Basic (¥1,980): 月50投稿
  - Pro (¥3,980): 月200投稿
  - Business (¥6,980): 月500投稿

実装内容:
  - サブスクリプション管理
  - 使用量制限・監視
  - 決済履歴
  - プラン変更
```

#### **FR-007: 通知システム**
```yaml
要件ID: FR-007
分類: Must
概要: メール通知機能

通知内容:
  - 投稿成功・失敗
  - 制限到達警告
  - トークン期限切れ
  - 重要なお知らせ

技術仕様:
  - SendGrid連携
  - テンプレート管理
  - 配信制御
  - 配信状況追跡
```

### **除外機能 (意図的非実装)**

```yaml
除外理由: MVP集中・運用負荷削減

除外機能:
  - ランダム投稿: 複雑性増加
  - プロキシ管理: 運用負荷大
  - チーム機能: ターゲット外
  - カレンダー表示: UI複雑化
  - 多言語対応: 日本特化戦略
  - 詳細分析: 外部ツール活用
  - カスタムブランディング: 差別化不要
  - ホワイトラベル: B2B2C非対応
```

---

## 🏗️ **技術仕様**

### **アーキテクチャ概要**

#### **システム設計原則**
- **Serverless First**: 運用負荷最小化
- **Firebase Native**: エコシステム活用
- **API First**: フロントエンド分離
- **Security by Design**: 多層防御
- **Monitoring First**: 可観測性重視

#### **技術スタック**

**フロントエンド:**
```yaml
メイン技術:
  - Vue.js 3 (Composition API)
  - TypeScript 5.x
  - Vuetify 3.x (Material Design)
  - Vite (高速ビルド)

状態管理:
  - Pinia Store
  - Firebase SDK

ルーティング:
  - Vue Router 4.x

品質保証:
  - ESLint + Prettier
  - Vitest (Unit Testing)
  - Playwright (E2E Testing)
```

**バックエンド:**
```yaml
サーバーレス:
  - Cloud Functions (Gen 2)
  - Cloud Scheduler
  - Cloud Storage

データベース:
  - Firestore (NoSQL)
  - Firebase Auth

外部API:
  - Instagram Graph API v18.0
  - Stripe API
  - SendGrid API

監視・ログ:
  - Cloud Monitoring
  - Cloud Logging
  - Error Reporting
```

#### **データベース設計**

**Firestore コレクション構造:**
```yaml
/users/{uid}
  - profile: ユーザープロフィール
  - settings: アプリ設定
  - subscription: サブスクリプション情報

/igAccounts/{igId}
  - userId: 所有者ID
  - accessToken: アクセストークン
  - profile: Instagramプロフィール
  - lastSync: 最終同期日時

/schedules/{scheduleId}
  - userId: 作成者ID
  - igAccountId: 投稿先アカウント
  - content: 投稿コンテンツ
  - scheduledAt: 投稿予定日時
  - status: 実行状態
  - recurrence: 繰り返し設定

/posts/{postId}
  - userId: 作成者ID
  - imageUrl: 画像URL
  - caption: キャプション
  - hashtags: ハッシュタグ
  - createdAt: 作成日時

/plans/{planId}
  - name: プラン名
  - price: 月額料金
  - limits: 使用制限
  - features: 利用可能機能
```

#### **セキュリティ設計**

**認証・認可:**
```yaml
認証方式:
  - Firebase Auth (OAuth 2.0)
  - JWT Token (30分有効期限)
  - Refresh Token (自動更新)

アクセス制御:
  - ユーザーベース認可
  - Firestore Security Rules
  - API レート制限

データ保護:
  - 暗号化: AES-256 (保存時)
  - TLS 1.3 (通信時)
  - PII データマスキング
```

**脆弱性対策:**
```yaml
OWASP Top 10対応:
  - SQLインジェクション: Firestore (NoSQL)
  - XSS: CSP ヘッダー
  - CSRF: SameSite Cookie
  - 認証不備: Firebase Auth

定期監査:
  - 四半期セキュリティスキャン
  - 依存関係脆弱性チェック
  - ペネトレーションテスト (年1回)
```

#### **パフォーマンス要件**

```yaml
応答時間:
  - ページロード: 3秒以内
  - API応答: 500ms以内
  - 画像表示: 1秒以内

スループット:
  - 同時ユーザー: 100名
  - API リクエスト: 1000req/分
  - 投稿処理: 50投稿/分

可用性:
  - サービス稼働率: 99.9%
  - 計画停止: 月1回未満
  - 障害復旧: 30分以内
```

---

## 📋 **開発・運用体制**

### **開発フロー**

#### **環境構成**
```yaml
開発環境:
  - プロジェクト: omniy-dev
  - Firebase Emulator Suite
  - ローカル開発サーバー

ステージング環境:
  - プロジェクト: omniy-staging
  - 本番同等構成
  - E2Eテスト実行

本番環境:
  - プロジェクト: omniy-prod
  - 高可用性構成
  - 監視・アラート
```

#### **CI/CD パイプライン**
```yaml
品質ゲート:
  1. コード品質: ESLint, TypeScript
  2. セキュリティ: npm audit, Snyk
  3. テスト: Unit, Integration, E2E
  4. パフォーマンス: Lighthouse CI

デプロイフロー:
  - develop → staging → main
  - 自動デプロイ (CI/CD)
  - Blue-Green デプロイ
  - ロールバック機能
```

### **監視・運用**

#### **監視項目**
```yaml
システム監視:
  - サービス稼働率
  - API応答時間
  - エラー発生率
  - リソース使用率

ビジネス監視:
  - ユーザー数・売上
  - 投稿成功率
  - 機能利用状況
  - サポート問い合わせ
```

#### **アラート設定**
```yaml
クリティカル:
  - サービス停止 (即座)
  - API エラー率 >5% (5分)
  - 決済システム障害 (即座)

警告:
  - 応答時間 >2秒 (15分)
  - ストレージ使用率 >80% (30分)
  - 投稿失敗率 >10% (15分)
```

---

## 📅 **リリース計画**

### **Phase 1: MVP リリース (完了)**
- 基本機能実装完了
- セキュリティ対策
- パフォーマンス最適化

### **Phase 2: リリース準備 (進行中 80%)**
- GitHub Secrets設定
- 本番環境構築
- E2Eテスト完了
- ドキュメント整備

### **Phase 3: ソフトローンチ (予定)**
- ベータユーザー募集
- フィードバック収集
- 細かな調整・改善

### **Phase 4: 正式リリース (予定)**
- マーケティング開始
- 顧客サポート体制
- KPI監視・改善

---

## 🔗 **関連ドキュメント**

### **開発関連**
- `functions/docs/pricing.md` - 価格設定詳細
- `tools/docs/firestore_schema.md` - DB設計詳細
- `tools/docs/deployment-guide.md` - デプロイ手順

### **運用関連**
- `tools/docs/USER_GUIDE.md` - ユーザーマニュアル
- `tools/docs/OPERATIONS.md` - 運用手順
- `tools/docs/MONITORING_SETUP.md` - 監視設定

### **品質保証**
- `E2E_TESTING_GUIDE.md` - E2Eテスト
- `tools/docs/QA_STRATEGY.md` - QA戦略
- `tools/docs/SECURITY_SCAN.md` - セキュリティ

---

**📝 更新履歴**
- 2025-01-09: 統合仕様書作成、分散ドキュメント集約
- 2025-01-27: 要件定義・技術仕様統合
- 進捗状況リアルタイム反映

> **💡 注意**: この文書は `OMNIY_README.md`, `REQUIREMENTS.md`, `TECHNICAL_SPECIFICATIONS.md` を統合したマスタードキュメントです。今後はこの文書を更新してください。