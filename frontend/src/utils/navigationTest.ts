// ナビゲーションテストユーティリティ - LP統一デザイン対応

interface NavigationLink {
  name: string;
  path: string;
  requiresAuth: boolean;
  isMainNav: boolean;
  description: string;
}

interface NavigationTestResult {
  link: NavigationLink;
  success: boolean;
  error?: string;
  loadTime?: number;
}

export class NavigationTester {
  private links: NavigationLink[] = [
    // メインナビゲーション（LP統一デザイン対応）
    { name: 'ホーム', path: '/', requiresAuth: false, isMainNav: true, description: 'LP-demo.htmlベースのホームページ' },
    { name: 'ダッシュボード', path: '/dashboard', requiresAuth: true, isMainNav: true, description: 'LP統一デザイン - メインダッシュボード' },
    { name: '予約管理', path: '/schedules', requiresAuth: true, isMainNav: true, description: 'LP統一デザイン - スケジュール管理' },
    { name: 'アカウント', path: '/accounts', requiresAuth: true, isMainNav: true, description: 'LP統一デザイン - Instagram アカウント管理' },
    { name: 'コンテンツ', path: '/content', requiresAuth: true, isMainNav: true, description: 'LP統一デザイン - コンテンツライブラリ' },
    { name: '設定', path: '/settings', requiresAuth: true, isMainNav: true, description: 'LP統一デザイン - アプリ設定' },
    { name: 'プラン管理', path: '/billing', requiresAuth: true, isMainNav: true, description: 'LP統一デザイン - 料金・決済管理' },
    
    // セカンダリナビゲーション
    { name: 'ログイン', path: '/login', requiresAuth: false, isMainNav: false, description: 'LP統一デザイン - ログインページ' },
    { name: 'プロキシ', path: '/proxies', requiresAuth: true, isMainNav: false, description: 'プロキシ設定管理' },
    { name: 'グループ', path: '/groups', requiresAuth: true, isMainNav: false, description: 'アカウントグループ管理' },
    { name: 'ログ', path: '/logs', requiresAuth: true, isMainNav: false, description: 'アクティビティログ表示' },
    
    // デモページ
    { name: 'デモトップ', path: '/demo', requiresAuth: false, isMainNav: false, description: '革新的UIデモナビゲーション' },
    { name: 'モダンデモ', path: '/demo/modern', requiresAuth: false, isMainNav: false, description: 'モダン革新デザイン' },
    { name: 'サイバーパンクデモ', path: '/demo/cyberpunk', requiresAuth: false, isMainNav: false, description: 'サイバーパンク革新デザイン' },
    { name: 'スタイリッシュデモ', path: '/demo/stylish', requiresAuth: false, isMainNav: false, description: 'スタイリッシュ革新デザイン' },
    { name: 'ニューモーフィズムデモ', path: '/demo/neumorphism', requiresAuth: false, isMainNav: false, description: 'ニューモーフィズム革新デザイン' },
    { name: 'ホログラフィックデモ', path: '/demo/holographic', requiresAuth: false, isMainNav: false, description: 'ホログラフィック革新デザイン' },
    { name: 'バイオモーフィックデモ', path: '/demo/biomorphic', requiresAuth: false, isMainNav: false, description: 'バイオモーフィック革新デザイン' },
  ];

  public async testAllLinks(): Promise<NavigationTestResult[]> {
    console.log('🔍 LP統一デザインナビゲーションテスト開始...');
    
    const results: NavigationTestResult[] = [];
    
    for (const link of this.links) {
      const result = await this.testSingleLink(link);
      results.push(result);
      
      // 結果をリアルタイムでログ出力
      if (result.success) {
        console.log(`✅ ${link.name} (${link.path}) - 成功 ${result.loadTime}ms`);
      } else {
        console.error(`❌ ${link.name} (${link.path}) - 失敗: ${result.error}`);
      }
    }
    
    return results;
  }

  public async testMainNavigation(): Promise<NavigationTestResult[]> {
    console.log('🎯 LP統一デザインメインナビゲーションテスト開始...');
    
    const mainLinks = this.links.filter(link => link.isMainNav);
    const results: NavigationTestResult[] = [];
    
    for (const link of mainLinks) {
      const result = await this.testSingleLink(link);
      results.push(result);
    }
    
    return results;
  }

  private async testSingleLink(link: NavigationLink): Promise<NavigationTestResult> {
    const startTime = performance.now();
    
    try {
      // ルーター経由でのナビゲーションテスト
      const router = await this.getRouter();
      
      if (!router) {
        return {
          link,
          success: false,
          error: 'ルーターが取得できませんでした'
        };
      }

      // ルートの存在確認
      const route = router.resolve(link.path);
      if (!route || route.name === 'not-found') {
        return {
          link,
          success: false,
          error: 'ルートが見つかりませんでした'
        };
      }

      // 認証要件チェック（必要に応じて）
      if (link.requiresAuth) {
        const authCheck = await this.checkAuthRequirement();
        if (!authCheck) {
          console.warn(`⚠️ ${link.name}: 認証が必要ですが、認証状態をスキップしました`);
        }
      }

      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);

      return {
        link,
        success: true,
        loadTime
      };

    } catch (error) {
      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);

      return {
        link,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        loadTime
      };
    }
  }

  private async getRouter() {
    try {
      // Vue Router インスタンスの取得
      const routerModule = await import('@/router');
      return routerModule.default;
    } catch (error) {
      console.error('ルーターの取得に失敗:', error);
      return null;
    }
  }

  private async checkAuthRequirement(): Promise<boolean> {
    try {
      // 認証ストアの取得（オプショナル）
      const { useAuthStore } = await import('@/stores/auth');
      const authStore = useAuthStore();
      return authStore.isAuthenticated;
    } catch (error) {
      // 認証チェックでエラーが発生した場合は警告を出すが続行
      console.warn('認証チェックでエラー:', error);
      return true; // テスト継続のためtrueを返す
    }
  }

  public generateReport(results: NavigationTestResult[]): string {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => r.success === false).length;
    const avgLoadTime = results
      .filter(r => r.loadTime)
      .reduce((acc, r) => acc + (r.loadTime || 0), 0) / results.length;

    let report = `
📊 LP統一デザインナビゲーションテスト結果
====================================

✅ 成功: ${successful}/${results.length}
❌ 失敗: ${failed}/${results.length}
⚡ 平均読込時間: ${Math.round(avgLoadTime)}ms

詳細結果:
---------
`;

    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const time = result.loadTime ? ` (${result.loadTime}ms)` : '';
      const error = result.error ? ` - ${result.error}` : '';
      
      report += `${status} ${result.link.name}: ${result.link.path}${time}${error}\n`;
      report += `   ${result.link.description}\n\n`;
    });

    if (failed > 0) {
      report += `
⚠️ 修正が必要な項目:
-----------------
`;
      results.filter(r => !r.success).forEach(result => {
        report += `- ${result.link.name} (${result.link.path}): ${result.error}\n`;
      });
    }

    return report;
  }

  // LP統一デザイン要素の確認
  public async validateLPDesignElements(): Promise<{ [key: string]: boolean }> {
    const checks = {
      unifiedNavigation: false,
      phoneLogos: false,
      floatingElements: false,
      gradientColors: false,
      responsiveDesign: false
    };

    try {
      // DOM要素の存在確認
      if (typeof document !== 'undefined') {
        // 統一ナビゲーション確認
        checks.unifiedNavigation = !!document.querySelector('.omniy-nav');
        
        // フローティング要素確認
        checks.floatingElements = !!document.querySelector('.floating-elements');
        
        // CSS変数（グラデーションカラー）確認
        const rootStyles = getComputedStyle(document.documentElement);
        checks.gradientColors = !!(
          rootStyles.getPropertyValue('--primary-gradient') &&
          rootStyles.getPropertyValue('--secondary-gradient')
        );

        // レスポンシブデザイン確認
        checks.responsiveDesign = window.innerWidth <= 768 ? 
          !document.querySelector('.nav-links') || 
          getComputedStyle(document.querySelector('.nav-links') || document.body).display === 'none' 
          : true;
      }
    } catch (error) {
      console.warn('LP統一デザイン要素の確認でエラー:', error);
    }

    return checks;
  }
}

// シングルトンインスタンス
export const navigationTester = new NavigationTester();

// ブラウザ環境での使用例
export function runNavigationTest() {
  if (typeof window !== 'undefined') {
    console.log('🚀 LP統一デザインナビゲーションテスト実行中...');
    
    navigationTester.testAllLinks().then(results => {
      const report = navigationTester.generateReport(results);
      console.log(report);
      
      // LP統一デザイン要素の確認
      navigationTester.validateLPDesignElements().then(designChecks => {
        console.log('🎨 LP統一デザイン要素確認結果:', designChecks);
      });
    });
  }
}