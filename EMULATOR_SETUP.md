# 🔧 エミュレーター環境での Facebook Login テスト

## 問題の解決方法

エミュレーター環境では実際のFacebook OAuthは動作しないため、**モック認証システム**を実装しました。

## ✅ 実装済み機能

### 1. **モック認証サービス**
- `frontend/src/services/mockAuth.ts` - エミュレーター専用の認証機能
- `frontend/src/components/common/EmulatorBanner.vue` - 開発環境表示

### 2. **自動判定システム**
```typescript
// エミュレーター環境を自動判定
const isEmulatorMode = import.meta.env.VITE_ENABLE_FIREBASE_EMULATOR === 'true';

// 本番環境 → 実際のFacebook OAuth
// エミュレーター → モック認証
```

### 3. **モックデータ**
```typescript
// 2つのサンプルInstagramアカウント
{
  id: 'mock_ig_account_1',
  username: 'demo_business',
  followers_count: 15420,
  // ... 他のプロパティ
}
```

## 🚀 テスト手順

### 1. エミュレーター起動
```bash
# ターミナル1: Firebase Emulator
firebase emulators:start

# ターミナル2: フロントエンド開発サーバー
cd frontend && npm run dev
```

### 2. テスト実行
1. ブラウザで `http://localhost:3001` にアクセス
2. 画面上部に「🔧 開発環境（エミュレーター）」バナーが表示される
3. ログイン → アカウント管理 → 「新しいアカウントを追加」
4. 「Facebook でログイン」をクリック
5. **モック認証が実行される**（実際のFacebookポップアップは表示されない）

### 3. 期待される動作
- ✅ エラーなしでアカウント追加画面が表示
- ✅ デモ用Instagramアカウント（1-2個）が選択可能
- ✅ アカウント追加後、一覧に表示される
- ✅ トークン更新機能も正常動作

## 📱 モック認証の特徴

### **自動生成データ**
- ユニークなアクセストークン（`mock_long_lived_token_X_timestamp`）
- リアルなフォロワー数・投稿数
- 60日間有効期限

### **通知システム**
- 画面右上に処理状況を表示
- 「Facebook認証をシミュレート中...」
- 「トークン更新をシミュレート中...」

### **デバッグ情報**
```javascript
console.log('🔄 Mock: Exchanging short-lived token for long-lived token...');
console.log('🔍 Mock: Validating Instagram token...');
```

## 🔄 本番環境への切り替え

### 環境変数を変更
```bash
# .env.local
VITE_ENABLE_FIREBASE_EMULATOR=false

# Facebook App情報を設定
VITE_FACEBOOK_APP_ID=your_real_facebook_app_id
```

### Firebase Functions設定
```bash
# functions/.runtimeconfig.json
{
  "facebook": {
    "app_id": "your_facebook_app_id",
    "app_secret": "your_facebook_app_secret"
  }
}
```

## 🐛 トラブルシューティング

### よくある問題
1. **エミュレーターバナーが表示されない**
   - `.env.local`の`VITE_ENABLE_FIREBASE_EMULATOR=true`を確認

2. **認証エラーが発生する**
   - Firebase Emulatorが正常に起動しているか確認
   - コンソールでエラーログを確認

3. **アカウントが表示されない**
   - モック関数が正常に呼ばれているか開発者ツールで確認

### ログ確認
```bash
# Firebase Emulator UI
http://localhost:4000

# 開発者ツール Console
F12 → Console → モックメッセージを確認
```

これで、エミュレーター環境でも**Facebook Login機能を完全にテスト**できます！