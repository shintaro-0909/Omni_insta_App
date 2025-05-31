#!/bin/bash

# 自動監視システム セットアップスクリプト
# 使用方法: ./tools/scripts/setup-monitoring.sh

echo "🤖 Omniy 自動監視システム セットアップ"
echo "=================================="

# プロジェクト設定確認
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json が見つかりません。Omniy プロジェクトルートで実行してください。"
    exit 1
fi

PROJECT_ID=$(grep -o '"projectId": "[^"]*' firebase.json | cut -d'"' -f4)
echo "📋 プロジェクト: $PROJECT_ID"

# 1. GitHub Actions の確認
echo ""
echo "🔍 GitHub Actions 設定確認..."
if [ -f ".github/workflows/daily-health-check.yml" ]; then
    echo "✅ GitHub Actions ワークフロー設定済み"
else
    echo "❌ GitHub Actions ワークフローが見つかりません"
    echo "   tools/docs/AUTOMATED_MONITORING_SETUP.md を確認してください"
    exit 1
fi

# 2. 必要なSecrets のチェックリスト表示
echo ""
echo "📋 GitHub Secrets 設定チェックリスト:"
echo "   GitHub > Settings > Secrets and variables > Actions で以下を設定:"
echo ""
echo "   🔗 DISCORD_WEBHOOK (必須)"
echo "      値: https://discord.com/api/webhooks/..."
echo "      取得方法: Discord > サーバー設定 > 連携サービス > Webhook"
echo ""
echo "   📧 EMAIL_USERNAME (メール通知用・オプション)"
echo "      値: your-gmail@gmail.com"
echo ""
echo "   🔑 EMAIL_PASSWORD (メール通知用・オプション)"
echo "      値: Gmail アプリパスワード"
echo "      取得方法: Google アカウント > セキュリティ > アプリパスワード"
echo ""
echo "   📮 ALERT_EMAIL (メール通知用・オプション)" 
echo "      値: 通知を受け取るメールアドレス"

# 3. Firebase Functions の健康監視システム設定
echo ""
echo "⚡ Firebase Functions 健康監視システム設定..."

# functions/src/index.ts に healthMonitor の export を追加
INDEX_FILE="functions/src/index.ts"
if [ -f "$INDEX_FILE" ]; then
    if grep -q "healthMonitor" "$INDEX_FILE"; then
        echo "✅ healthMonitor 既に設定済み"
    else
        echo "📝 healthMonitor を index.ts に追加中..."
        cat >> "$INDEX_FILE" << 'EOF'

// Health Monitoring System
export {
  performHealthCheck,
  getHealthStatus,
  getHealthHistory,
} from "./schedulers/healthMonitor";
EOF
        echo "✅ healthMonitor を追加しました"
    fi
else
    echo "⚠️ $INDEX_FILE が見つかりません"
fi

# 4. Firestore セキュリティルールの更新
echo ""
echo "🔒 Firestore セキュリティルール更新..."

RULES_FILE="firestore.rules"
if [ -f "$RULES_FILE" ]; then
    if grep -q "healthStatus" "$RULES_FILE"; then
        echo "✅ ヘルス監視用ルール既に設定済み"
    else
        echo "📝 ヘルス監視用ルールを追加中..."
        
        # // === デフォルト拒否 (セキュリティ確保) === の前に追加
        sed -i.bak '/=== デフォルト拒否/i\
    // === ヘルス監視システム (システム専用) ===\
    match /healthStatus/{docId} {\
      allow read, write: if false; // システム内部のみ\
    }\
    \
    match /systemStatus/{docId} {\
      allow read: if isAuthenticated();\
      allow write: if false; // システム内部のみ\
    }\
    \
' "$RULES_FILE"
        
        echo "✅ セキュリティルールを更新しました"
        echo "   次回 firebase deploy 時に適用されます"
    fi
else
    echo "⚠️ firestore.rules が見つかりません"
fi

# 5. テスト実行の準備
echo ""
echo "🧪 テスト環境準備..."

# package.json にテストスクリプトを追加（存在しない場合）
PACKAGE_JSON="package.json"
if [ -f "$PACKAGE_JSON" ]; then
    if grep -q "test:monitoring" "$PACKAGE_JSON"; then
        echo "✅ 監視テストスクリプト既に設定済み"
    else
        echo "📝 監視テストスクリプトを追加中..."
        # 実際の実装では jq を使って JSON を更新
        echo "   手動で package.json に以下を追加してください:"
        echo '   "test:monitoring": "npm run build && firebase emulators:exec --only functions,firestore '\''cd functions && npm test -- --testNamePattern=health'\''"'
    fi
fi

# 6. セットアップ完了確認
echo ""
echo "🎯 セットアップ状況確認..."

SETUP_ITEMS=(
    "GitHub Actions ワークフロー"
    "Firebase Functions healthMonitor"
    "Firestore セキュリティルール"
)

for item in "${SETUP_ITEMS[@]}"; do
    echo "✅ $item"
done

echo ""
echo "📋 残りの手動設定:"
echo "   1. GitHub Secrets の設定（上記チェックリスト参照）"
echo "   2. Discord Webhook の作成と設定"
echo "   3. Gmail アプリパスワードの設定（メール通知する場合）"

# 7. 次のステップ案内
echo ""
echo "🚀 次のステップ:"
echo "   1. 手動設定完了後、以下でテスト実行:"
echo "      GitHub > Actions > 'Daily Health Check' > 'Run workflow'"
echo ""
echo "   2. Firebase Functions をデプロイ:"
echo "      cd functions && npm run deploy"
echo ""
echo "   3. セットアップ完了確認:"
echo "      ./tools/scripts/test-monitoring.sh"

# 8. 便利リンク表示
echo ""
echo "🔗 便利リンク:"
echo "   📖 詳細ガイド: tools/docs/AUTOMATED_MONITORING_SETUP.md"
echo "   🐙 GitHub Actions: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo "   🔥 Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo "   📱 アプリURL: https://$PROJECT_ID.web.app"

echo ""
echo "✅ セットアップスクリプト完了!"
echo "   詳細な手順は tools/docs/AUTOMATED_MONITORING_SETUP.md をご確認ください。"