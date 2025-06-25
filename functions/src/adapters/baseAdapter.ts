/**
 * 🏗️ Base Social Media Platform Adapter
 * 
 * [ADAPTER-001] マルチプラットフォーム投稿の基盤インターフェース
 * - プラットフォーム共通の投稿処理定義
 * - 各SNSの特性に応じた実装を強制
 * - 認証・投稿・バリデーション・エラーハンドリング統一
 */

export type Platform = 'instagram' | 'x' | 'facebook' | 'tiktok' | 'linkedin' | 'mock';

export type PostStatus = 'pending' | 'processing' | 'published' | 'failed' | 'scheduled';

export interface MediaItem {
  type: 'image' | 'video' | 'carousel';
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  duration?: number; // 動画の場合（秒）
}

export interface PostContent {
  text: string;
  media: MediaItem[];
  hashtags?: string[];
  mentions?: string[];
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface PostOptions {
  scheduleAt?: Date;
  enableComments?: boolean;
  enableLikes?: boolean;
  audienceTargeting?: {
    countries?: string[];
    languages?: string[];
    ageMin?: number;
    ageMax?: number;
  };
}

export interface PostResult {
  success: boolean;
  postId?: string;
  url?: string;
  scheduledFor?: Date;
  error?: string;
  platformResponse?: any;
}

export interface AccountInfo {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  isVerified?: boolean;
  followersCount?: number;
  isBusinessAccount?: boolean;
}

export interface PlatformLimits {
  textMaxLength: number;
  mediaMaxCount: number;
  hashtagMaxCount: number;
  videoMaxDuration?: number; // 秒
  videoMaxSize?: number; // bytes
  imageMaxSize?: number; // bytes
  supportedMediaTypes: string[];
  rateLimits: {
    postsPerHour: number;
    postsPerDay: number;
  };
}

export interface AuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string[];
  userId?: string;
  additionalData?: Record<string, any>;
}

/**
 * プラットフォーム統一インターフェース
 */
export abstract class BaseSocialMediaAdapter {
  protected platform: Platform;
  protected credentials: AuthCredentials;
  protected isRealMode: boolean;

  constructor(platform: Platform, credentials: AuthCredentials, realMode = false) {
    this.platform = platform;
    this.credentials = credentials;
    this.isRealMode = realMode;
  }

  /**
   * プラットフォーム名を取得
   */
  getPlatform(): Platform {
    return this.platform;
  }

  /**
   * プラットフォームの投稿制限を取得
   */
  abstract getLimits(): PlatformLimits;

  /**
   * 投稿内容をバリデーション
   */
  abstract validateContent(content: PostContent): { isValid: boolean; errors: string[] };

  /**
   * アカウント情報を取得
   */
  abstract getAccountInfo(): Promise<AccountInfo>;

  /**
   * 投稿を実行
   */
  abstract publishPost(content: PostContent, options?: PostOptions): Promise<PostResult>;

  /**
   * 投稿をスケジュール（プラットフォーム側で対応している場合）
   */
  abstract schedulePost(content: PostContent, scheduleAt: Date, options?: PostOptions): Promise<PostResult>;

  /**
   * 投稿を削除
   */
  abstract deletePost(postId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * 認証トークンの有効性チェック
   */
  abstract validateCredentials(): Promise<{ isValid: boolean; error?: string }>;

  /**
   * 認証トークンをリフレッシュ
   */
  abstract refreshCredentials(): Promise<{ success: boolean; credentials?: AuthCredentials; error?: string }>;

  /**
   * プラットフォーム固有のエラーハンドリング
   */
  abstract handlePlatformError(error: any): { 
    type: 'auth' | 'ratelimit' | 'content' | 'network' | 'platform' | 'unknown';
    message: string;
    retryable: boolean;
    retryAfter?: number; // 秒
  };

  /**
   * 利用可能な機能一覧
   */
  abstract getSupportedFeatures(): {
    scheduling: boolean;
    stories: boolean;
    liveVideo: boolean;
    polls: boolean;
    carousel: boolean;
    video: boolean;
    location: boolean;
    hashtags: boolean;
    mentions: boolean;
    comments: boolean;
    analytics: boolean;
  };

  /**
   * プラットフォーム固有のコンテンツ最適化
   */
  abstract optimizeContent(content: PostContent): PostContent;

  /**
   * 投稿プレビューURL生成（可能な場合）
   */
  abstract generatePreview?(content: PostContent): Promise<{ previewUrl?: string; thumbnailUrl?: string }>;

  /**
   * 共通ユーティリティ: ハッシュタグ正規化
   */
  protected normalizeHashtags(hashtags: string[]): string[] {
    return hashtags
      .map(tag => tag.replace(/^#/, '').trim())
      .filter(tag => tag.length > 0)
      .map(tag => `#${tag}`);
  }

  /**
   * 共通ユーティリティ: メンション正規化
   */
  protected normalizeMentions(mentions: string[]): string[] {
    return mentions
      .map(mention => mention.replace(/^@/, '').trim())
      .filter(mention => mention.length > 0)
      .map(mention => `@${mention}`);
  }

  /**
   * 共通ユーティリティ: テキスト長制限適用
   */
  protected truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
  }

  /**
   * 共通ユーティリティ: レート制限チェック
   */
  protected checkRateLimit(postsToday: number, postsThisHour: number): { allowed: boolean; resetAt?: Date } {
    const limits = this.getLimits().rateLimits;
    
    if (postsThisHour >= limits.postsPerHour) {
      const resetAt = new Date();
      resetAt.setHours(resetAt.getHours() + 1, 0, 0, 0);
      return { allowed: false, resetAt };
    }
    
    if (postsToday >= limits.postsPerDay) {
      const resetAt = new Date();
      resetAt.setDate(resetAt.getDate() + 1);
      resetAt.setHours(0, 0, 0, 0);
      return { allowed: false, resetAt };
    }
    
    return { allowed: true };
  }

  /**
   * ログ出力ヘルパー
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const logData = {
      platform: this.platform,
      realMode: this.isRealMode,
      timestamp: new Date().toISOString(),
      message,
      ...(data && { data })
    };

    switch (level) {
      case 'info':
        console.log(`[${this.platform.toUpperCase()}]`, logData);
        break;
      case 'warn':
        console.warn(`[${this.platform.toUpperCase()}]`, logData);
        break;
      case 'error':
        console.error(`[${this.platform.toUpperCase()}]`, logData);
        break;
    }
  }
}