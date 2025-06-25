import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * UI状態管理ストア
 * サイドバーの開閉状態や全体的なUI設定を管理
 */
export const useUIStore = defineStore('ui', () => {
  // サイドバーの開閉状態
  const sidebarOpen = ref(true);
  
  // 最後にサイドバー状態を変更したタイムスタンプ
  const lastSidebarToggle = ref<number>(Date.now());
  
  // ダークモード設定（将来実装予定）
  const darkMode = ref(false);
  
  // アニメーション無効設定（アクセシビリティ対応）
  const reducedMotion = ref(false);
  
  // Actions
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
    lastSidebarToggle.value = Date.now();
    
    // ローカルストレージに状態を保存
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('omniy_sidebar_open', String(sidebarOpen.value));
    }
  };
  
  const setSidebarOpen = (open: boolean) => {
    sidebarOpen.value = open;
    lastSidebarToggle.value = Date.now();
    
    // ローカルストレージに状態を保存
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('omniy_sidebar_open', String(sidebarOpen.value));
    }
  };
  
  const loadSidebarState = () => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('omniy_sidebar_open');
      if (saved !== null) {
        sidebarOpen.value = saved === 'true';
      }
    }
  };
  
  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value;
    
    // ローカルストレージに状態を保存
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('omniy_dark_mode', String(darkMode.value));
    }
  };
  
  const setReducedMotion = (enabled: boolean) => {
    reducedMotion.value = enabled;
    
    // ローカルストレージに状態を保存
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('omniy_reduced_motion', String(reducedMotion.value));
    }
  };
  
  const loadUIState = () => {
    if (typeof localStorage !== 'undefined') {
      // サイドバー状態の読み込み
      const savedSidebar = localStorage.getItem('omniy_sidebar_open');
      if (savedSidebar !== null) {
        sidebarOpen.value = savedSidebar === 'true';
      }
      
      // ダークモード状態の読み込み
      const savedDarkMode = localStorage.getItem('omniy_dark_mode');
      if (savedDarkMode !== null) {
        darkMode.value = savedDarkMode === 'true';
      }
      
      // モーション設定の読み込み
      const savedReducedMotion = localStorage.getItem('omniy_reduced_motion');
      if (savedReducedMotion !== null) {
        reducedMotion.value = savedReducedMotion === 'true';
      }
      
      // システムのモーション設定を確認
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches && savedReducedMotion === null) {
          reducedMotion.value = true;
        }
      }
    }
  };
  
  return {
    // State
    sidebarOpen,
    lastSidebarToggle,
    darkMode,
    reducedMotion,
    
    // Actions
    toggleSidebar,
    setSidebarOpen,
    loadSidebarState,
    toggleDarkMode,
    setReducedMotion,
    loadUIState,
  };
});