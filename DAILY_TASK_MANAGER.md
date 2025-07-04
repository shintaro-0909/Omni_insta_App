Claude Rules :look👀

# 📅 Omniy 日常タスクマネージャー

> **毎日何をすべきかが一目でわかるタスク管理システム**  
> **更新日**: 2025-05-31  
> **使用方法**: 毎朝5分でチェック、夜2分で更新

---

## 🌅 **今日のタスク (Daily)**

### **朝の確認 (5分)**
```
□ Discord監視通知確認 → 🟢正常 / 🟡注意 / 🔴緊急
□ 開発環境起動確認 → frontend + firebase emulator
□ 昨日の作業内容git status確認 → 未コミット分の確認
□ 今日の開発予定確認 → 下記「今日の開発タスク」をチェック
```

### **今日の開発タスク**
```
優先度 [高]: 
□ 

優先度 [中]:
□ 

優先度 [低]:
□ 

メモ:
```

### **夜の作業完了確認 (2分)**
```
□ 作業内容をgit commit → 必ず1日1回はコミット
□ 明日のタスクを上記に記入 → 朝の迷いを防ぐ
□ 開発環境停止 → Ctrl+C でサーバー停止
□ 困ったことをメモ → 下記「週間課題」に記入
```

---

## 📅 **今週の目標 (Weekly)**

### **Week of 2025-05-31 〜 2025-06-06**
```
🎯 今週の主要目標:
□ 

🔧 技術的改善:
□ 

📚 学習目標:
□ 

📊 完了したタスク:
□ ✅ 自動監視システム導入完了 (5/31)
□ 

🚨 今週発生した課題:
□ 

💡 来週への引き継ぎ:
□ 
```

---

## 📋 **開発フェーズ別タスクテンプレート**

### **🎨 UI開発フェーズ**
```
□ デザイン要件確認
□ 既存コンポーネントの再利用検討
□ 新コンポーネント作成
  □ frontend/src/components/に配置
  □ TypeScript型定義
  □ Props/Events設計
□ レスポンシブ対応確認
□ アクセシビリティ確認
□ コンポーネントテスト作成
```

### **⚡ API開発フェーズ**
```
□ API仕様設計
□ functions/src/api/に実装
□ リクエスト/レスポンス型定義
□ バリデーション実装
□ エラーハンドリング実装
□ セキュリティルール更新 (firestore.rules)
□ ユニットテスト作成
□ Postman/Thunder Clientでテスト
```

### **🔒 セキュリティ強化フェーズ**
```
□ 現在のセキュリティ状況確認
□ OWASP Top 10 チェック
□ 入力値検証強化
□ 認証・認可の見直し
□ Firestore rules更新
□ 依存関係脆弱性スキャン (npm audit)
□ セキュリティテスト実行
```

### **📊 パフォーマンス最適化フェーズ**
```
□ Lighthouse スコア測定
□ バンドルサイズ分析
□ 不要なライブラリの削除
□ 画像最適化
□ コード分割 (lazy loading)
□ Firestore クエリ最適化
□ Functions メモリ使用量確認
```

---

## 🔄 **定期メンテナンスチェックリスト**

### **毎週日曜 (30分)**
```
□ tools/docs/WEEKLY_MAINTENANCE_CHECKLIST.md を実行
□ npm audit でセキュリティ確認
□ Firebase Console で使用量確認
□ 今週の振り返りを記入
□ 来週の計画策定
```

### **毎月1日 (1時間)**
```
□ tools/scripts/monthly-maintenance.sh を実行
□ 依存関係の更新 (npm update)
□ バックアップ状況確認
□ パフォーマンス指標レビュー
□ 新機能のロードマップ更新
```

### **四半期 (半日)**
```
□ プロジェクト全体のリファクタリング検討
□ 技術スタックの見直し
□ セキュリティ監査
□ ドキュメントの全体見直し
□ チーム拡張の検討
```

---

## 🎯 **緊急時対応チェックリスト**

### **🔴 レベル3: サイトダウン等**
```
⏰ 対応時間: 即座〜4時間以内

□ Discord監視通知で状況確認
□ Firebase Console でサービス状況確認
□ GitHub Actions でデプロイ状況確認
□ 緊急時は一時的にメンテナンスページ表示
□ 原因特定と修正
□ サービス復旧確認
□ 事後報告書作成（再発防止策含む）
```

### **🟡 レベル2: 機能不具合等**
```
⏰ 対応時間: 24時間以内

□ エラーログで詳細確認
□ 影響範囲の特定
□ 一時的な回避策検討
□ 根本原因の調査
□ 修正実装とテスト
□ デプロイと動作確認
```

### **🟢 レベル1: 軽微な問題**
```
⏰ 対応時間: 1週間以内

□ 問題の記録
□ 優先度の設定
□ 修正計画の策定
□ 通常の開発サイクルで対応
```

---

## 📊 **進捗管理テンプレート**

### **機能開発進捗**
```
機能名: _______________

進捗状況:
□ 要件定義 (0%)
□ 設計 (0%)
□ 実装 (0%)
□ テスト (0%)
□ レビュー (0%)
□ リリース (0%)

予定工数: _____ 時間
実績工数: _____ 時間
完了予定: ____年__月__日

メモ:
```

### **学習進捗**
```
学習テーマ: _______________

進捗状況:
□ 基礎理解 (0%)
□ 実践練習 (0%)
□ 実プロジェクト適用 (0%)
□ 他人に説明可能 (0%)

学習時間: _____ 時間
完了予定: ____年__月__日

参考資料:
□ 
□ 

実践例:
□ 
□ 
```

---

## 🎓 **スキルアップトラッカー**

### **技術スキル評価 (1-5点)**
```
フロントエンド:
□ Vue.js基礎: ___/5
□ TypeScript: ___/5
□ CSS/UI設計: ___/5
□ 状態管理(Pinia): ___/5

バックエンド:
□ Firebase Functions: ___/5
□ Firestore: ___/5
□ API設計: ___/5
□ セキュリティ: ___/5

開発ツール:
□ Git: ___/5
□ VS Code: ___/5
□ デバッグ: ___/5
□ テスト: ___/5

今月の目標スキル:
1. _______________ (現在__/5 → 目標__/5)
2. _______________ (現在__/5 → 目標__/5)
```

---

## 💡 **アイデア・改善提案メモ**

### **新機能アイデア**
```
□ アイデア: _______________
  優先度: 高/中/低
  実装難易度: 高/中/低
  想定工数: _____ 時間

□ アイデア: _______________
  優先度: 高/中/低
  実装難易度: 高/中/低
  想定工数: _____ 時間
```

### **改善提案**
```
□ 対象: _______________
  現在の問題: _______________
  改善案: _______________
  期待効果: _______________

□ 対象: _______________
  現在の問題: _______________
  改善案: _______________
  期待効果: _______________
```

---

## 🔍 **問題・課題トラッカー**

### **技術的課題**
```
🔴 緊急:
□ 

🟡 重要:
□ 

🟢 いつか:
□ 
```

### **学習・理解が必要な分野**
```
□ 分野: _______________
  理由: _______________
  学習計画: _______________

□ 分野: _______________
  理由: _______________
  学習計画: _______________
```

---

## 📞 **連絡先・リソース一覧**

### **緊急時連絡先**
```
Firebase サポート: https://firebase.google.com/support
GitHub サポート: https://support.github.com
Discord サポート: https://support.discord.com
```

### **学習リソース**
```
Vue.js 公式: https://vuejs.org/
Firebase 公式: https://firebase.google.com/docs
TypeScript 公式: https://www.typescriptlang.org/
```

### **開発ツール**
```
Firebase Console: https://console.firebase.google.com
GitHub Actions: https://github.com/shintaro-0909/Omni_insta_App/actions
Discord監視: [あなたのDiscordチャンネル]
```

---

## 🏆 **達成記録・お祝い**

### **今月の成果**
```
✅ 2025-05-31: 自動監視システム導入完了
✅ 
✅ 
```

### **マイルストーン達成**
```
🎉 [日付]: [達成内容]
💪 頑張ったポイント: _______________
📈 成長したスキル: _______________
🎯 次の目標: _______________
```

---

## 📋 **このタスクマネージャーの使い方**

### **毎朝のルーチン (5分)**
```
1. 「今日のタスク - 朝の確認」を実行
2. 「今日の開発タスク」を確認・更新
3. 緊急課題がないかチェック
4. 開発環境を起動
```

### **作業中**
```
1. 完了したタスクに ✅ を付ける
2. 問題があれば「問題・課題トラッカー」に記録
3. アイデアが浮かんだら「アイデアメモ」に記録
```

### **夜のルーチン (2分)**
```
1. 「今日のタスク - 夜の確認」を実行
2. 明日のタスクを準備
3. 学んだことがあれば記録
4. 週次・月次の更新（該当日のみ）
```

### **定期見直し**
```
週末: 今週の振り返りと来週の計画
月末: 月次の振り返りと来月の目標設定
四半期: 大きな方向性の見直し
```

---

**このタスクマネージャーで、効率的で充実した開発ライフを！** 🚀

*完璧を求めず、継続的な改善を心がけて使ってください。あなたの成長をサポートします！*