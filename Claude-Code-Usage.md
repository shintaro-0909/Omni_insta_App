# Claude Code 使用ガイド - Omniyプロジェクト

> **安全にClaude Codeを`--dangerously-skip-permissions`で使用する方法**

## 🚀 **クイックスタート**

### **自動スタートアップ（推奨）**
```bash
./scripts/start-claude.sh
```
このスクリプトが環境を自動検出し、適切な方法でClaude Codeを起動します。

### **VS Code Devcontainer使用**
```bash
# 1. VS Codeでプロジェクトを開く
code .

# 2. Command Palette (Cmd+Shift+P) で実行
# "Remote-Containers: Reopen in Container"

# 3. コンテナ内でClaude Code起動
claude --dangerously-skip-permissions
```

## 🛡️ **セキュリティ機能**

### **Devcontainer Security**
- **ファイアウォールルール**: 必要なドメインのみアクセス許可
- **ネットワーク分離**: ホストシステムから隔離
- **権限制限**: rootアクセス制御

### **環境変数設定**
```bash
# コンテナ内で自動設定
CLAUDE_SKIP_PERMISSIONS=true
CLAUDE_SANDBOX_MODE=true
```

## 📋 **利用可能なコマンド**

### **プロジェクト操作**
```bash
# フロントエンド開発
cd frontend
npm run dev              # 開発サーバー起動
npm run build            # プロダクションビルド
npm run type-check       # TypeScriptチェック

# バックエンド開発  
cd functions
npm run serve            # Functions emulator
npm run build            # TypeScriptコンパイル
npm run test             # Jest テスト

# Firebase
firebase emulators:start # 全エミュレータ起動
firebase deploy --only functions
```

### **コード品質**
```bash
npm run lint             # ESLint実行
npm run format           # Prettier実行
npm run type-check       # TypeScript検証
```

## 🔧 **Claude Code使用例**

### **新機能実装**
```
新しいInstagram投稿分析機能を実装してください：

1. 投稿のエンゲージメント率を計算
2. 分析結果をダッシュボードに表示
3. Chart.jsを使用したグラフ描画
4. 既存のコンポーネントパターンに従う
5. TypeScript型定義を含める
```

### **バグ修正**
```
ScheduleFormDialog.vueでユーザーがスケジュール作成時にエラーが発生します：

エラー: "Cannot read property 'selectedDate' of undefined"
場所: frontend/src/components/ScheduleFormDialog.vue:45

再現手順:
1. 新規スケジュール作成をクリック
2. 日付選択前に保存ボタンクリック
3. エラー発生

期待動作: バリデーションエラーメッセージ表示
```

### **コードレビュー**
```
frontend/src/stores/posts.ts のコードをレビューしてください：

重点項目:
- TypeScript型安全性
- エラーハンドリング
- パフォーマンス最適化
- セキュリティ考慮事項
- Vue.js/Piniaベストプラクティス準拠
```

### **リファクタリング**
```
functions/src/api/instagram.ts を改善してください：

改善点:
- 関数の責任を単一化
- エラーハンドリング強化
- レート制限対応改善
- ログ出力の最適化
- テスタビリティ向上
```

## 📊 **プロジェクト構造理解**

### **主要ファイル**
```
frontend/src/
├── components/          # Vue.js コンポーネント
│   ├── ScheduleFormDialog.vue
│   ├── PostViewDialog.vue
│   └── UsageDashboard.vue
├── stores/             # Pinia状態管理
│   ├── auth.ts
│   ├── schedules.ts
│   └── posts.ts
├── views/              # ページコンポーネント
│   ├── SchedulesView.vue
│   └── DashboardView.vue
└── services/           # API・サービス層
    └── firebase.ts

functions/src/
├── api/                # HTTP エンドポイント
│   ├── schedules.ts
│   ├── instagram.ts
│   └── stripe.ts
├── schedulers/         # バックグラウンド処理
│   └── postExecutor.ts
└── utils/              # ユーティリティ
    ├── planLimits.ts
    └── scheduleUtils.ts
```

### **アーキテクチャパターン**
- **フロントエンド**: Vue.js 3 + Composition API + Pinia
- **バックエンド**: Firebase Cloud Functions + Firestore
- **認証**: Firebase Auth + カスタムクレーム
- **決済**: Stripe Checkout + Webhook
- **スケジューリング**: Cloud Scheduler + 投稿実行ロジック

## 🎯 **開発ワークフロー**

### **新機能開発**
1. **ブランチ作成**: `git checkout -b feature/T{number}-{description}`
2. **Claude相談**: 実装アプローチを相談
3. **コード実装**: Claude Codeで効率的に実装
4. **品質チェック**: `npm run lint && npm run type-check`
5. **テスト**: 機能テスト実行
6. **コミット**: Conventional Commits形式
7. **PR作成**: `@claude` でレビュー依頼

### **バグ修正**
1. **問題特定**: Claude Codeで原因分析
2. **修正実装**: 適切な修正コード実装
3. **テスト**: 修正内容の検証
4. **回帰テスト**: 既存機能への影響確認

### **コード改善**
1. **現状分析**: Claude Codeでコード品質評価
2. **改善提案**: リファクタリング案の検討
3. **段階的実装**: 安全な改善の実施
4. **品質確認**: メトリクス向上の確認

## 🚨 **注意事項**

### **セキュリティ**
- **機密情報**: API キーやトークンをコードに含めない
- **入力検証**: ユーザー入力は必ず検証
- **権限チェック**: 適切な認証・認可を実装

### **パフォーマンス**
- **データベース**: 効率的なクエリ設計
- **画像処理**: 適切なサイズとフォーマット
- **キャッシュ**: 必要に応じてキャッシュ戦略

### **保守性**
- **コメント**: 複雑なロジックには説明追加
- **テスト**: 重要な機能にはテストを追加
- **ドキュメント**: 仕様変更時は文書も更新

## 📚 **関連ドキュメント**

- [CLAUDE.md](CLAUDE.md) - プロジェクト全体ガイドライン
- [docs/dev_tasks_userstories.md](docs/dev_tasks_userstories.md) - 開発タスク一覧
- [docs/system_architecture_mermaid.md](docs/system_architecture_mermaid.md) - システム構成
- [docs/firestore_schema.md](docs/firestore_schema.md) - データベース設計

---

**🎉 これで安全にClaude Codeを活用して、効率的な開発ができます！**