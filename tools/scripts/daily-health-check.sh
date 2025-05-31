#!/bin/bash

# 毎日の健康チェックスクリプト
# 使用方法: ./tools/scripts/daily-health-check.sh

echo "🏥 Omniy Daily Health Check - $(date)"
echo "=================================="

# Firebase プロジェクト設定確認
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json が見つかりません"
    exit 1
fi

PROJECT_ID=$(grep -o '"projectId": "[^"]*' firebase.json | cut -d'"' -f4)
echo "📋 プロジェクト: $PROJECT_ID"

# 1. Hosting の状態確認
echo ""
echo "🌐 Hosting 状態確認..."
HOSTING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$PROJECT_ID.web.app")
if [ "$HOSTING_STATUS" = "200" ]; then
    echo "✅ サイトは正常に動作中"
else
    echo "❌ サイトにアクセスできません (HTTP: $HOSTING_STATUS)"
fi

# 2. Functions の健康状態確認（簡易版）
echo ""
echo "⚡ Functions 状態確認..."
echo "📝 Firebase Console で詳細確認が必要："
echo "   https://console.firebase.google.com/project/$PROJECT_ID/functions"

# 3. 基本的なファイル構造確認
echo ""
echo "📁 ファイル構造確認..."
REQUIRED_FILES=(
    "frontend/package.json"
    "functions/package.json"
    "firestore.rules"
    "firestore.indexes.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file が見つかりません"
    fi
done

# 4. 依存関係の脆弱性チェック
echo ""
echo "🔒 セキュリティチェック..."
echo "📝 フロントエンド:"
cd frontend
npm audit --audit-level moderate 2>/dev/null | grep -E "(found|vulnerabilities)" || echo "✅ 問題なし"

echo "📝 バックエンド:"
cd ../functions
npm audit --audit-level moderate 2>/dev/null | grep -E "(found|vulnerabilities)" || echo "✅ 問題なし"

cd ..

# 5. 今日の TODO リマインダー
echo ""
echo "📝 今日のタスクリマインダー:"
echo "  1. Firebase Console でエラーログ確認"
echo "  2. ユーザーサポートメール確認"
echo "  3. アプリの基本動作テスト"
echo ""
echo "🔗 便利リンク:"
echo "  Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo "  アプリ: https://$PROJECT_ID.web.app"
echo ""
echo "✅ ヘルスチェック完了!"