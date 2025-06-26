Claude Rules :look👀

# 🎯 Omniy 開発者マスターガイド

> **これさえ見れば全てわかる！完全攻略ガイド**  
> **最終更新**: 2025-06-26
> **対象**: 1人開発者およびAIエージェント向け完全ガイド

---

## 📍 **重要ファイルと開発の起点 TOP5**

1.  **このファイル (`DEVELOPER_MASTER_GUIDE.md`)**: 全ての開発・運用情報の中央管理ハブ。
2.  **AI協業ガイドライン (`AI_COLLABORATION_GUIDE.md`)**: AIと開発を進める上での統一ルール。
3.  **仕様書 (`tools/docs/dev_tasks_userstories.md`)**: プロジェクトの機能要件と進捗管理。
4.  **Firebase設定 (`firebase.json`, `firestore.rules`)**: バックエンドの根幹をなす設定とセキュリティ。
5.  **依存関係 (`package.json` 各階層)**: プロジェクトで利用されるライブラリとスクリプトの定義。

---

## 🚀 **クイックスタート**

### 前提条件

- Node.js 18+
- npm 8+ or yarn 1.22+
- Firebase CLI (最新版)
- Git 2.30+
- VS Code (推奨)

### セットアップ

```bash
# 1. 依存関係のインストール
npm install
cd frontend && npm install
cd functions && npm install

# 2. 環境変数の設定
cp frontend/.env.local.example frontend/.env.local
cp functions/.env.local.example functions/.env.local
# NOTE: 各.env.localファイルに必要な設定を追記してください。

# 3. 開発環境の起動
./tools/scripts/dev-start.sh
```

### 開発サーバー
- **Frontend**: `http://localhost:5173`
- **Firebase Emulator UI**: `http://localhost:4000`
- **Functions API**: `http://localhost:5001`
- **Firestore Emulator**: `http://localhost:8080`

---

## 🐳 **Dockerでの開発**

Dockerを利用することで、環境差異なしに開発を進められます。

```bash
# フル開発環境の起動
docker-compose -f docker-compose.dev.yml up

# 特定サービスの起動
docker-compose -f docker-compose.dev.yml up frontend backend

# 本番環境のプレビュー
docker-compose -f docker-compose.dev.yml --profile preview up prod-preview
```

---

## 📂 **ディレクトリ構造**

```
omni-insta/
├── frontend/              # Vue.js 3 + TypeScript フロントエンド
├── functions/             # Firebase Cloud Functions (バックエンド)
├── tools/                 # 開発ツールとスクリプト
├── .github/               # CI/CDワークフローとテンプレート
└── ...
```
*（より詳細な構造は `PROJECT_STRUCTURE.md` を参照してください）*

---

## 🛠️ **開発ワークフローとコード品質**

### Gitブランチ戦略

- **命名規則:**
  - `feature/T123-add-new-feature`
  - `fix/T456-resolve-login-bug`
  - `docs/update-readme`

### コミット戦略: アトミックコミットの徹底

**一つのコミットは、一つの論理的な関心事に集中させてください。** これを「アトミックコミット」と呼びます。

- **良い例 (Good):**
  - `feat(ui): add login button` (UIコンポーネントの追加)
  - `feat(api): create login endpoint` (APIエンドポイントの作成)
  - `refactor(auth): improve token handling logic` (特定ロジックのリファクタリング)
  - `docs(readme): update setup instructions` (ドキュメントの更新)

- **悪い例 (Bad):**
  - `fix: various bug fixes` (複数の無関係な修正を一つのコミットにまとめる)
  - `feat: add login feature` (UI、API、ドキュメントの変更をすべて一つのコミットに含める)

**なぜアトミックコミッが重要か？**
- **レビューしやすい:** 変更範囲が限定的なため、レビューの質が向上します。
- **問題の特定が容易:** バグの原因となったコミットを素早く特定できます (`git bisect`)。
- **変更の取り消しが安全:** 特定の変更だけを安全に取り消す (`git revert`) ことができます。

- **コミットメッセージ:** Conventional Commits に準拠してください。
  - `feat(auth): add Facebook login`
  - `fix(ui): correct button alignment`

### 品質チェック

Pre-commitフックにより、コミット時に自動で品質チェックが実行されます。

```bash
# すべてのテストと品質チェックを実行
./tools/scripts/dev-test.sh

# フロントエンドのみ
./tools/scripts/dev-test.sh --frontend-only

# バックエンドのみ
./tools/scripts/dev-test.sh --backend-only
```

### 主要なnpmスクリプト

- **`frontend`**
  - `npm run dev`: 開発サーバー起動
  - `npm run test`: ユニットテスト実行
  - `npm run test:e2e`: E2Eテスト実行
  - `npm run lint`: リントチェックと自動修正
  - `npm run build`: 本番ビルド
- **`functions`**
  - `npm run serve`: エミュレータで関数をサーブ
  - `npm run test`: Jestテスト実行
  - `npm run deploy`: Firebaseへデプロイ

---

## 🧪 **テスト戦略**

- **ユニットテスト:**
  - **Frontend:** Vitest + Vue Test Utils
  - **Backend:** Jest + Firebase Test SDK
  - **カバレッジ目標:** 80%以上
- **E2Eテスト:**
  - Cypressを利用し、主要なユーザーフローをテストします。
- **セキュリティテスト:**
  - Firestoreのセキュリティルールは `npm run test:rules` でテストします。

---

## 🚨 **デバッグとトラブルシューティング**

### VS Codeでのデバッグ
`.vscode/launch.json` に、フロントエンド、バックエンド、テスト用のデバッグ構成が定義されています。

- **Frontend:** `Debug Frontend (Chrome)`
- **Backend:** `Debug Cloud Functions`

### よくある問題

- **ポートの競合:**
  ```bash
  # ポートを使用しているプロセスを特定して終了させる
  kill -9 $(lsof -ti:5173)
  ```
- **Firebaseエミュレータの問題:**
  ```bash
  # エミュレータのデータをクリアして再起動
  rm -rf firebase-data
  firebase emulators:start --import=./seed-data
  ```

---

## 📚 **ドキュメントとリソース**

- **アーキテクチャ概要:** `tools/docs/TECHNICAL_SPECIFICATIONS.md`
- **デプロイ手順:** `tools/docs/deployment-guide.md`
- **ユーザーガイド:** `tools/docs/USER_GUIDE.md`
- **その他:** `tools/docs` ディレクトリに各種運用ドキュメントが格納されています。

---

**このガイドがあなたの開発ライフを支えます！** 🚀

*困った時はいつでもここに戻ってきてください。*