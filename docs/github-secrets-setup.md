# GitHub Secrets 設定ガイド

CI/CDパイプラインを動作させるために、以下のGitHub Secretsを設定する必要があります。

## 設定手順

1. GitHubリポジトリの **Settings** → **Secrets and variables** → **Actions** に移動
2. **New repository secret** をクリック
3. 以下の各シークレットを追加

## 必須シークレット一覧

### Firebase関連

#### `FIREBASE_TOKEN`
Firebase CLIトークン（デプロイ用）
```bash
# ローカルで実行してトークンを取得
firebase login:ci
```

#### 開発環境用
- `DEV_FIREBASE_PROJECT_ID`: 開発環境のFirebaseプロジェクトID
- `DEV_FIREBASE_API_KEY`: 開発環境のFirebase API Key
- `DEV_FIREBASE_AUTH_DOMAIN`: 開発環境のAuth Domain
- `DEV_FIREBASE_STORAGE_BUCKET`: 開発環境のStorage Bucket
- `DEV_FIREBASE_MESSAGING_SENDER_ID`: 開発環境のMessaging Sender ID
- `DEV_FIREBASE_APP_ID`: 開発環境のApp ID

#### 本番環境用
- `PROD_FIREBASE_PROJECT_ID`: 本番環境のFirebaseプロジェクトID
- `PROD_FIREBASE_API_KEY`: 本番環境のFirebase API Key
- `PROD_FIREBASE_AUTH_DOMAIN`: 本番環境のAuth Domain
- `PROD_FIREBASE_STORAGE_BUCKET`: 本番環境のStorage Bucket
- `PROD_FIREBASE_MESSAGING_SENDER_ID`: 本番環境のMessaging Sender ID
- `PROD_FIREBASE_APP_ID`: 本番環境のApp ID

### その他
- `GITHUB_TOKEN`: 自動的に提供される（設定不要）

## Firebase設定値の取得方法

1. Firebase Console → プロジェクト設定 → 全般タブ
2. 「アプリ」セクションでWebアプリを選択
3. 「Firebase SDK snippet」→「構成」を選択
4. 表示された設定値をコピー

```javascript
// 例：設定値の形式
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 環境の分離

### 推奨構成
- **開発環境**: `omniy-dev` プロジェクト
- **本番環境**: `omniy-prod` プロジェクト

### ブランチ戦略
- `develop` ブランチ → 開発環境に自動デプロイ
- `main` ブランチ → 本番環境に自動デプロイ

## セキュリティ注意事項

1. **シークレットの管理**
   - 絶対にコードにハードコードしない
   - ローカル開発では `.env` ファイルを使用
   - `.env` ファイルは `.gitignore` に追加済み

2. **アクセス権限**
   - Firebase プロジェクトへの適切な権限設定
   - 最小権限の原則に従う

3. **定期的な更新**
   - トークンの有効期限を確認
   - 定期的にローテーション

## トラブルシューティング

### よくあるエラー

#### `Error: Invalid project id`
- `FIREBASE_PROJECT_ID` が正しく設定されているか確認
- プロジェクトIDにタイポがないか確認

#### `Error: Permission denied`
- `FIREBASE_TOKEN` が有効か確認
- Firebase プロジェクトへの権限があるか確認

#### `Error: Build failed`
- 各環境の設定値が正しいか確認
- 依存関係が最新か確認

## 設定確認

設定が完了したら、以下の手順で動作確認：

1. `develop` ブランチにプッシュ
2. GitHub Actions の実行を確認
3. 開発環境へのデプロイを確認
4. `main` ブランチにマージ
5. 本番環境へのデプロイを確認 