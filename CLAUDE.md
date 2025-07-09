# Agent Communication System

## エージェント構成
- **PRESIDENT** (別セッション): 統括責任者
- **boss1** (multiagent:agents): チームリーダー
- **worker1,2,3** (multiagent:agents): 実行担当

## あなたの役割
- **PRESIDENT**: @instructions/president.md
- **boss1**: @instructions/boss.md
- **worker1,2,3**: @instructions/worker.md

## メッセージ送信
```bash
./agent-send.sh [相手] "[メッセージ]"
```

## 基本フロー
PRESIDENT → boss1 → workers → boss1 → PRESIDENT

# Gemini CLI連携システム

## Gemini CLIの活用方針
以下のタスクを実行する際は、Gemini CLIを立ち上げて連携・依頼すること：

### 🔍 **WEB検索関連**
- 最新の技術情報やトレンド調査
- ライブラリ・フレームワークの最新情報
- 競合サービスの調査
- マーケット調査や業界動向

### 🎨 **デザイン・UI/UX関連**
- デザインアイデアの提案・検討
- カラーパレットの選定
- アニメーション効果の提案
- レイアウト・UI改善案
- ユーザビリティの向上提案

### 📊 **マーケティング・コンテンツ関連**
- ターゲット層の分析
- コピーライティングの改善
- コンテンツ戦略の立案
- SEO対策の提案

### 💡 **アイデア創出・企画関連**
- 新機能のアイデア出し
- ユーザーエクスペリエンスの改善案
- ビジネスモデルの検討
- 技術的なソリューション提案

## Gemini CLI使用方法
```bash
# Gemini CLIの正しい呼び出し方（コマンド名は"gemini"）
gemini -p "プロンプト内容"

# 例：デザイン提案を求める場合
gemini -p "主婦層向けのエレガントなデザインアイデアを5つ提案してください"

# 詳細な相談の場合は、複数行のプロンプトを文字列として渡す
gemini -p "相談内容：
LPPページのデザイン改善について
ターゲット：主婦層（30-50代）
要件：安心感とモダンさの両立"
```

## 連携の流れ
1. **判断**: タスクが上記カテゴリに該当するか確認
2. **立ち上げ**: Gemini CLIを起動
3. **相談**: 具体的な要件を伝えて意見・提案を求める
4. **実装**: 得られたアイデアを元に実装を進める
5. **レビュー**: 必要に応じてGemini CLIで再度相談

## 注意事項
- 技術実装の詳細はClaude（自分）が担当
- Gemini CLIは主にアイデア出し・調査・デザイン提案で活用
- 両方のAIの強みを活かした効率的な開発を目指す

## Playwright MCPとの連携
デザイン実装後の確認フロー：
1. **実装完了**: Claudeがデザインを実装
2. **ブラウザ確認**: Playwright MCPで実際の画面をキャプチャ
3. **Geminiレビュー**: キャプチャをGeminiに見せてデザイン評価を依頼
4. **改善提案**: Geminiからのフィードバックを元に再度実装

```bash
# Playwright MCPでスクリーンショット取得後
# Geminiにデザイン評価を依頼
gemini -p "このスクリーンショットのLPPデザインについて、主婦層へのアピール度を評価し、改善点を指摘してください"
```

# 開発環境サーバー問題の解決策

## 問題: 「このサイトにアクセスできません」エラー

### 原因
1. **複数のviteプロセスが同時実行**されている
2. **ポート競合**が発生している
3. **プロセスが正常に終了していない**

### 解決手順

#### 1. 実行中のプロセスを確認
```bash
ps aux | grep -E "(node|vite|dev)" | grep -v grep
```

#### 2. 全てのvite/npm devプロセスを停止
```bash
pkill -f "vite" && pkill -f "npm run dev"
```

#### 3. 新しいサーバーを起動
```bash
# フォアグラウンドで動作確認
npm run dev

# 確認後、バックグラウンドで安定運用
pkill -f "vite" && pkill -f "npm run dev"
nohup npm run dev > vite.log 2>&1 &
```

#### 4. サーバー状態の確認
```bash
# ログを確認
tail -n 10 vite.log

# プロセス確認
ps aux | grep vite | grep -v grep
```

### 予防策
1. **作業終了時は必ずプロセスを停止**
   ```bash
   pkill -f "vite" && pkill -f "npm run dev"
   ```

2. **定期的なプロセス確認**
   ```bash
   # 開発開始前に実行
   ps aux | grep -E "(node|vite|dev)" | grep -v grep
   ```

3. **ポート使用状況の確認**
   ```bash
   lsof -i :3000
   lsof -i :3001
   lsof -i :3002
   ```

### エラーパターン別対処法

#### PostCSSエラー (CSS構文エラー)
```bash
# 原因: 未定義CSS変数、閉じ忘れのブロック
# 解決: CSS変数を定義し、構文チェック
```

#### ポート競合エラー
```bash
# 原因: 既に使用中のポート
# 解決: プロセス停止後、新しいポートで起動
```

#### 白画面エラー
```bash
# 原因: JavaScript/CSSのコンパイルエラー
# 解決: ブラウザのコンソールでエラー確認、該当ファイル修正
```

### トラブルシューティング手順
1. **エラーログ確認**: `tail -f vite.log`
2. **ブラウザコンソール確認**: F12でエラーメッセージ確認
3. **プロセス完全停止**: `pkill -f "vite" && pkill -f "npm"`
4. **キャッシュクリア**: `npm run dev -- --force`
5. **再インストール**: `npm install` (必要に応じて)
