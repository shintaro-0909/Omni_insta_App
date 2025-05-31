Claude Rules :look👀

# 🏗️ Omniy ディレクトリ構造移行計画

> **Ultrathink Safety Protocol**: 段階的移行、完全テスト、データ相関保護

## 📊 **現状分析**

### **TypeScript エラー状況**
- 大量のエラー（主にAI機能系コンポーネント）
- コア機能は正常に動作する可能性
- デモコンテンツが複雑性を増加

### **移行優先度**
```
🟢 安全（即座実行可能）:
- stores/ の index.ts 追加
- 空フォルダの作成
- README.md の追加

🟡 慎重（テスト必須）:
- components/ の分類移動
- composables/ の分類移動
- utils/ の分類移動

🔴 高リスク（最後に実行）:
- インポートパス変更
- 大きなファイル移動
```

## 🛡️ **安全対策**

### **Phase 0: バックアップ作成**
```bash
# 完全バックアップ作成
cp -r frontend/src frontend/src.backup
cp -r functions/src functions/src.backup
git add . && git commit -m "backup: 移行前のバックアップ"
```

### **各フェーズでの検証**
```bash
# 各段階での確認
1. TypeScript コンパイル確認
2. 重要ファイルの存在確認
3. インポート関係の確認
4. Git status で変更点確認
```

## 📋 **Phase 1: 安全な準備作業**

### **1-1: フォルダ構造作成**
```bash
# Frontend新構造
mkdir -p frontend/src/components/{common,forms,layouts,widgets}
mkdir -p frontend/src/views/{auth,dashboard,content}
mkdir -p frontend/src/composables/{api,ui,business}
mkdir -p frontend/src/utils/{api,date,validation}

# Backend新構造  
mkdir -p functions/src/api/{v1,v2}
mkdir -p functions/src/services/{auth,instagram,storage}
mkdir -p functions/src/utils/{database,validation}
mkdir -p functions/src/config
```

### **1-2: Index.ts ファイル作成**
```typescript
// frontend/src/stores/index.ts
export { useAuthStore } from './auth'
export { usePostsStore } from './posts'
export { useSchedulesStore } from './schedules'
export { useIgAccountsStore } from './igAccounts'

// frontend/src/components/index.ts
// 段階的に追加

// frontend/src/utils/index.ts
// 段階的に追加
```

### **検証**: TypeScript エラー数が増加しないこと

## 📋 **Phase 2: Components分類移動**

### **2-1: フォーム系コンポーネント移動**
```
移動対象:
frontend/src/components/PostFormDialog.vue → forms/
frontend/src/components/ScheduleFormDialog.vue → forms/
frontend/src/components/AddAccountDialog.vue → forms/
frontend/src/components/GroupFormDialog.vue → forms/
frontend/src/components/ProxyFormDialog.vue → forms/
frontend/src/components/SimpleScheduleFormDialog.vue → forms/
```

### **2-2: ダッシュボード系コンポーネント移動**
```
移動対象:
frontend/src/components/UsageDashboard.vue → widgets/
frontend/src/components/PerformanceDashboard.vue → widgets/
frontend/src/components/AccessibilityDashboard.vue → widgets/
frontend/src/components/AIAdaptationDashboard.vue → widgets/
frontend/src/components/AIPredictionDashboard.vue → widgets/
frontend/src/components/MonitoringDashboard.vue → widgets/
frontend/src/components/SecurityDashboard.vue → widgets/
```

### **2-3: 表示系コンポーネント移動**
```
移動対象:
frontend/src/components/PostViewDialog.vue → common/
frontend/src/components/ScheduleViewDialog.vue → common/
frontend/src/components/InstagramPreview.vue → common/
frontend/src/components/LanguageSwitcher.vue → common/
frontend/src/components/PerformanceMetric.vue → common/
```

### **検証**: 各移動後にコンパイルエラー確認

## 📋 **Phase 3: Composables分類移動**

### **3-1: API関連Composables**
```
移動対象:
frontend/src/composables/useOptimizedFetch.ts → api/
frontend/src/composables/useBatchOperations.ts → api/
frontend/src/composables/usePersistedCache.ts → api/
```

### **3-2: UI関連Composables**
```
移動対象:
frontend/src/composables/useAdaptiveLayout.ts → ui/
frontend/src/composables/usePredictiveUI.ts → ui/
frontend/src/composables/useUniversalAccessibility.ts → ui/
frontend/src/composables/useSpatialNavigation.ts → ui/
frontend/src/composables/useAdvancedGestures.ts → ui/
frontend/src/composables/useIntelligentAnimations.ts → ui/
```

### **3-3: ビジネスロジック関連Composables**
```
移動対象:
frontend/src/composables/useImageUpload.ts → business/
frontend/src/composables/useImageOptimization.ts → business/
frontend/src/composables/useAIAdaptation.ts → business/
frontend/src/composables/useAdvancedMonitoring.ts → business/
frontend/src/composables/useServiceWorker.ts → business/
frontend/src/composables/useCrossDeviceState.ts → business/
frontend/src/composables/useAdaptiveContentDelivery.ts → business/
```

### **検証**: Composablesの使用箇所でエラーがないこと

## 📋 **Phase 4: Utils分類移動**

### **4-1: API関連Utils**
```
移動対象:
frontend/src/utils/imageOptimizer.ts → api/
frontend/src/utils/performance.ts → api/
frontend/src/utils/performanceInterceptor.ts → api/
```

### **4-2: セキュリティ関連Utils**
```
移動対象:
frontend/src/utils/security.ts → validation/
frontend/src/utils/securityMiddleware.ts → validation/
frontend/src/utils/securityTesting.ts → validation/
frontend/src/utils/errorHandler.ts → validation/
```

### **4-3: AI/分析関連Utils**
```
移動対象:
frontend/src/utils/aiPredictionEngine.ts → business/
frontend/src/utils/adaptationEngine.ts → business/
frontend/src/utils/behaviorEngine.ts → business/
frontend/src/utils/realTimeMonitoring.ts → business/
```

## 📋 **Phase 5: Backend構造整理**

### **5-1: API バージョニング**
```
移動対象:
functions/src/api/auth.ts → api/v1/
functions/src/api/posts.ts → api/v1/
functions/src/api/schedules.ts → api/v1/
functions/src/api/igAccounts.ts → api/v1/
functions/src/api/groups.ts → api/v1/
functions/src/api/planLimits.ts → api/v1/
functions/src/api/stripe.ts → api/v1/

新しいファイル:
functions/src/api/optimizedPosts.ts → api/v2/
```

### **5-2: Services分離**
```
移動対象:
Instagram関連ロジックの抽出 → services/instagram/
認証関連ロジックの抽出 → services/auth/
ファイル処理ロジックの抽出 → services/storage/
```

### **5-3: Utils分類**
```
移動対象:
functions/src/utils/planLimits.ts → database/
functions/src/utils/scheduleUtils.ts → database/
functions/src/utils/notifications.ts → validation/
functions/src/utils/proxyFetch.ts → api/
```

## 📋 **Phase 6: インポートパス更新**

### **6-1: パスエイリアス設定**
```typescript
// vite.config.ts 更新
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    '@stores': path.resolve(__dirname, './src/stores'),
    '@utils': path.resolve(__dirname, './src/utils'),
    '@composables': path.resolve(__dirname, './src/composables')
  }
}
```

### **6-2: インポート文更新**
```typescript
// 段階的に更新
// 旧: import PostFormDialog from '@/components/PostFormDialog.vue'
// 新: import PostFormDialog from '@components/forms/PostFormDialog.vue'
```

### **検証**: 全てのインポートが正常に解決されること

## 📋 **Phase 7: クリーンアップ**

### **7-1: 不要ファイルの整理**
```
検討対象:
- temp_disabled/ フォルダ
- 古いデモファイル
- 未使用のutilsファイル
```

### **7-2: README.md追加**
```
各フォルダにREADME.md追加:
- components/README.md
- stores/README.md
- utils/README.md
- composables/README.md
```

## 🧪 **検証手順**

### **各フェーズ後の必須チェック**
```bash
# 1. TypeScript コンパイル
cd frontend && npm run type-check

# 2. テスト実行
cd frontend && npm run test:unit
cd functions && npm run test

# 3. ビルド確認
cd frontend && npm run build

# 4. Git status確認
git status
git diff --name-only
```

### **緊急時のロールバック**
```bash
# バックアップからの復旧
rm -rf frontend/src
cp -r frontend/src.backup frontend/src
git reset --hard HEAD
```

## 📊 **進捗追跡**

### **フェーズ完了チェック**
- [x] Phase 0: バックアップ作成 ✅ **完了 (2025-05-31)**
- [x] Phase 1: フォルダ構造作成 ✅ **完了 (2025-05-31)**
- [x] Phase 2: Components分類移動 ✅ **完了 (2025-05-31)**
- [x] Phase 3: Composables分類移動 ✅ **完了 (2025-05-31)**
- [x] Phase 4: Utils分類移動 ✅ **完了 (2025-05-31)**
- [ ] Phase 5: Backend構造整理
- [ ] Phase 6: インポートパス更新 🔄 **次のステップ**
- [ ] Phase 7: クリーンアップ

### **品質ゲート**
```
各フェーズで確認:
✅ TypeScriptエラー数が増加していない
✅ 重要なファイルが欠落していない
✅ インポート関係が維持されている
✅ テストが通る（可能な範囲で）
```

---

**この計画により、安全かつ段階的にプロ仕様のディレクトリ構造に移行します** 🎯