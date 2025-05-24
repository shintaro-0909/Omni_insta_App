---
name: 機能要求 / Feature Request
about: 新機能の実装を依頼する / Request a new feature
title: '[FEATURE] '
labels: ['type/feature', 'status/todo']
assignees: ['claude']

---

## 📋 機能概要 / Feature Overview

<!-- 実装したい機能を簡潔に説明してください -->

## 🎯 期待される動作 / Expected Behavior

<!-- この機能がどのように動作すべきかを説明してください -->

## 📝 詳細仕様 / Detailed Specifications

<!-- 
実装に必要な詳細を記載してください:
- UI/UX要件
- API仕様
- データベース設計
- 技術的制約
-->

## ✅ 受け入れ基準 / Acceptance Criteria

- [ ] 要件1
- [ ] 要件2  
- [ ] 要件3

## 🤖 Claude Code 指示 / Claude Code Instructions

```
@claude implement this feature according to the specifications above
- Follow existing code patterns and architecture
- Include proper TypeScript types
- Add unit tests for new functionality
- Update documentation as needed
- Mark progress in docs/dev_tasks_userstories.md when complete
```

## 📊 優先度 / Priority

- [ ] Critical (即座に必要)
- [ ] High (今Sprint内)
- [ ] Medium (次Sprint)
- [ ] Low (将来的に)

---

**進捗管理ルール**: 完了時は必ず `docs/dev_tasks_userstories.md` で該当項目を `[x]` にマークしてください。