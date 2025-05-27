# 進捗管理自動化ガイド

## 🎯 目的
タスク完了時の進捗表更新を確実に実行し、プロジェクトの透明性と継続性を保つ。

## 🔧 実装済み自動化

### 1. Cursor Rules (.cursor/rules/progress-management.mdc)
- **効果**: AIアシスタントが自動的に進捗管理ルールを適用
- **適用範囲**: 全ての開発セッション
- **内容**: 
  - タスク完了時の必須手順
  - 進捗表更新テンプレート
  - チェックリスト

### 2. README.md 進捗セクション
- **効果**: プロジェクト概要で進捗状況を即座に確認可能
- **更新頻度**: 主要マイルストーン完了時

### 3. Git Hook（推奨実装）
```bash
# .git/hooks/pre-commit
#!/bin/sh
echo "🔍 進捗表更新チェック..."

# 進捗表が更新されているかチェック
if git diff --cached --name-only | grep -q "docs/dev_tasks_userstories.md"; then
    echo "✅ 進捗表が更新されています"
else
    echo "⚠️  進捗表の更新を確認してください"
    echo "   ファイル: docs/dev_tasks_userstories.md"
    read -p "続行しますか？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
```

## 📋 手動チェックリスト

### タスク開始時
- [ ] 前回の進捗表を確認
- [ ] 今回のタスク範囲を明確化
- [ ] 必要に応じてブランチ作成

### タスク完了時（必須）
- [ ] `docs/dev_tasks_userstories.md` を開く
- [ ] 該当タスクの `[ ]` を `[x]` に変更
- [ ] 実装した具体的内容を記載
- [ ] 進捗率を再計算
- [ ] コミット前に整合性確認

### 部分完了時
- [ ] 完了した部分を `[x]` に変更
- [ ] 残り作業を詳細に記載
- [ ] 次回の開始点を明確化
- [ ] 注意事項・課題を記録

## 🚀 ベストプラクティス

### 1. 具体性を重視
```markdown
❌ 悪い例:
- [x] API実装

✅ 良い例:
- [x] Stripe決済API実装
  - [x] createCheckoutSession 関数 (functions/src/api/stripe.ts)
  - [x] Webhook処理 (functions/src/api/stripeWebhook.ts)
  - [x] フロントエンド統合 (frontend/src/stores/billing.ts)
```

### 2. ファイル名を明記
実装したファイル名を必ず記載し、次回作業者が迷わないようにする。

### 3. 課題・注意点の記録
```markdown
### 注意事項
- Stripe本番環境設定が必要
- 環境変数 STRIPE_SECRET_KEY の設定要
- Webhook URLの本番登録要
```

### 4. 次回作業の明確化
```markdown
### 次回作業
- [ ] T12: プラン制限チェック実装
  - [ ] 使用量監視ロジック
  - [ ] API制限適用
  - [ ] フロントエンド制限表示
```

## 🔄 継続的改善

### 月次レビュー
- 進捗管理の効果測定
- ルールの見直し・改善
- 自動化の拡張検討

### 課題と改善案
1. **Git Hook自動化**: コミット時の強制チェック
2. **CI/CD統合**: 進捗表の自動検証
3. **ダッシュボード化**: 進捗の可視化

この進捗管理システムにより、プロジェクトの透明性と継続性を確保する。 