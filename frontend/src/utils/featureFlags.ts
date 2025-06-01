/**
 * ソロ起業家向けMVP機能フラグシステム
 * 複雑な機能を段階的に無効化し、シンプルなUXを提供
 */

export interface FeatureFlags {
  // 🎯 MVP必須機能（常に有効）
  mvpCore: {
    dashboard: boolean;
    schedules: boolean;
    accounts: boolean;
    content: boolean;
    billing: boolean;
    settings: boolean;
  };

  // 🚫 ソロ運営には複雑すぎる機能（無効化）
  advancedFeatures: {
    proxyManagement: boolean;
    groupManagement: boolean;
    advancedLogs: boolean;
    calendarView: boolean;
    performanceMetrics: boolean;
    multiLanguage: boolean;
    notifications: boolean;
    quickStats: boolean;
  };

  // 🔮 将来実装予定（現在は無効）
  futureFeatures: {
    aiContentGeneration: boolean;
    analyticsDetailed: boolean;
    teamCollaboration: boolean;
    apiAccess: boolean;
  };
}

// ソロ起業家向けMVP設定
export const SOLO_MVP_FLAGS: FeatureFlags = {
  mvpCore: {
    dashboard: true,
    schedules: true,
    accounts: true,
    content: true,
    billing: true,
    settings: true,
  },

  advancedFeatures: {
    proxyManagement: false, // 複雑すぎる
    groupManagement: false, // 個人では不要
    advancedLogs: false, // シンプルなログのみ
    calendarView: false, // スケジュール画面で十分
    performanceMetrics: false, // 基本メトリクスのみ
    multiLanguage: false, // 日本語のみでスタート
    notifications: false, // メール通知のみ
    quickStats: false, // ダッシュボードで十分
  },

  futureFeatures: {
    aiContentGeneration: false,
    analyticsDetailed: false,
    teamCollaboration: false,
    apiAccess: false,
  },
};

// 機能フラグチェッカー
export class FeatureFlagService {
  private flags: FeatureFlags;

  constructor(flags: FeatureFlags = SOLO_MVP_FLAGS) {
    this.flags = flags;
  }

  // MVP機能チェック
  isMvpFeatureEnabled(feature: keyof FeatureFlags['mvpCore']): boolean {
    return this.flags.mvpCore[feature];
  }

  // 高度な機能チェック
  isAdvancedFeatureEnabled(
    feature: keyof FeatureFlags['advancedFeatures']
  ): boolean {
    return this.flags.advancedFeatures[feature];
  }

  // 将来機能チェック
  isFutureFeatureEnabled(
    feature: keyof FeatureFlags['futureFeatures']
  ): boolean {
    return this.flags.futureFeatures[feature];
  }

  // ナビゲーションメニュー用のフィルタリング
  filterMenuItems(allItems: any[]): any[] {
    return allItems.filter(item => {
      switch (item.to) {
        case '/dashboard':
          return this.isMvpFeatureEnabled('dashboard');
        case '/schedules':
          return this.isMvpFeatureEnabled('schedules');
        case '/accounts':
          return this.isMvpFeatureEnabled('accounts');
        case '/content':
          return this.isMvpFeatureEnabled('content');
        case '/billing':
          return this.isMvpFeatureEnabled('billing');
        case '/settings':
          return this.isMvpFeatureEnabled('settings');
        case '/proxies':
          return this.isAdvancedFeatureEnabled('proxyManagement');
        case '/groups':
          return this.isAdvancedFeatureEnabled('groupManagement');
        case '/logs':
          return this.isAdvancedFeatureEnabled('advancedLogs');
        case '/calendar':
          return this.isAdvancedFeatureEnabled('calendarView');
        default:
          return false;
      }
    });
  }

  // ルートアクセス制御
  isRouteAccessible(routePath: string): boolean {
    const menuItems = this.getAllPossibleMenuItems();
    const filteredItems = this.filterMenuItems(menuItems);
    return filteredItems.some(item => item.to === routePath);
  }

  private getAllPossibleMenuItems() {
    return [
      { to: '/dashboard' },
      { to: '/schedules' },
      { to: '/accounts' },
      { to: '/content' },
      { to: '/billing' },
      { to: '/settings' },
      { to: '/proxies' },
      { to: '/groups' },
      { to: '/logs' },
      { to: '/calendar' },
    ];
  }
}

// シングルトンインスタンス
export const featureFlags = new FeatureFlagService();

// 開発用ヘルパー
export const DEV_FLAGS = {
  ...SOLO_MVP_FLAGS,
  // 開発時は全機能有効にできる
  advancedFeatures: {
    ...SOLO_MVP_FLAGS.advancedFeatures,
    // proxyManagement: true, // 開発時のみ有効化
  },
};
