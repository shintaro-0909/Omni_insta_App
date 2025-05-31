Claude Rules :look👀

# 📱 初心者向け運用クイックスタート

> **これさえ読めば今日から運用開始！**  
> **所要時間**: 読了10分、初回設定30分

---

## 🎯 **今日からやること（たった3つ）**

### 1. **毎朝5分** - 健康チェック
```bash
# ターミナルで実行（コピペするだけ）
cd /path/to/your/Omni_insta
./tools/scripts/daily-health-check.sh
```

### 2. **週1回30分** - 基本テスト
```
日曜日の朝に以下をテスト:
✅ アプリにログインできる
✅ 投稿作成が動く
✅ 決済画面が表示される
```

### 3. **月1回1時間** - セキュリティ更新
```bash
# 月初に実行
./tools/scripts/monthly-maintenance.sh
```

---

## 🔗 **重要リンク（ブックマーク推奨）**

```
🎛️ Firebase Console（メイン管理画面）
https://console.firebase.google.com

📱 あなたのアプリ
https://YOUR_PROJECT_ID.web.app

💳 Stripe Dashboard（決済管理）
https://dashboard.stripe.com

📊 パフォーマンス監視
https://console.firebase.google.com/project/YOUR_PROJECT_ID/analytics
```

---

## 🚨 **緊急時はここを確認**

### **サイトが表示されない**
1. https://YOUR_PROJECT_ID.web.app にアクセス
2. エラーが出たら → Firebase Console > Hosting
3. 「再デプロイ」ボタンをクリック
4. 5分待つ

### **投稿が失敗する**
1. Firebase Console > Functions
2. エラーの数を確認
3. 10個以上エラーがあったら要調査

### **決済がうまくいかない**
1. Stripe Dashboard で決済状況確認
2. テストモードになってないか確認

---

## 📋 **週次チェックリスト（コピペ用）**

```
□ Firebase Analytics でユーザー数確認
□ エラー率が1%以下か確認  
□ 今月の料金が予算内か確認
□ アプリの基本動作テスト完了
□ サポートメール返信完了
```

---

## 💡 **よくある質問と答え**

**Q: どのくらいのエラー数なら正常？**
A: 1日0-2件なら正常、10件以上は要調査

**Q: 月の料金はどのくらい？**
A: 開始時は$10-30、成長期は$50-100が目安

**Q: バックアップは自動？**
A: はい、Firebaseが自動でバックアップします

**Q: 技術的な問題が解決できない時は？**
A: まずGoogle検索、次にStack Overflow で質問

---

## 🎉 **運用成功のコツ**

1. **毎日5分の習慣化**
   - 朝のコーヒーを飲みながらヘルスチェック

2. **問題は早期発見**
   - 小さな問題のうちに対処

3. **ユーザーの声を聞く**
   - サポートメールは24時間以内に返信

4. **記録を残す**
   - 月次レポートで成長を実感

---

この通りに進めれば、初心者でも安心してOmniyを運用できます！ 🚀

**困った時は**: `BEGINNER_OPERATIONS_GUIDE.md` の詳細版をご確認ください。