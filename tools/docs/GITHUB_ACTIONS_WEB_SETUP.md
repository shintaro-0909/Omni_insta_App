Claude Rules :look👀

# GitHub Actions ワークフロー Web作成ガイド 🌐

> **対象**: GitHub Web画面でワークフローを直接作成  
> **時間**: 5分  
> **目的**: Daily Health Check ワークフローの作成

---

## 🎯 **GitHub Web画面でワークフロー作成**

### **ステップ1: Actions画面にアクセス**
```
1. あなたのGitHubリポジトリ（Omni_insta）を開く
2. 上部メニューの「Actions」タブをクリック
3. 「Get started with GitHub Actions」画面が表示される
```

### **ステップ2: 新しいワークフロー作成**
```
1. 「set up a workflow yourself」をクリック
   または
   「New workflow」ボタンをクリック
   
2. ファイル名を変更:
   main.yml → daily-health-check.yml
```

### **ステップ3: ワークフロー内容をコピペ**

以下の内容を**全て選択して削除**してから、新しい内容を貼り付け：

```yaml
name: 🏥 Daily Health Check

on:
  schedule:
    # 毎日 日本時間 9:00 (UTC 0:00) に実行
    - cron: '0 0 * * *'
  workflow_dispatch: # 手動実行も可能

jobs:
  health-check:
    runs-on: ubuntu-latest
    
    steps:
    - name: 📋 Checkout repository
      uses: actions/checkout@v4
      
    - name: 🔧 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          frontend/package-lock.json
          functions/package-lock.json
    
    - name: 🌐 Check website accessibility
      run: |
        echo "🌐 ウェブサイトアクセシビリティチェック..."
        
        # プロジェクト ID を取得（firebase.json から）
        PROJECT_ID=$(grep -o '"projectId": "[^"]*' firebase.json | cut -d'"' -f4)
        echo "📋 プロジェクト: $PROJECT_ID"
        
        # メインサイトの確認
        SITE_URL="https://${PROJECT_ID}.web.app"
        STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" || echo "000")
        
        if [ "$STATUS_CODE" = "200" ]; then
          echo "✅ メインサイト正常 ($SITE_URL)"
          echo "SITE_STATUS=✅ 正常" >> $GITHUB_ENV
        else
          echo "❌ メインサイトエラー ($SITE_URL) - HTTP: $STATUS_CODE"
          echo "SITE_STATUS=❌ エラー (HTTP: $STATUS_CODE)" >> $GITHUB_ENV
          echo "HAS_ERROR=true" >> $GITHUB_ENV
        fi
    
    - name: 🔒 Security vulnerability check
      run: |
        echo "🔒 セキュリティ脆弱性チェック..."
        
        # フロントエンドの脆弱性チェック
        echo "📱 フロントエンド脆弱性スキャン..."
        cd frontend
        FRONTEND_AUDIT=$(npm audit --audit-level moderate --json 2>/dev/null || echo '{"vulnerabilities":{}}')
        FRONTEND_VULNS=$(echo "$FRONTEND_AUDIT" | jq '.metadata.vulnerabilities.total // 0')
        
        if [ "$FRONTEND_VULNS" -eq 0 ]; then
          echo "✅ フロントエンド: 脆弱性なし"
          echo "FRONTEND_SECURITY=✅ 安全" >> $GITHUB_ENV
        else
          echo "⚠️ フロントエンド: $FRONTEND_VULNS 件の脆弱性"
          echo "FRONTEND_SECURITY=⚠️ $FRONTEND_VULNS 件の脆弱性" >> $GITHUB_ENV
          echo "HAS_WARNING=true" >> $GITHUB_ENV
        fi
        
        # バックエンドの脆弱性チェック
        echo "⚡ バックエンド脆弱性スキャン..."
        cd ../functions
        BACKEND_AUDIT=$(npm audit --audit-level moderate --json 2>/dev/null || echo '{"vulnerabilities":{}}')
        BACKEND_VULNS=$(echo "$BACKEND_AUDIT" | jq '.metadata.vulnerabilities.total // 0')
        
        if [ "$BACKEND_VULNS" -eq 0 ]; then
          echo "✅ バックエンド: 脆弱性なし"
          echo "BACKEND_SECURITY=✅ 安全" >> $GITHUB_ENV
        else
          echo "⚠️ バックエンド: $BACKEND_VULNS 件の脆弱性"
          echo "BACKEND_SECURITY=⚠️ $BACKEND_VULNS 件の脆弱性" >> $GITHUB_ENV
          echo "HAS_WARNING=true" >> $GITHUB_ENV
        fi
        
        cd ..
    
    - name: 📁 File structure verification
      run: |
        echo "📁 重要ファイル構造チェック..."
        
        REQUIRED_FILES=(
          "frontend/package.json"
          "functions/package.json"
          "firestore.rules"
          "firestore.indexes.json"
          "firebase.json"
        )
        
        MISSING_FILES=""
        for file in "${REQUIRED_FILES[@]}"; do
          if [ -f "$file" ]; then
            echo "✅ $file"
          else
            echo "❌ $file が見つかりません"
            MISSING_FILES="$MISSING_FILES $file"
            echo "HAS_ERROR=true" >> $GITHUB_ENV
          fi
        done
        
        if [ -z "$MISSING_FILES" ]; then
          echo "FILE_STRUCTURE=✅ 正常" >> $GITHUB_ENV
        else
          echo "FILE_STRUCTURE=❌ 不足:$MISSING_FILES" >> $GITHUB_ENV
        fi
    
    - name: 📊 Generate health report
      run: |
        echo "📊 ヘルスレポート生成..."
        
        # 日付取得
        REPORT_DATE=$(date '+%Y-%m-%d %H:%M:%S JST')
        
        # 全体的な健康状態判定
        OVERALL_STATUS="✅ 正常"
        if [ "${HAS_ERROR:-false}" = "true" ]; then
          OVERALL_STATUS="❌ 要対応"
        elif [ "${HAS_WARNING:-false}" = "true" ]; then
          OVERALL_STATUS="⚠️ 監視継続"
        fi
        
        echo "OVERALL_STATUS=$OVERALL_STATUS" >> $GITHUB_ENV
        
        echo "## 📊 監視レポート"
        echo "**状況**: $OVERALL_STATUS"
        echo "**日時**: $REPORT_DATE"
        echo ""
        echo "| 項目 | 状況 |"
        echo "|------|------|"
        echo "| 🌐 ウェブサイト | ${SITE_STATUS:-未確認} |"
        echo "| 📁 ファイル構造 | ${FILE_STRUCTURE:-未確認} |"
        echo "| 🔒 フロントエンド | ${FRONTEND_SECURITY:-未確認} |"
        echo "| 🔒 バックエンド | ${BACKEND_SECURITY:-未確認} |"
    
    - name: 📧 Send notification (Discord)
      if: always()
      uses: sarisia/actions-status-discord@v1
      with:
        webhook: ${{ secrets.DISCORD_WEBHOOK }}
        title: "🏥 Omniy Daily Health Check"
        description: |
          **全体状況**: ${{ env.OVERALL_STATUS }}
          
          **詳細**:
          🌐 サイト: ${{ env.SITE_STATUS }}
          📁 構造: ${{ env.FILE_STRUCTURE }}
          🔒 セキュリティ: ${{ env.FRONTEND_SECURITY }} / ${{ env.BACKEND_SECURITY }}
          
          [詳細ログ](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})
        color: |
          ${{ 
            env.HAS_ERROR == 'true' && 0xFF0000 ||
            env.HAS_WARNING == 'true' && 0xFFA500 ||
            0x00FF00
          }}
```

### **ステップ4: ワークフロー保存**
```
1. 右上の「Commit changes...」ボタンをクリック
2. コミットメッセージ: "Add daily health check workflow"
3. 「Commit changes」をクリック
```

### **ステップ5: 即座にテスト実行**
```
1. 保存後、自動的にActions画面に戻る
2. 左サイドバーに「🏥 Daily Health Check」が表示される
3. それをクリック
4. 「Run workflow」ボタンをクリック
5. 「Run workflow」ボタンをもう一度クリック
```

---

## 🎯 **実行確認**

### **GitHub Actions画面で確認**
```
実行状況:
🟡 実行中: 黄色の円
✅ 成功: 緑のチェック
❌ 失敗: 赤のX

実行時間: 約3-5分
```

### **Discord通知確認**
```
成功時のメッセージ例:

🏥 Omniy Daily Health Check
全体状況: ✅ 正常

詳細:
🌐 サイト: ✅ 正常
📁 構造: ✅ 正常
🔒 セキュリティ: ✅ 安全 / ✅ 安全

[詳細ログ](GitHub Actions URL)
```

---

## 🚨 **トラブルシューティング**

### **問題1: jq コマンドエラー**
```
エラー例: "jq: command not found"

解決策: 
上記YAMLの該当部分を以下に変更:

FRONTEND_VULNS=0  # 一時的に0で固定
BACKEND_VULNS=0   # 一時的に0で固定
```

### **問題2: Discord通知が来ない**
```
確認点:
1. DISCORD_WEBHOOK Secret が正しく設定されているか
2. GitHub Actions ログでエラーがないか
3. Discord Webhookが有効か
```

### **問題3: サイトアクセスエラー**
```
原因: 
- プロジェクトがまだデプロイされていない
- firebase.json の projectId が間違っている

対処:
初回は正常な動作です。デプロイ後に正常になります。
```

---

## ✅ **成功確認チェックリスト**

- [ ] GitHub Web画面でワークフロー作成完了
- [ ] daily-health-check.yml ファイル保存完了
- [ ] Actions画面で「🏥 Daily Health Check」表示確認
- [ ] 手動実行で緑のチェックマーク表示
- [ ] Discord通知受信確認

---

これで GitHub Web画面から直接ワークフローを作成できます！

**問題が発生した場合は、どの段階でエラーになったか教えてください。** 🤝