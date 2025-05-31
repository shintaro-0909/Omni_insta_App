Claude Rules :look👀

# 🎯 Omniy 開発者マスターガイド

> **これさえ見れば全てわかる！完全攻略ガイド**  
> **最終更新**: 2025-05-31  
> **対象**: 1人開発者向け完全ガイド

---

## 📍 **今すぐ確認すべき重要ファイル TOP5**

### **1️⃣ このファイル**
```
📄 DEVELOPER_MASTER_GUIDE.md  ← 今見ているファイル
└── 全ての開発・運用情報の中央管理
```

### **2️⃣ 日常運用ファイル**
```
📄 tools/docs/QUICK_START_OPERATIONS.md
└── 毎日やることの簡単まとめ

📄 tools/docs/BEGINNER_OPERATIONS_GUIDE.md  
└── 詳細な運用手順
```

### **3️⃣ 緊急時対応ファイル**
```
📄 tools/docs/YOUR_MONITORING_SETUP.md
└── 自動監視システムの使い方

📄 tools/docs/GITHUB_SECRETS_STEP_BY_STEP.md
└── GitHub設定でトラブった時
```

### **4️⃣ プロジェクト設定ファイル**
```
📄 CLAUDE.md
└── Claudeへの指示・開発ルール

📄 firebase.json + firestore.rules
└── Firebase設定・セキュリティ
```

### **5️⃣ コード構成ファイル**
```
📄 frontend/package.json + functions/package.json
└── 依存関係・スクリプト定義
```

---

## 🚀 **開発タスク別 対応ファイル一覧**

### **📱 新機能開発時**
```yaml
確認順序:
1. CLAUDE.md → 開発ルール確認
2. frontend/src/ → コンポーネント作成
3. functions/src/api/ → API作成
4. firestore.rules → セキュリティルール追加
5. このファイル → 完了をチェック

必要な知識:
- Vue.js 3 + TypeScript
- Firebase Functions
- Firestore セキュリティルール
```

### **🐛 バグ修正時**
```yaml
確認順序:
1. GitHub Actions → エラーログ確認
2. Discord通知 → 自動監視アラート確認  
3. frontend/src/ または functions/src/ → コード修正
4. テスト実行 → npm run test

使用ツール:
- GitHub Actions (自動テスト)
- Discord (アラート通知)
- Firebase Console (ログ確認)
```

### **🔧 設定変更時**
```yaml
Firebase設定:
- firebase.json → プロジェクト設定
- firestore.rules → データベースセキュリティ
- firestore.indexes.json → クエリ最適化

GitHub設定:
- .github/workflows/ → 自動化設定
- GitHub Secrets → API KEY管理

環境設定:
- .env.local → ローカル開発環境
- package.json → 依存関係
```

### **📊 運用監視時**
```yaml
毎日確認:
- Discord通知 → 自動監視結果
- GitHub Actions → 実行履歴

週次確認:
- Firebase Console → 使用量・コスト
- GitHub → セキュリティアラート

月次確認:
- tools/scripts/monthly-maintenance.sh → 自動実行
- 依存関係更新 → npm audit
```

---

## 📂 **ディレクトリ構造 完全マップ**

### **🎯 重要度別ディレクトリ**

#### **👑 最重要（毎日触る）**
```
frontend/src/
├── components/     ← UIコンポーネント（メイン開発場所）
├── views/         ← ページコンポーネント（メイン開発場所）
├── stores/        ← 状態管理（データの流れ）
└── composables/   ← ロジック再利用（便利機能）

functions/src/
├── api/           ← APIエンドポイント（メイン開発場所）
├── schedulers/    ← バックグラウンド処理
└── utils/         ← 共通処理

設定ファイル:
├── firebase.json        ← Firebase設定
├── firestore.rules      ← セキュリティルール  
└── CLAUDE.md           ← 開発ルール
```

#### **⚙️ 設定・管理（週1回程度）**
```
.github/workflows/     ← 自動化設定
tools/
├── docs/             ← 運用ドキュメント
└── scripts/          ← 便利スクリプト

package.json関連:
├── frontend/package.json    ← フロント依存関係
├── functions/package.json   ← バックエンド依存関係
└── package.json            ← プロジェクト全体
```

#### **📚 参考・履歴（必要時のみ）**
```
tools/docs/archive/    ← 古いドキュメント
frontend/coverage/     ← テストカバレッジ結果
frontend/cypress/      ← E2Eテスト
functions/coverage/    ← バックエンドテスト結果
```

---

## 🎯 **日常開発ワークフロー**

### **朝の確認（5分）**
```bash
# 1. 自動監視確認
Discord通知をチェック → 問題なければ OK

# 2. 開発環境起動
cd frontend && npm run dev     # フロントエンド
firebase emulators:start       # バックエンド
```

### **機能開発時（30分-2時間）**
```bash
# 1. ブランチ作成
git checkout -b feature/新機能名

# 2. 開発
# frontend/src/ でコンポーネント作成
# functions/src/api/ でAPI作成

# 3. テスト
npm run test                   # フロントエンド
cd functions && npm run test   # バックエンド

# 4. コミット
git add .
git commit -m "feat: 新機能追加"
git push origin feature/新機能名
```

### **夜の終了（2分）**
```bash
# 1. 作業保存
git add . && git commit -m "wip: 作業中"

# 2. 環境停止
Ctrl+C で開発サーバー停止

# 3. 明日の確認
Discord で翌朝の自動監視通知を待つ
```

---

## 🚨 **トラブル時の対応フロー**

### **レベル1: 軽微な問題**
```yaml
例: コンパイルエラー、テスト失敗
対応:
1. エラーメッセージをGoogle検索
2. frontend/ または functions/ で該当ファイル修正
3. npm run test で確認
4. git commit で保存

所要時間: 5-30分
```

### **レベル2: システム問題**
```yaml
例: デプロイ失敗、データベースエラー
対応:
1. Firebase Console でログ確認
2. GitHub Actions でエラー詳細確認
3. tools/docs/BEGINNER_OPERATIONS_GUIDE.md を参照
4. 設定ファイル修正

所要時間: 30分-2時間
```

### **レベル3: 緊急事態**
```yaml
例: サイトダウン、データ消失
対応:
1. Discord通知で状況確認
2. Firebase Console で緊急対応
3. tools/docs/YOUR_MONITORING_SETUP.md 参照
4. 必要に応じてバックアップから復旧

所要時間: 1-4時間
```

---

## 🎓 **スキルアップ優先順位**

### **最優先（今すぐ必要）**
```
1. Vue.js基礎 → コンポーネント作成・修正
2. Firebase基礎 → データ保存・取得
3. Git基礎 → バージョン管理・協力開発
4. TypeScript基礎 → エラー減少・保守性向上
```

### **重要（3ヶ月以内）**
```
5. Firebase Functions → API作成・サーバー処理
6. Firestore → データベース設計・クエリ最適化  
7. GitHub Actions → 自動化・CI/CD
8. セキュリティ → 認証・認可・データ保護
```

### **あると良い（6ヶ月以内）**
```
9. PWA → オフライン対応・アプリ化
10. パフォーマンス最適化 → 速度向上・UX改善
11. テスト → 品質保証・リファクタリング
12. デザインシステム → UI統一・効率化
```

---

## 📋 **定期メンテナンス チェックリスト**

### **毎日（自動 + 5分確認）**
```
□ Discord自動監視通知確認
□ 開発環境正常起動確認  
□ 作業内容のgit commit
```

### **毎週日曜（30分）**
```
□ tools/docs/WEEKLY_MAINTENANCE_CHECKLIST.md 実行
□ 依存関係セキュリティ確認（npm audit）
□ Firebase使用量・コスト確認
□ 次週の開発計画策定
```

### **毎月1日（1時間）**
```
□ tools/scripts/monthly-maintenance.sh 実行
□ バックアップ状況確認
□ パフォーマンス指標レビュー
□ 新機能・改善点の整理
```

---

## 🛠️ **効率化ツール & ショートカット**

### **開発効率化**
```bash
# よく使うコマンドエイリアス
alias fdev="cd frontend && npm run dev"
alias ftest="cd frontend && npm run test"
alias fbuild="cd frontend && npm run build"
alias femulator="firebase emulators:start"

# 一括起動スクリプト
./tools/scripts/dev-start.sh
```

### **VS Codeおすすめ拡張機能**
```
必須:
- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)  
- Firebase
- GitLens

便利:
- Thunder Client (API テスト)
- Error Lens (エラー表示強化)
- Auto Rename Tag
- Bracket Pair Colorizer
```

### **ブラウザブックマーク**
```
Firebase Console: https://console.firebase.google.com
GitHub Actions: https://github.com/あなたのユーザー名/Omni_insta_App/actions
Omniy App: https://あなたのプロジェクトID.web.app
Discord監視チャンネル: https://discord.com/channels/...
```

---

## 📚 **学習リソース優先順位**

### **即戦力（今週中）**
```
1. Vue.js公式ドキュメント → コンポーネント基礎
2. Firebase公式ドキュメント → Firestore・Functions基礎
3. このプロジェクトのコード読み → 実装パターン理解
```

### **基盤強化（今月中）**
```
4. TypeScript Handbook → 型システム理解
5. Git Pro Book → バージョン管理マスター
6. Web開発セキュリティ → 安全な実装
```

### **上級者向け（3ヶ月以内）**
```
7. Vue.js設計パターン → 大規模開発対応
8. Firebase最適化 → パフォーマンス・コスト最適化
9. CI/CD実践 → 自動化マスター
```

---

## 🎯 **成功指標 & マイルストーン**

### **1ヶ月目標**
```
□ 基本的な機能追加・修正が1人でできる
□ Discord監視システムの意味が理解できる
□ Firebase Consoleで基本的な操作ができる
□ Git でのバージョン管理に慣れる
```

### **3ヶ月目標**
```
□ 新機能を設計から実装まで1人で完成できる
□ セキュリティを意識した開発ができる
□ パフォーマンス問題を特定・解決できる
□ 他の開発者とのコードレビューができる
```

### **6ヶ月目標**
```
□ アプリ全体のアーキテクチャを理解・改善できる
□ 技術的な意思決定を適切に行える
□ 新人開発者にメンターできる
□ 別プロジェクトでも同様の開発ができる
```

---

## 🆘 **困った時の相談先**

### **技術的問題**
```
1. このファイルの該当セクション確認
2. tools/docs/ の関連ドキュメント確認
3. Google検索: "vue.js [問題]" 等
4. Stack Overflow で質問検索
5. ChatGPT・Claude等のAI活用
```

### **プロジェクト固有問題**
```
1. CLAUDE.md で開発ルール確認
2. GitHub Issues で既知の問題確認
3. Discord監視通知で自動検出問題確認
4. Firebase Console でシステム状況確認
```

### **学習・キャリア相談**
```
1. 開発者コミュニティ参加
2. 技術書・オンライン学習活用
3. 実際のプロジェクト経験積み重ね
4. メンター・先輩開発者との交流
```

---

## 🏆 **このガイドの使い方**

### **初回（30分で読了）**
```
1. 全体を流し読み → プロジェクト全体像把握
2. 重要ファイル確認 → ブックマーク
3. 日常ワークフロー理解 → 明日から実践
```

### **日常使い（3分で確認）**
```
1. 該当するタスクのセクション確認
2. 必要なファイル・コマンド特定
3. チェックリストで完了確認
```

### **定期見直し（月1回15分）**
```
1. 新しく学んだことの追記
2. 使わなくなった項目の削除
3. 効率化できる部分の改善
```

---

## 📌 **最後に：開発者として成長するために**

### **心構え**
```
💪 完璧を求めすぎず、動くものを作る
🧠 エラーは学習の機会として歓迎する
🤝 コミュニティを活用して孤独を避ける
⏰ 継続的な学習習慣を身につける
```

### **実践的アドバイス**
```
🎯 まずは小さな機能から確実に
📝 学んだことは必ずメモ・ドキュメント化
🔄 定期的にコードを見直し・リファクタリング
🎉 成功体験を積み重ねて自信をつける
```

---

**このガイドがあなたの開発ライフを支えます！** 🚀

*困った時はいつでもここに戻ってきてください。あなたなら必ずできます！*