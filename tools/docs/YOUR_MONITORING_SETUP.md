Claude Rules :look👀

# あなた専用の監視システムセットアップガイド 🎯

> **Discord Webhook**: ✅ 準備完了  
> **GitHub Actions**: ✅ 無料で利用可能  
> **セットアップ時間**: 10分で完了

---

## 🚀 **今すぐ実行する手順**

### **ステップ1: GitHub Secrets設定（5分）**

1. **GitHubリポジトリにアクセス**
   ```
   あなたのリポジトリ > Settings > Secrets and variables > Actions
   ```

2. **「New repository secret」をクリックして以下を追加**

#### **DISCORD_WEBHOOK（必須）**
```
Name: DISCORD_WEBHOOK
Value: https://discord.com/api/webhooks/1378270718139043850/mRZTnLI9slIw4UfvWgVLMGO8EWq42i4DlspaejULv8gWSD8ALALuw0pGODdb-KhuMg51
```

#### **EMAIL設定（オプション - スキップ可能）**
```
Name: EMAIL_USERNAME
Value: your-email@gmail.com

Name: EMAIL_PASSWORD  
Value: Gmailアプリパスワード

Name: ALERT_EMAIL
Value: 通知を受け取るメールアドレス
```

### **ステップ2: 初回テスト実行（3分）**

1. **GitHub Actions でテスト実行**
   ```
   GitHub > Actions > "Daily Health Check" > "Run workflow" > "Run workflow"
   ```

2. **Discord で通知確認**
   - 3-5分後にDiscordチャンネルに通知が届く
   - 初回は多少エラーがあっても正常です

### **ステップ3: Firebase Functions デプロイ（2分）**

```bash
# リアルタイム監視システムを有効化
cd functions
npm run build
firebase deploy --only functions
```

---

## 📱 **期待される結果**

### **Discord通知サンプル**
```
🏥 Omniy Daily Health Check
全体状況: ✅ 正常

詳細:
🌐 サイト: ✅ 正常
📁 構造: ✅ 正常
🔒 セキュリティ: ✅ 安全 / ✅ 安全

✅ ヘルスチェック完了!
```

### **自動実行スケジュール**
```
毎日朝9時: GitHub Actions が自動実行
毎5分間隔: Firebase Functions が監視（デプロイ後）
```

---

## 🎯 **GitHub Actions 料金詳細**

### **無料枠**
```yaml
プライベートリポジトリ:
  月間実行時間: 2,000分
  同時実行数: 20ジョブ
  ストレージ: 500MB

パブリックリポジトリ:
  完全無料・無制限 🎉
```

### **あなたの使用量予測**
```yaml
毎日の監視:
  実行時間: 約3分/日
  月間合計: 90分/月
  無料枠比較: 4.5% (全然余裕！)

手動実行（週1回程度）:
  実行時間: 約3分/回
  月間合計: 12分/月

総使用量: 約102分/月 (無料枠の5%)
```

### **追加費用が発生する場合**
```yaml
無料枠超過時の料金:
  $0.008/分 (約1円/分)
  
例: 3,000分使用した場合
  超過分: 1,000分
  追加料金: $8 (約1,200円)
  
現実的には: 無料枠で十分 ✅
```

---

## 🔧 **トラブルシューティング**

### **Discord通知が来ない場合**
1. **Webhook URLの確認**
   - GitHub Secrets の DISCORD_WEBHOOK が正しく設定されているか
   - URLにスペースや改行が入っていないか

2. **Discord チャンネル確認**
   - Webhookを作成したチャンネルを確認
   - ボットの権限が適切か確認

3. **GitHub Actions ログ確認**
   - Actions タブで実行ログを確認
   - エラーメッセージがないかチェック

### **GitHub Actions が実行されない場合**
1. **ワークフローファイル確認**
   - `.github/workflows/daily-health-check.yml` が存在するか
   - ファイル形式が正しいか（YAMLエラーチェック）

2. **リポジトリ設定確認**
   - Actions が有効になっているか
   - Secrets が正しく設定されているか

---

## 📊 **成功指標**

### **セットアップ完了の確認**
- [ ] Discord にテスト通知が届いた
- [ ] GitHub Actions が緑色で成功
- [ ] Firebase Functions がデプロイ完了
- [ ] 翌朝9時に自動通知が届く

### **日常運用での成功指標**
- [ ] 毎朝9時にDiscord通知が自動で届く
- [ ] 手動でのヘルスチェックが不要になった
- [ ] 問題発生時に即座に気づける
- [ ] 月間GitHub Actions使用量が200分以下

---

## 🎉 **セットアップ完了後の効果**

### **時間節約**
```
セットアップ前:
😰 毎日5分のチェック × 365日 = 30時間/年

セットアップ後:  
😊 月1回5分の確認 × 12ヶ月 = 1時間/年

💡 年間29時間の節約！
```

### **安心感**
```
セットアップ前:
😟 「サイト大丈夫かな...？」と常に心配
😟 週末も気になって確認

セットアップ後:
😊 完全自動で問題があれば即座に通知
😊 安心して週末を過ごせる
```

### **プロフェッショナル感**
```
🎯 24時間監視システム稼働
🎯 問題の早期発見・対応
🎯 データに基づく運用判断
🎯 ユーザーへの信頼性向上
```

---

## 📞 **サポート**

**困った時の連絡先:**
- 📖 詳細ガイド: `tools/docs/AUTOMATED_MONITORING_SETUP.md`
- 🔧 セットアップ再実行: `./tools/scripts/setup-monitoring.sh`
- 🐛 GitHub Actions ログ: リポジトリ > Actions タブ

**成功のコツ:**
1. 最初はテスト実行で動作確認
2. Discord通知が来ることを確認
3. 翌朝の自動通知を待つ
4. 1週間運用して安定性確認

---

あなたのOmniyが**完全自動監視システム**で守られます！ 🛡️✨