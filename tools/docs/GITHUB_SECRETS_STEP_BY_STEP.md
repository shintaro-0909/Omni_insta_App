Claude Rules :look👀

# GitHub Secrets 設定方法 - 完全ガイド 🔐

> **初心者向け**: スクリーンショット付きで迷わず設定！  
> **所要時間**: 3分  
> **設定内容**: DISCORD_WEBHOOK

---

## 🎯 **設定するもの**

```
Secret名: DISCORD_WEBHOOK
Secret値: https://discord.com/api/webhooks/1378270718139043850/mRZTnLI9slIw4UfvWgVLMGO8EWq42i4DlspaejULv8gWSD8ALALuw0pGODdb-KhuMg51
```

---

## 📝 **ステップ1: GitHubリポジトリにアクセス**

### 1-1. ブラウザでGitHubを開く
```
1. https://github.com にアクセス
2. ログインしていない場合は「Sign in」
3. 右上のプロフィールアイコンをクリック
4. 「Your repositories」を選択
```

### 1-2. Omniyリポジトリを選択
```
リポジトリ一覧から:
- "Omni_insta" または類似の名前
- あなたのInstagram予約投稿アプリのリポジトリ
をクリック
```

---

## ⚙️ **ステップ2: Settings画面にアクセス**

### 2-1. Settingsタブをクリック
```
リポジトリのメイン画面で:

[Code] [Issues] [Pull requests] [Actions] [Projects] [Security] [Insights] [Settings]
                                                                                  ↑
                                                                            ここをクリック
```

### 2-2. 画面の確認
```
Settings画面が開いたら、左サイドバーに以下が表示されます:

📂 General
📂 Access
📂 Code and automation
   └── Actions
📂 Security
   └── Secrets and variables  ← この項目を探す
```

---

## 🔐 **ステップ3: Secrets設定画面にアクセス**

### 3-1. 左サイドバーで操作
```
1. 左サイドバーの「Security」セクションを探す
2. 「Secrets and variables」をクリック
3. サブメニューが開いたら「Actions」をクリック

Security
├── Secrets and variables
│   ├── Actions        ← ここをクリック
│   ├── Codespaces
│   └── Dependabot
```

### 3-2. 画面の確認
```
「Actions secrets and variables」画面が表示されます

タブが2つあります:
[Secrets] [Variables]
   ↑
Secretsタブが選択されていることを確認
```

---

## ➕ **ステップ4: 新しいSecretの作成**

### 4-1. 「New repository secret」ボタンをクリック
```
画面右上にある緑のボタン:
[New repository secret]
をクリック
```

### 4-2. Secret情報を入力

#### **Name欄**
```
Name: DISCORD_WEBHOOK

注意点:
- 大文字小文字を正確に入力
- スペースは不要
- アンダースコア（_）を忘れずに
```

#### **Secret欄**
```
Secret: https://discord.com/api/webhooks/1378270718139043850/mRZTnLI9slIw4UfvWgVLMGO8EWq42i4DlspaejULv8gWSD8ALALuw0pGODdb-KhuMg51

注意点:
- URL全体をコピペ（改行なし）
- 前後にスペースを入れない
- https:// から最後まで全部
```

### 4-3. 保存
```
[Add secret] ボタンをクリック
```

---

## ✅ **ステップ5: 設定完了の確認**

### 5-1. Secret一覧での確認
```
「Repository secrets」一覧に以下が表示されます:

DISCORD_WEBHOOK
└── Updated now
└── [Update] [Delete]
```

### 5-2. 値は表示されない（正常）
```
⚠️ 正常な動作です
Secret の値は設定後は見えません（セキュリティのため）
表示されるのは名前と更新日時のみ
```

---

## 🧪 **ステップ6: 動作テスト**

### 6-1. GitHub Actionsでテスト実行
```
1. リポジトリ画面で「Actions」タブをクリック
2. 左サイドバーで「Daily Health Check」を選択
3. 右側の「Run workflow」ボタンをクリック
4. 「Run workflow」をもう一度クリック（確認ダイアログ）
```

### 6-2. 実行状況の確認
```
ワークフロー実行が開始されます:

🟡 実行中: 黄色い円アイコン
✅ 成功: 緑のチェックマーク
❌ 失敗: 赤のXマーク
```

### 6-3. Discord通知の確認
```
3-5分後にDiscordチャンネルで以下のような通知を確認:

🏥 Omniy Daily Health Check
全体状況: ✅ 正常 (または ⚠️ 監視継続)

詳細:
🌐 サイト: ✅ 正常
📁 構造: ✅ 正常
🔒 セキュリティ: ✅ 安全 / ✅ 安全
```

---

## 🚨 **トラブルシューティング**

### 問題1: 「Settings」タブが見つからない
```
原因: リポジトリの権限不足
解決策:
1. リポジトリのオーナーであることを確認
2. 他の人のリポジトリの場合は権限を依頼
3. 自分のリポジトリでない場合はForkして実行
```

### 問題2: 「Secrets and variables」が見つからない
```
原因: 画面表示の問題
解決策:
1. ブラウザを更新（F5キー）
2. 左サイドバーを下にスクロール
3. 「Security」セクションを展開
```

### 問題3: Discord通知が来ない
```
原因候補:
1. WebhookURLの入力ミス
2. DiscordチャンネルでWebhookが無効化

解決策:
1. Secret値を削除して再入力
2. DiscordでWebhookを再作成
3. GitHub Actions ログでエラー確認
```

### 問題4: GitHub Actions が失敗する
```
確認方法:
1. Actions タブ > 失敗したワークフロー をクリック
2. 赤いXの項目をクリック
3. ログでエラーメッセージを確認

よくあるエラー:
- "secret DISCORD_WEBHOOK not found" 
  → Secret名の入力ミス
- "Invalid webhook URL"
  → WebhookURLの入力ミス
```

---

## 📋 **チェックリスト**

設定完了確認用:

- [ ] GitHubリポジトリにアクセス完了
- [ ] Settings > Secrets and variables > Actions にアクセス完了
- [ ] DISCORD_WEBHOOK Secret作成完了
- [ ] Secret一覧でDISCORD_WEBHOOK表示確認
- [ ] GitHub Actions手動実行完了
- [ ] Discord通知受信確認

---

## 🎉 **設定完了！**

すべてのチェックが完了したら:

```
🎯 毎日朝9時に自動監視開始
📱 Discord に健康状態レポート自動配信
🚨 問題発生時は即座にアラート

おめでとうございます！
完全自動監視システムが稼働中です 🎉
```

---

## 🆘 **それでも困った時は**

### スクリーンショット確認
```
どの画面で困っているか教えてください:
1. GitHubリポジトリ画面
2. Settings画面
3. Secrets設定画面
4. Secret作成画面
```

### 代替案
```
GitHub Secrets設定が困難な場合:
1. Discord通知なしで監視のみ実行
2. メール通知に変更
3. 手動実行のみで運用
```

**どの段階で困っているか、具体的に教えていただければさらに詳しくサポートします！** 🤝