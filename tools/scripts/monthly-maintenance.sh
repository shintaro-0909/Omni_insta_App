#!/bin/bash

# 月次メンテナンススクリプト
# 使用方法: ./tools/scripts/monthly-maintenance.sh

echo "🗓️ Omniy Monthly Maintenance - $(date)"
echo "======================================"

# プロジェクト設定確認
PROJECT_ID=$(grep -o '"projectId": "[^"]*' firebase.json | cut -d'"' -f4)
echo "📋 プロジェクト: $PROJECT_ID"

# 1. 依存関係のセキュリティアップデート
echo ""
echo "🔒 セキュリティアップデート実行中..."

# フロントエンド
echo "📱 フロントエンド依存関係チェック..."
cd frontend
echo "  -> セキュリティ監査実行中..."
npm audit --audit-level moderate
echo "  -> 自動修正実行中..."
npm audit fix --audit-level moderate

# バックエンド
echo "⚡ バックエンド依存関係チェック..."
cd ../functions
echo "  -> セキュリティ監査実行中..."
npm audit --audit-level moderate
echo "  -> 自動修正実行中..."
npm audit fix --audit-level moderate

cd ..

# 2. バックアップの確認とクリーンアップ
echo ""
echo "💾 バックアップ状況確認..."
echo "📝 手動確認が必要な項目:"
echo "  1. Firebase Console > Firestore Database > バックアップ"
echo "  2. 過去30日のバックアップが存在するか確認"
echo "  3. バックアップサイズが異常に大きくないか確認"

# 3. 不要ファイルのクリーンアップ
echo ""
echo "🧹 不要ファイルのクリーンアップ..."

# ビルドファイルのクリーンアップ
echo "  -> ビルドファイル削除中..."
rm -rf frontend/dist
rm -rf frontend/node_modules/.cache
rm -rf functions/lib
rm -rf functions/node_modules/.cache

# ログファイルのクリーンアップ
echo "  -> 古いログファイル削除中..."
find . -name "*.log" -mtime +30 -delete 2>/dev/null || true

# 4. パフォーマンス統計の生成
echo ""
echo "📊 月次統計レポート生成..."

# 現在の日付
CURRENT_DATE=$(date +%Y-%m-%d)
REPORT_FILE="tools/docs/monthly-report-$CURRENT_DATE.md"

cat > "$REPORT_FILE" << EOF
# 月次レポート - $CURRENT_DATE

## 📈 統計情報
> Firebase Console で以下の数値を確認して記入してください

### ユーザー指標
- 月間アクティブユーザー: _____ 人
- 新規登録ユーザー: _____ 人
- 離脱率: _____%
- 平均セッション時間: _____ 分

### 技術指標
- 総API呼び出し回数: _____ 回
- エラー率: _____%
- 平均レスポンス時間: _____ ms
- アップタイム: _____%

### コスト指標
- Firebase使用料: \$_____
- Stripe手数料: \$_____
- その他のコスト: \$_____
- 合計: \$_____

## 🎯 目標達成状況
- [ ] ユーザー増加目標: _____% (目標: 10%/月)
- [ ] エラー率目標: _____% (目標: 1%以下)
- [ ] コスト目標: \$_____ (予算: \$_____以下)

## 📝 今月の主な出来事
### 追加された機能
- 

### 修正されたバグ
- 

### ユーザーからのフィードバック
- 

## 🔮 来月の計画
### 実装予定
- [ ] 
- [ ] 

### 改善予定
- [ ] 
- [ ] 

## 📞 サポート統計
- 問い合わせ件数: _____ 件
- 平均解決時間: _____ 時間
- 満足度: _____/5

---
*レポート作成日: $CURRENT_DATE*
EOF

echo "📄 月次レポートテンプレートを作成しました: $REPORT_FILE"

# 5. 来月の準備
echo ""
echo "🎯 来月の準備..."
echo "📝 実行推奨項目:"
echo "  1. Firebase の請求書確認"
echo "  2. ユーザーフィードバックの整理"
echo "  3. 新機能開発計画の見直し"
echo "  4. セキュリティポリシーの確認"

# 6. 健康チェック
echo ""
echo "🏥 システム健康チェック..."
./tools/scripts/daily-health-check.sh

echo ""
echo "✅ 月次メンテナンス完了!"
echo "📋 次のアクション:"
echo "  1. $REPORT_FILE を完成させる"
echo "  2. Firebase Console で統計情報を確認"
echo "  3. 来月の目標を設定"
echo ""