# Facebook認証設定ガイド

## 🎯 概要
このドキュメントは、OmniyプロジェクトにFacebook Login（Instagram Graph API連携）を実装するための設定手順をまとめたものです。

## 📋 前提条件
- Metaビジネスアカウント
- Firebaseプロジェクト
- Instagram ビジネス/クリエイターアカウント

## 🔧 設定手順

### 1. Facebook Developerアプリの作成

#### 1.1 Meta for Developersにアクセス
1. [Meta for Developers](https://developers.facebook.com/)にアクセス
2. 「マイアプリ」→「アプリを作成」をクリック

#### 1.2 アプリタイプの選択
- 「ビジネス」を選択
- アプリ名: `Omniy Instagram Scheduler`
- アプリの目的: 「ビジネス統合」
- ビジネスアカウントを選択または作成

#### 1.3 プロダクトの追加
1. ダッシュボードで「プロダクトを追加」
2. 以下を追加:
   - Facebook Login
   - Instagram Graph API
   - Instagram Basic Display API（必要に応じて）

### 2. Facebook Login設定

#### 2.1 OAuth設定
1. Facebook Login → 設定
2. 以下を設定:
```
クライアントOAuthログイン: 有効
ウェブOAuthログイン: 有効
強制的にHTTPSを使用: 有効
埋め込みブラウザーOAuthリダイレクト: 有効
```

#### 2.2 有効なOAuthリダイレクトURI
開発環境:
```
http://localhost:5173/auth/callback
http://localhost:5000/auth/callback
http://127.0.0.1:5173/auth/callback
```

本番環境:
```
https://your-domain.com/auth/callback
https://your-project.web.app/auth/callback
https://your-project.firebaseapp.com/auth/callback
```

### 3. アプリの権限設定

#### 3.1 必要な権限（Permissions）
```
- email
- public_profile
- instagram_basic
- instagram_content_publish
- pages_show_list
- pages_read_engagement
- business_management
```

#### 3.2 Instagram Graph APIスコープ
```
- instagram_basic: 基本的なプロフィール情報
- instagram_content_publish: コンテンツの投稿
- instagram_manage_comments: コメント管理
- instagram_manage_insights: インサイトデータ取得
- pages_show_list: 管理するFacebookページ一覧
- pages_read_engagement: エンゲージメントデータ
```

### 4. アプリレビューとアクセスレベル

#### 4.1 開発モード
- テストユーザーの追加: 役割 → テストユーザー
- 最大10名まで追加可能
- アプリレビュー不要

#### 4.2 本番モード（アプリレビュー必要）
提出書類:
- プライバシーポリシーURL
- 利用規約URL
- アプリアイコン（1024x1024）
- スクリーンキャスト動画
- 使用権限の説明

### 5. Firebase側の設定

#### 5.1 Firebase ConsoleでFacebook認証を有効化
1. Firebase Console → Authentication → Sign-in method
2. Facebookを有効化
3. アプリIDとアプリシークレットを入力
4. OAuthリダイレクトURIをコピー

#### 5.2 環境変数設定
`.env.local`:
```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_VERSION=v18.0
```

`.env.production`:
```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_VERSION=v18.0
```

### 6. アクセストークンの管理

#### 6.1 短期トークン → 長期トークン
```javascript
// 60日間有効なトークンに交換
const exchangeUrl = `https://graph.facebook.com/${version}/oauth/access_token`;
const params = {
  grant_type: 'fb_exchange_token',
  client_id: appId,
  client_secret: appSecret,
  fb_exchange_token: shortLivedToken
};
```

#### 6.2 トークンの更新
- 有効期限前に自動更新を実装
- Cloud Functionsでスケジュール実行
- 更新失敗時はユーザーに再認証を促す

### 7. セキュリティ考慮事項

#### 7.1 アプリシークレットの保護
- クライアントサイドに露出させない
- Cloud Functionsで管理
- Secret Managerの使用を検討

#### 7.2 トークンの暗号化
- Firestoreに保存する際は暗号化
- 転送時はHTTPS必須
- CSRFトークンの実装

### 8. テスト手順

#### 8.1 開発環境でのテスト
1. テストユーザーでログイン
2. 権限承認フローの確認
3. トークン取得・保存の確認
4. Instagram API呼び出しテスト

#### 8.2 統合テスト項目
- [ ] Facebookログイン成功
- [ ] 権限承認完了
- [ ] アクセストークン取得
- [ ] Instagram ユーザー情報取得
- [ ] 投稿機能テスト
- [ ] トークン更新機能

### 9. トラブルシューティング

#### よくあるエラー
1. **Invalid OAuth redirect URI**
   - Firebase ConsoleのURIとFacebook設定が一致していることを確認

2. **Insufficient permissions**
   - 必要な権限がすべて承認されているか確認
   - アプリレビューステータスを確認

3. **Token expired**
   - トークンの有効期限を確認
   - 自動更新機能の実装確認

### 10. 参考リンク
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Firebase Facebook Authentication](https://firebase.google.com/docs/auth/web/facebook-login)
- [Meta App Review](https://developers.facebook.com/docs/app-review)