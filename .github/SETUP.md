# GitHub Setup Guide for Omniy Project

## 必須設定

### 1. GitHub Secrets の設定

Repository Settings → Secrets and variables → Actions で以下のSecretsを追加：

#### 必須 Secrets:
```
ANTHROPIC_API_KEY: 
  - Anthropic Console (https://console.anthropic.com) で取得
  - Claude Code GitHub Actions統合に必要

FIREBASE_SERVICE_ACCOUNT_OMNIY_DEV:
  - Firebase Console → Project Settings → Service Accounts
  - "Generate new private key" でJSONをダウンロード
  - JSONの内容をそのまま貼り付け
  - Firebase Hosting Preview deploymentに必要
```

### 2. Claude GitHub App インストール

1. **Claude GitHub App をインストール:**
   - https://github.com/apps/claude にアクセス
   - "Install" をクリック
   - このリポジトリを選択してインストール

2. **権限確認:**
   - Contents: Read and write
   - Issues: Write
   - Pull requests: Write
   - Actions: Read

## 使用方法

### Claude Code AI 支援

任意のIssue、PR、Comment で `@claude` をメンションして指示：

#### 例 1: 新機能実装
```
@claude implement user profile editing feature in SettingsView.vue
- Add edit button to profile section  
- Create modal dialog with form fields
- Follow existing Vuetify component patterns
- Include TypeScript types
- Update progress tracking file when complete
```

#### 例 2: バグ修正  
```
@claude fix authentication error in auth store
- Debug token refresh logic
- Add proper error handling
- Test with expired tokens
```

### 進捗管理の重要ルール ⚠️

**完了した項目については、必ず `docs/dev_tasks_userstories.md` でチェックマーク（`[x]`）をつける**

Claude Code を使用する際も、この進捗管理ルールは必須です。

## 自動化機能

1. **CI/CD Pipeline**: プッシュ・PR時に自動実行
2. **Progress Tracking**: 進捗管理ファイル更新を自動チェック
3. **Preview Deployment**: PR作成時に自動プレビュー

## 参考リンク

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Anthropic API Documentation](https://docs.anthropic.com/en/api)