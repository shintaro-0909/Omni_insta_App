/**
 * Feature Flags Configuration
 * 1人運営対応: 複雑機能の段階的制御
 */

export interface FeatureFlags {
  // === MVP コア機能 (必須) ===
  BASIC_SCHEDULING: boolean;    // 基本予約投稿
  CONTENT_LIBRARY: boolean;     // コンテンツライブラリ
  INSTAGRAM_AUTH: boolean;      // Instagram認証
  STRIPE_BILLING: boolean;      // Stripe決済
  ACCOUNT_MANAGEMENT: boolean;  // アカウント管理

  // === 高度機能 (段階的制御) ===
  RECURRING_POSTS: boolean;     // 繰り返し投稿
  RANDOM_POSTING: boolean;      // ランダム投稿 (T05)
  ADVANCED_NOTIFICATIONS: boolean; // 高度通知 (T09)
  
  // === 複雑機能 (1人運営では非表示) ===
  PROXY_MANAGEMENT: boolean;    // プロキシ管理 (T13-T14)
  GROUP_MANAGEMENT: boolean;    // グループ管理 (T15)
  LOGS_DASHBOARD: boolean;      // ログダッシュボード (T16)
  CALENDAR_VIEW: boolean;       // カレンダー表示 (T17)
  PREVIEW_FEATURE: boolean;     // プレビュー機能 (T18)
  MULTI_LANGUAGE: boolean;      // 多言語対応 (T19)
  PERFORMANCE_METRICS: boolean; // パフォーマンス分析 (T20)
  
  // === エンタープライズ機能 (将来対応) ===
  TEAM_MANAGEMENT: boolean;     // チーム管理
  API_ACCESS: boolean;          // API アクセス
  ADVANCED_ANALYTICS: boolean;  // 高度分析
  WHITE_LABEL: boolean;         // ホワイトラベル
}

/**
 * 1人運営スモールスタート設定
 * 運用負荷を70%削減する機能制限
 */
export const FEATURE_FLAGS: FeatureFlags = {
  // MVPコア機能: すべて有効
  BASIC_SCHEDULING: true,
  CONTENT_LIBRARY: true,
  INSTAGRAM_AUTH: true,
  STRIPE_BILLING: true,
  ACCOUNT_MANAGEMENT: true,

  // 高度機能: 段階的有効化
  RECURRING_POSTS: true,        // 比較的シンプル
  RANDOM_POSTING: false,        // 複雑ロジック → 無効
  ADVANCED_NOTIFICATIONS: false, // サポート負荷高 → 無効

  // 複雑機能: 完全無効化
  PROXY_MANAGEMENT: false,      // インフラ管理複雑
  GROUP_MANAGEMENT: false,      // UI/UX複雑
  LOGS_DASHBOARD: false,        // データ処理重い
  CALENDAR_VIEW: false,         // 表示ロジック複雑
  PREVIEW_FEATURE: false,       // Instagram API依存
  MULTI_LANGUAGE: false,        // 運用コスト高
  PERFORMANCE_METRICS: false,   // 分析処理重い

  // エンタープライズ機能: 将来対応
  TEAM_MANAGEMENT: false,
  API_ACCESS: false,
  ADVANCED_ANALYTICS: false,
  WHITE_LABEL: false
};

/**
 * 開発環境での機能フラグオーバーライド
 */
export const DEV_FEATURE_OVERRIDE: Partial<FeatureFlags> = 
  process.env.NODE_ENV === 'development' 
    ? {
        // 開発時は一部機能を有効化してテスト可能
        LOGS_DASHBOARD: true,
        PERFORMANCE_METRICS: true,
      }
    : {};

/**
 * 最終的な機能フラグ (本番では制限、開発では部分的に緩和)
 */
export const ACTIVE_FEATURES: FeatureFlags = {
  ...FEATURE_FLAGS,
  ...DEV_FEATURE_OVERRIDE
};

/**
 * 機能フラグチェック用ヘルパー関数
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return ACTIVE_FEATURES[feature];
};

/**
 * 複数機能の AND 条件チェック
 */
export const areAllFeaturesEnabled = (...features: (keyof FeatureFlags)[]): boolean => {
  return features.every(feature => isFeatureEnabled(feature));
};

/**
 * 機能群のチェック (カテゴリ別)
 */
export const FEATURE_CATEGORIES = {
  MVP_CORE: ['BASIC_SCHEDULING', 'CONTENT_LIBRARY', 'INSTAGRAM_AUTH', 'STRIPE_BILLING'] as const,
  ADVANCED: ['RECURRING_POSTS', 'RANDOM_POSTING', 'ADVANCED_NOTIFICATIONS'] as const,
  COMPLEX: ['PROXY_MANAGEMENT', 'GROUP_MANAGEMENT', 'LOGS_DASHBOARD'] as const,
  ENTERPRISE: ['TEAM_MANAGEMENT', 'API_ACCESS', 'ADVANCED_ANALYTICS'] as const
} as const;

export const isCategoryEnabled = (category: keyof typeof FEATURE_CATEGORIES): boolean => {
  const features = FEATURE_CATEGORIES[category];
  return features.every(feature => isFeatureEnabled(feature));
};

/**
 * 機能有効化統計 (デバッグ用)
 */
export const getFeatureStats = () => {
  const total = Object.keys(ACTIVE_FEATURES).length;
  const enabled = Object.values(ACTIVE_FEATURES).filter(Boolean).length;
  
  return {
    total,
    enabled,
    disabled: total - enabled,
    enabledPercentage: Math.round((enabled / total) * 100)
  };
};

// デバッグ情報 (開発環境のみ)
if (process.env.NODE_ENV === 'development') {
  console.log('🚩 Feature Flags Status:', getFeatureStats());
  console.log('📊 Enabled Features:', 
    Object.entries(ACTIVE_FEATURES)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature)
  );
}