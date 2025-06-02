<template>
  <div class="navigation-test-view">
    <UnifiedNavigation />
    
    <div class="test-content">
      <div class="test-header">
        <h1 class="test-title">🔍 LP統一デザインナビゲーションテスト</h1>
        <p class="test-description">
          全ページのナビゲーション動作とLP-demo.html統一デザインの整合性を確認します
        </p>
      </div>

      <div class="test-controls">
        <button 
          class="test-button primary"
          @click="runAllTests"
          :disabled="testing"
        >
          {{ testing ? '🔄 テスト実行中...' : '🚀 全ナビゲーションテスト実行' }}
        </button>
        
        <button 
          class="test-button secondary"
          @click="runMainNavTest"
          :disabled="testing"
        >
          📱 メインナビゲーションのみテスト
        </button>
        
        <button 
          class="test-button info"
          @click="validateDesignElements"
          :disabled="testing"
        >
          🎨 LP統一デザイン要素確認
        </button>

        <button 
          class="test-button clear"
          @click="clearResults"
          :disabled="testing"
        >
          🗑️ 結果クリア
        </button>
      </div>

      <!-- テスト結果の表示 -->
      <div v-if="testResults.length > 0" class="test-results">
        <div class="results-header">
          <h2 class="results-title">📊 テスト結果</h2>
          <div class="results-summary">
            <div class="summary-item success">
              <span class="summary-icon">✅</span>
              <span class="summary-text">成功: {{ successCount }}/{{ testResults.length }}</span>
            </div>
            <div class="summary-item error">
              <span class="summary-icon">❌</span>
              <span class="summary-text">失敗: {{ failureCount }}/{{ testResults.length }}</span>
            </div>
            <div class="summary-item time">
              <span class="summary-icon">⚡</span>
              <span class="summary-text">平均時間: {{ averageTime }}ms</span>
            </div>
          </div>
        </div>

        <div class="results-grid">
          <div 
            v-for="result in testResults" 
            :key="result.link.path"
            class="result-card"
            :class="{ 'success': result.success, 'error': !result.success }"
          >
            <div class="result-header">
              <div class="result-status">
                {{ result.success ? '✅' : '❌' }}
              </div>
              <div class="result-info">
                <h3 class="result-name">{{ result.link.name }}</h3>
                <div class="result-path">{{ result.link.path }}</div>
              </div>
              <div class="result-time" v-if="result.loadTime">
                {{ result.loadTime }}ms
              </div>
            </div>
            
            <div class="result-description">
              {{ result.link.description }}
            </div>
            
            <div v-if="result.error" class="result-error">
              <strong>エラー:</strong> {{ result.error }}
            </div>

            <div class="result-actions">
              <button 
                class="action-button"
                @click="navigateToPage(result.link.path)"
                :disabled="!result.success"
              >
                🔗 ページを開く
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- デザイン要素確認結果 -->
      <div v-if="designCheckResults" class="design-check-results">
        <div class="design-header">
          <h2 class="design-title">🎨 LP統一デザイン要素確認結果</h2>
        </div>
        
        <div class="design-grid">
          <div 
            v-for="(status, element) in designCheckResults" 
            :key="element"
            class="design-item"
            :class="{ 'valid': status, 'invalid': !status }"
          >
            <div class="design-status">
              {{ status ? '✅' : '❌' }}
            </div>
            <div class="design-name">
              {{ getDesignElementName(element) }}
            </div>
            <div class="design-description">
              {{ getDesignElementDescription(element) }}
            </div>
          </div>
        </div>
      </div>

      <!-- ナビゲーションリンク一覧 -->
      <div class="navigation-links-section">
        <h2 class="section-title">🧭 利用可能なナビゲーションリンク</h2>
        
        <div class="links-categories">
          <div class="links-category">
            <h3 class="category-title">メインナビゲーション</h3>
            <div class="links-grid">
              <router-link 
                v-for="link in mainNavigationLinks" 
                :key="link.path"
                :to="link.path"
                class="nav-link-card"
                :class="{ 'active': $route.path === link.path }"
              >
                <div class="link-icon">{{ link.icon }}</div>
                <div class="link-info">
                  <div class="link-name">{{ link.name }}</div>
                  <div class="link-path">{{ link.path }}</div>
                </div>
              </router-link>
            </div>
          </div>

          <div class="links-category">
            <h3 class="category-title">デモページ</h3>
            <div class="links-grid">
              <router-link 
                v-for="link in demoLinks" 
                :key="link.path"
                :to="link.path"
                class="nav-link-card demo"
                :class="{ 'active': $route.path === link.path }"
              >
                <div class="link-icon">{{ link.icon }}</div>
                <div class="link-info">
                  <div class="link-name">{{ link.name }}</div>
                  <div class="link-path">{{ link.path }}</div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { UnifiedNavigation } from '@/components';
import { navigationTester, type NavigationTestResult } from '@/utils/navigationTest';

const router = useRouter();
const route = useRoute();

// State
const testing = ref(false);
const testResults = ref<NavigationTestResult[]>([]);
const designCheckResults = ref<{ [key: string]: boolean } | null>(null);

// Computed
const successCount = computed(() => testResults.value.filter(r => r.success).length);
const failureCount = computed(() => testResults.value.filter(r => !r.success).length);
const averageTime = computed(() => {
  const times = testResults.value.filter(r => r.loadTime).map(r => r.loadTime!);
  return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
});

// Navigation links for manual testing
const mainNavigationLinks = [
  { name: 'ホーム', path: '/', icon: '🏠' },
  { name: 'ダッシュボード', path: '/dashboard', icon: '📊' },
  { name: '予約管理', path: '/schedules', icon: '📅' },
  { name: 'アカウント', path: '/accounts', icon: '📱' },
  { name: 'コンテンツ', path: '/content', icon: '🎨' },
  { name: '設定', path: '/settings', icon: '⚙️' },
  { name: 'プラン管理', path: '/billing', icon: '💳' },
];

const demoLinks = [
  { name: 'デモトップ', path: '/demo', icon: '✨' },
  { name: 'モダンデモ', path: '/demo/modern', icon: '🔮' },
  { name: 'サイバーパンクデモ', path: '/demo/cyberpunk', icon: '🤖' },
  { name: 'スタイリッシュデモ', path: '/demo/stylish', icon: '💎' },
  { name: 'ニューモーフィズムデモ', path: '/demo/neumorphism', icon: '🌊' },
  { name: 'ホログラフィックデモ', path: '/demo/holographic', icon: '🌈' },
  { name: 'バイオモーフィックデモ', path: '/demo/biomorphic', icon: '🧬' },
];

// Methods
const runAllTests = async () => {
  testing.value = true;
  try {
    console.log('🚀 全ナビゲーションテスト開始...');
    testResults.value = await navigationTester.testAllLinks();
    console.log('✅ 全ナビゲーションテスト完了');
  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  } finally {
    testing.value = false;
  }
};

const runMainNavTest = async () => {
  testing.value = true;
  try {
    console.log('🎯 メインナビゲーションテスト開始...');
    testResults.value = await navigationTester.testMainNavigation();
    console.log('✅ メインナビゲーションテスト完了');
  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  } finally {
    testing.value = false;
  }
};

const validateDesignElements = async () => {
  testing.value = true;
  try {
    console.log('🎨 LP統一デザイン要素確認開始...');
    designCheckResults.value = await navigationTester.validateLPDesignElements();
    console.log('✅ LP統一デザイン要素確認完了', designCheckResults.value);
  } catch (error) {
    console.error('❌ デザイン要素確認エラー:', error);
  } finally {
    testing.value = false;
  }
};

const clearResults = () => {
  testResults.value = [];
  designCheckResults.value = null;
  console.log('🗑️ テスト結果をクリアしました');
};

const navigateToPage = (path: string) => {
  router.push(path);
};

const getDesignElementName = (element: string) => {
  const names: { [key: string]: string } = {
    unifiedNavigation: '統一ナビゲーション',
    phoneLogos: 'スマホモックアップ',
    floatingElements: 'フローティング要素',
    gradientColors: 'グラデーションカラー',
    responsiveDesign: 'レスポンシブデザイン'
  };
  return names[element] || element;
};

const getDesignElementDescription = (element: string) => {
  const descriptions: { [key: string]: string } = {
    unifiedNavigation: 'omniy-nav クラスの統一ナビゲーション',
    phoneLogos: 'ヒーローセクションのスマートフォンモックアップ',
    floatingElements: '背景のアニメーション要素',
    gradientColors: 'CSS変数で定義されたグラデーションカラー',
    responsiveDesign: 'モバイル対応の適応的レイアウト'
  };
  return descriptions[element] || '';
};

// Lifecycle
onMounted(() => {
  console.log('📱 ナビゲーションテストページが読み込まれました');
  console.log('現在のルート:', route.path);
});
</script>

<style scoped>
.navigation-test-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
  color: #2d3748;
  line-height: 1.6;
  min-height: 100vh;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
}

.test-content {
  margin-top: 80px;
  padding: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.test-header {
  text-align: center;
  margin-bottom: 3rem;
}

.test-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.test-description {
  font-size: 1.1rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
}

.test-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  justify-content: center;
  flex-wrap: wrap;
}

.test-button {
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.test-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.test-button.secondary {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.3);
}

.test-button.info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.test-button.clear {
  background: #f7fafc;
  color: #718096;
  border: 2px solid #e2e8f0;
}

.test-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.test-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* テスト結果スタイル */
.test-results {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 3rem;
}

.results-header {
  margin-bottom: 2rem;
}

.results-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.results-summary {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
}

.summary-item.success {
  background: #d1fae5;
  color: #065f46;
}

.summary-item.error {
  background: #fee2e2;
  color: #991b1b;
}

.summary-item.time {
  background: #dbeafe;
  color: #1e40af;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.result-card {
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.result-card.success {
  border-color: #10b981;
  background: #f0fdf4;
}

.result-card.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-status {
  font-size: 1.5rem;
}

.result-info {
  flex: 1;
}

.result-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.result-path {
  font-size: 0.9rem;
  color: #718096;
  font-family: monospace;
}

.result-time {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 600;
}

.result-description {
  margin-bottom: 1rem;
  color: #4a5568;
  font-size: 0.9rem;
}

.result-error {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.result-actions {
  margin-top: 1rem;
}

.action-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* デザイン確認結果スタイル */
.design-check-results {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 3rem;
}

.design-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.design-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.design-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.design-item.valid {
  border-color: #10b981;
  background: #f0fdf4;
}

.design-item.invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

.design-status {
  font-size: 1.2rem;
}

.design-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.design-description {
  font-size: 0.9rem;
  color: #718096;
}

/* ナビゲーションリンク一覧 */
.navigation-links-section {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.links-categories {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #4a5568;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.nav-link-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  text-decoration: none;
  color: #2d3748;
  transition: all 0.3s ease;
}

.nav-link-card:hover {
  border-color: #667eea;
  background: #f7fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.nav-link-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-link-card.demo {
  border-color: #f093fb;
}

.nav-link-card.demo:hover {
  border-color: #f093fb;
  background: #fdf2f8;
}

.nav-link-card.demo.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.link-icon {
  font-size: 1.5rem;
}

.link-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.link-path {
  font-size: 0.9rem;
  opacity: 0.8;
  font-family: monospace;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .test-content {
    padding: 1rem;
  }
  
  .test-title {
    font-size: 2rem;
  }
  
  .test-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .test-button {
    width: 100%;
    max-width: 300px;
  }
  
  .results-summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .results-grid,
  .design-grid,
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>