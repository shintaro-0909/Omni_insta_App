/**
 * 🔍 Sentry Error Monitoring Setup (Free Plan)
 * 
 * [MONITORING-001] 修正: 無料監視システム統合
 * - Sentry無料プラン（月5,000エラー）
 * - エラー自動キャプチャ・レポート
 * - パフォーマンス監視（サンプリング10%）
 * - ユーザーフィードバック統合
 * - 開発環境除外設定
 */
import * as Sentry from '@sentry/vue';
import type { App } from 'vue';

export const setupSentry = (app: App, router: any) => {
  // 本番環境のみSentryを有効化
  if (import.meta.env.VITE_APP_ENV === 'production') {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      
      // 基本設定
      environment: import.meta.env.VITE_APP_ENV || 'production',
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // 無料プラン最適化設定
      sampleRate: 1.0,  // 100%のエラーをキャプチャ（無料枠内）
      tracesSampleRate: 0.1,  // 10%のパフォーマンストレース（コスト削減）
      
      // プライバシー設定
      beforeSend(event) {
        // 個人情報をフィルタリング
        if (event.user) {
          delete event.user.email;
          delete event.user.username;
        }
        
        // 機密情報を含むエラーをフィルタリング
        const sensitivePatterns = [
          /api[_-]?key/i,
          /password/i,
          /token/i,
          /secret/i,
          /auth/i
        ];
        
        const message = event.message || '';
        if (sensitivePatterns.some(pattern => pattern.test(message))) {
          event.message = '[Filtered sensitive information]';
        }
        
        return event;
      },
      
      // Vue Router統合
      integrations: [
        new Sentry.BrowserTracing({
          router,
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        }),
      ],
      
      // 無視するエラー（ノイズ削減）
      ignoreErrors: [
        // ブラウザ拡張機能
        'Non-Error exception captured',
        'Non-Error promise rejection captured',
        
        // ネットワーク関連（よくある無害なエラー）
        'Network request failed',
        'Loading chunk',
        'Loading CSS chunk',
        
        // サードパーティスクリプト
        'Script error',
        'ResizeObserver loop limit exceeded',
        
        // 開発環境特有
        'HMR',
        'Hot reload',
      ],
      
      // 無視するURL（統計ノイズ削減）
      denyUrls: [
        // Chrome拡張機能
        /extensions\//i,
        /^chrome:\/\//i,
        /^moz-extension:\/\//i,
        
        // 開発ツール
        /localhost/i,
        /127\.0\.0\.1/i,
      ],
      
      // カスタムタグ（分析用）
      tags: {
        component: 'frontend',
        framework: 'vue3',
        build: import.meta.env.VITE_BUILD_ID || 'unknown'
      },
      
      // 初期ユーザーコンテキスト
      initialScope: {
        tags: {
          section: 'app'
        },
        contexts: {
          app: {
            name: 'Omniy Instagram Scheduler',
            version: import.meta.env.VITE_APP_VERSION || '1.0.0'
          }
        }
      }
    });
    
    console.log('📊 Sentry monitoring initialized');
  } else {
    console.log('🔧 Sentry disabled in development mode');
  }
};

// カスタムエラー報告ヘルパー
export const reportError = (error: Error, context?: Record<string, any>) => {
  if (import.meta.env.VITE_APP_ENV === 'production') {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('💥 Error (development):', error, context);
  }
};

// パフォーマンス計測ヘルパー
export const trackPerformance = (operationName: string, data?: Record<string, any>) => {
  if (import.meta.env.VITE_APP_ENV === 'production') {
    const transaction = Sentry.startTransaction({
      name: operationName,
      op: 'custom'
    });
    
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        transaction.setData(key, value);
      });
    }
    
    return {
      finish: () => transaction.finish(),
      setData: (key: string, value: any) => transaction.setData(key, value)
    };
  }
  
  return {
    finish: () => {},
    setData: () => {}
  };
};

// ユーザーフィードバック
export const showUserFeedback = () => {
  if (import.meta.env.VITE_APP_ENV === 'production') {
    const user = Sentry.getCurrentHub().getScope()?.getUser();
    
    Sentry.showReportDialog({
      title: 'エラーが発生しました',
      subtitle: 'ご不便をおかけして申し訳ありません。',
      subtitle2: '問題の改善にご協力ください。',
      labelName: 'お名前',
      labelEmail: 'メールアドレス',
      labelComments: 'エラーについて詳しく教えてください',
      labelSubmit: '送信',
      errorGeneric: '送信中にエラーが発生しました。しばらく時間をおいて再度お試しください。',
      errorFormEntry: '入力内容に問題があります。確認して再度お試しください。',
      successMessage: 'フィードバックを送信しました。ありがとうございます！',
      user: {
        name: user?.username || '',
        email: user?.email || ''
      }
    });
  }
};

// ユーザーコンテキスト設定
export const setUserContext = (userId: string, email?: string, plan?: string) => {
  if (import.meta.env.VITE_APP_ENV === 'production') {
    Sentry.setUser({
      id: userId,
      email: email,
      plan: plan
    });
    
    Sentry.setTag('user.plan', plan || 'free');
  }
};

// カスタムブレッドクラム
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  if (import.meta.env.VITE_APP_ENV === 'production') {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data
    });
  }
};