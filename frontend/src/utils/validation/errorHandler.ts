/**
 * 1人運営向け簡潔エラーハンドリング
 * 70%機能削減・実用性重視
 */

// シンプルなエラータイプ定義
export enum ErrorType {
  AUTH = 'AUTH', // 認証エラー
  VALIDATION = 'VALIDATION', // 入力検証エラー
  NETWORK = 'NETWORK', // ネットワークエラー
  API = 'API', // API エラー
  PLAN_LIMIT = 'PLAN_LIMIT', // プラン制限エラー
  UNKNOWN = 'UNKNOWN', // その他
}

export enum ErrorSeverity {
  LOW = 'LOW', // 警告レベル
  MEDIUM = 'MEDIUM', // 機能影響
  HIGH = 'HIGH', // サービス影響
}

// 統一エラークラス
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly timestamp: Date;

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.userMessage = userMessage;
    this.timestamp = new Date();
  }
}

// Firebase エラーマッピング (1人運営向けシンプル版)
const FIREBASE_ERROR_MAP: Record<
  string,
  { type: ErrorType; userMessage: string; severity: ErrorSeverity }
> = {
  'permission-denied': {
    type: ErrorType.AUTH,
    userMessage: 'この操作を実行する権限がありません',
    severity: ErrorSeverity.MEDIUM,
  },
  unauthenticated: {
    type: ErrorType.AUTH,
    userMessage: 'ログインが必要です',
    severity: ErrorSeverity.MEDIUM,
  },
  'quota-exceeded': {
    type: ErrorType.PLAN_LIMIT,
    userMessage: 'プランの利用上限に達しました',
    severity: ErrorSeverity.HIGH,
  },
  'invalid-argument': {
    type: ErrorType.VALIDATION,
    userMessage: '入力内容に問題があります',
    severity: ErrorSeverity.LOW,
  },
  unavailable: {
    type: ErrorType.NETWORK,
    userMessage: 'サービスが一時的に利用できません',
    severity: ErrorSeverity.HIGH,
  },
};

/**
 * シンプルエラーハンドラー (必要最小限)
 */
export class ErrorHandler {
  // Firebase エラーを AppError に変換
  static fromFirebaseError(error: any): AppError {
    const code = error.code || 'unknown';
    const mapping = FIREBASE_ERROR_MAP[code];

    if (mapping) {
      return new AppError(
        mapping.type,
        `Firebase: ${error.message}`,
        mapping.userMessage,
        mapping.severity
      );
    }

    return new AppError(
      ErrorType.UNKNOWN,
      `Firebase: ${error.message}`,
      'システムエラーが発生しました',
      ErrorSeverity.HIGH
    );
  }

  // 汎用エラー変換
  static fromError(error: any, context?: string): AppError {
    if (error instanceof AppError) {
      return error;
    }

    // Firebase エラーの場合
    if (error.code && typeof error.code === 'string') {
      return this.fromFirebaseError(error);
    }

    // ネットワークエラーの場合
    if (!navigator.onLine) {
      return new AppError(
        ErrorType.NETWORK,
        'Network offline',
        'インターネット接続を確認してください',
        ErrorSeverity.HIGH
      );
    }

    // その他のエラー
    return new AppError(
      ErrorType.UNKNOWN,
      `${context ? context + ': ' : ''}${error.message}`,
      '予期しないエラーが発生しました',
      ErrorSeverity.MEDIUM
    );
  }
}

/**
 * Vue 3 Composable (シンプル版)
 */
export function useErrorHandler() {
  const handleError = (error: any, context?: string): AppError => {
    const appError = ErrorHandler.fromError(error, context);

    // 開発環境でのみコンソール出力
    if (import.meta.env.DEV) {
      console.error(
        `🚨 [${appError.severity}] ${appError.type}:`,
        appError.message
      );
    }

    return appError;
  };

  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    try {
      return await asyncFn();
    } catch (error) {
      throw handleError(error, context);
    }
  };

  return {
    handleError,
    handleAsyncError,
  };
}

// シンプルなヘルパー関数
export const createAuthError = (message: string) =>
  new AppError(
    ErrorType.AUTH,
    message,
    'ログインしてください',
    ErrorSeverity.MEDIUM
  );

export const createValidationError = (message: string) =>
  new AppError(
    ErrorType.VALIDATION,
    message,
    '入力内容を確認してください',
    ErrorSeverity.LOW
  );

export const createPlanLimitError = (feature: string) =>
  new AppError(
    ErrorType.PLAN_LIMIT,
    `Plan limit: ${feature}`,
    'プランをアップグレードしてください',
    ErrorSeverity.HIGH
  );

export const createNetworkError = (message: string) =>
  new AppError(
    ErrorType.NETWORK,
    message,
    'ネットワークエラーが発生しました',
    ErrorSeverity.MEDIUM
  );
