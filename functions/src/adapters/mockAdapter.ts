/**
 * 🎭 Mock Social Media Platform Adapter
 * 
 * [MOCK-001] テスト・開発用モックアダプター
 * - 実API課金なしでの完全テスト環境
 * - プラットフォーム別の特性をシミュレート
 * - エラーケース・レート制限・ネットワーク遅延再現
 */
import { 
  BaseSocialMediaAdapter, 
  Platform,
  PostContent, 
  PostOptions, 
  PostResult, 
  AccountInfo, 
  PlatformLimits,
  AuthCredentials 
} from './baseAdapter';

export class MockSocialMediaAdapter extends BaseSocialMediaAdapter {
  private mockAccountData: AccountInfo;
  private mockPostCounter = 0;
  private mockErrorRate = 0; // 0-100の確率でエラーをシミュレート

  constructor(platform: Platform, credentials: AuthCredentials, errorRate = 0) {
    super(platform, credentials, false); // モックは常にテストモード
    this.mockErrorRate = errorRate;
    this.mockAccountData = this.generateMockAccountData();
  }

  /**
   * プラットフォーム別の制限を返す
   */
  getLimits(): PlatformLimits {
    switch (this.platform) {
      case 'instagram':
        return {
          textMaxLength: 2200,
          mediaMaxCount: 10,
          hashtagMaxCount: 30,
          videoMaxDuration: 60,
          videoMaxSize: 100 * 1024 * 1024, // 100MB
          imageMaxSize: 8 * 1024 * 1024, // 8MB
          supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
          rateLimits: {
            postsPerHour: 5,
            postsPerDay: 25
          }
        };

      case 'x':
        return {
          textMaxLength: 280,
          mediaMaxCount: 4,
          hashtagMaxCount: 5, // 推奨値
          videoMaxDuration: 140,
          videoMaxSize: 512 * 1024 * 1024, // 512MB
          imageMaxSize: 5 * 1024 * 1024, // 5MB
          supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
          rateLimits: {
            postsPerHour: 15,
            postsPerDay: 100
          }
        };

      case 'facebook':
        return {
          textMaxLength: 63206,
          mediaMaxCount: 10,
          hashtagMaxCount: 50,
          videoMaxDuration: 240 * 60, // 4時間
          videoMaxSize: 4 * 1024 * 1024 * 1024, // 4GB
          imageMaxSize: 100 * 1024 * 1024, // 100MB
          supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov'],
          rateLimits: {
            postsPerHour: 10,
            postsPerDay: 50
          }
        };

      case 'tiktok':
        return {
          textMaxLength: 2200,
          mediaMaxCount: 1, // 1動画のみ
          hashtagMaxCount: 20,
          videoMaxDuration: 10 * 60, // 10分
          videoMaxSize: 287 * 1024 * 1024, // 287MB
          imageMaxSize: 0, // 画像投稿不可
          supportedMediaTypes: ['video/mp4'],
          rateLimits: {
            postsPerHour: 3,
            postsPerDay: 10
          }
        };

      default:
        return {
          textMaxLength: 1000,
          mediaMaxCount: 5,
          hashtagMaxCount: 10,
          supportedMediaTypes: ['image/jpeg', 'image/png'],
          rateLimits: {
            postsPerHour: 5,
            postsPerDay: 20
          }
        };
    }
  }

  /**
   * 投稿内容のバリデーション
   */
  validateContent(content: PostContent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const limits = this.getLimits();

    // テキスト長チェック
    if (content.text.length > limits.textMaxLength) {
      errors.push(`テキストが長すぎます（最大${limits.textMaxLength}文字）`);
    }

    // メディア数チェック
    if (content.media.length > limits.mediaMaxCount) {
      errors.push(`メディアが多すぎます（最大${limits.mediaMaxCount}個）`);
    }

    // ハッシュタグ数チェック
    if (content.hashtags && content.hashtags.length > limits.hashtagMaxCount) {
      errors.push(`ハッシュタグが多すぎます（最大${limits.hashtagMaxCount}個）`);
    }

    // プラットフォーム固有のバリデーション
    switch (this.platform) {
      case 'tiktok':
        if (content.media.length === 0) {
          errors.push('TikTokには動画が必須です');
        }
        if (content.media.some(m => m.type !== 'video')) {
          errors.push('TikTokは動画のみ対応しています');
        }
        break;

      case 'x':
        if (content.text.length === 0 && content.media.length === 0) {
          errors.push('Xには本文またはメディアが必要です');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * モックアカウント情報を生成
   */
  private generateMockAccountData(): AccountInfo {
    const platformSpecific = {
      instagram: {
        username: 'test_instagram_user',
        displayName: 'Test Instagram Account',
        followersCount: 1250
      },
      x: {
        username: 'test_x_user',
        displayName: 'Test X Account', 
        followersCount: 890
      },
      facebook: {
        username: 'test.facebook.user',
        displayName: 'Test Facebook Page',
        followersCount: 2100
      },
      tiktok: {
        username: 'test_tiktok_user',
        displayName: 'Test TikTok Account',
        followersCount: 5600
      }
    };

    const data = platformSpecific[this.platform as keyof typeof platformSpecific] || {
      username: `test_${this.platform}_user`,
      displayName: `Test ${this.platform} Account`,
      followersCount: 100
    };

    return {
      id: `mock_${this.platform}_${Date.now()}`,
      username: data.username,
      displayName: data.displayName,
      profilePicture: `https://via.placeholder.com/150x150?text=${this.platform}`,
      isVerified: false,
      followersCount: data.followersCount,
      isBusinessAccount: true
    };
  }

  /**
   * アカウント情報取得（モック）
   */
  async getAccountInfo(): Promise<AccountInfo> {
    await this.simulateNetworkDelay();
    this.maybeThrowMockError('アカウント情報取得');
    return this.mockAccountData;
  }

  /**
   * 投稿実行（モック）
   */
  async publishPost(content: PostContent, options?: PostOptions): Promise<PostResult> {
    await this.simulateNetworkDelay();
    this.maybeThrowMockError('投稿実行');

    // バリデーション
    const validation = this.validateContent(content);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    this.mockPostCounter++;
    const postId = `mock_${this.platform}_post_${this.mockPostCounter}_${Date.now()}`;

    this.log('info', '📤 Mock post published', {
      postId,
      contentLength: content.text.length,
      mediaCount: content.media.length,
      options
    });

    return {
      success: true,
      postId,
      url: `https://mock-${this.platform}.example.com/posts/${postId}`,
      platformResponse: {
        mockTimestamp: new Date().toISOString(),
        mockEngagement: {
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 10)
        }
      }
    };
  }

  /**
   * 投稿スケジュール（モック）
   */
  async schedulePost(content: PostContent, scheduleAt: Date, options?: PostOptions): Promise<PostResult> {
    await this.simulateNetworkDelay();
    this.maybeThrowMockError('投稿スケジュール');

    const validation = this.validateContent(content);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    this.mockPostCounter++;
    const postId = `mock_scheduled_${this.platform}_${this.mockPostCounter}_${Date.now()}`;

    this.log('info', '📅 Mock post scheduled', {
      postId,
      scheduleAt: scheduleAt.toISOString(),
      contentLength: content.text.length
    });

    return {
      success: true,
      postId,
      scheduledFor: scheduleAt,
      url: `https://mock-${this.platform}.example.com/scheduled/${postId}`
    };
  }

  /**
   * 投稿削除（モック）
   */
  async deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
    await this.simulateNetworkDelay();
    this.maybeThrowMockError('投稿削除');

    this.log('info', '🗑️ Mock post deleted', { postId });

    return { success: true };
  }

  /**
   * 認証確認（モック）
   */
  async validateCredentials(): Promise<{ isValid: boolean; error?: string }> {
    await this.simulateNetworkDelay(100); // 短い遅延
    
    // 10%の確率で認証エラーをシミュレート
    if (Math.random() < 0.1) {
      return {
        isValid: false,
        error: 'Mock authentication expired'
      };
    }

    return { isValid: true };
  }

  /**
   * 認証更新（モック）
   */
  async refreshCredentials(): Promise<{ success: boolean; credentials?: AuthCredentials; error?: string }> {
    await this.simulateNetworkDelay();
    
    const newCredentials: AuthCredentials = {
      accessToken: `mock_refreshed_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000), // 1時間後
      scope: ['publish', 'read'],
      userId: this.mockAccountData.id
    };

    return {
      success: true,
      credentials: newCredentials
    };
  }

  /**
   * エラーハンドリング（モック）
   */
  handlePlatformError(error: any): { type: 'auth' | 'ratelimit' | 'content' | 'network' | 'platform' | 'unknown'; message: string; retryable: boolean; retryAfter?: number } {
    // モックエラーの種類をランダムに選択
    const errorTypes = ['auth', 'ratelimit', 'content', 'network', 'platform'] as const;
    const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)];

    const errorMessages = {
      auth: 'Mock authentication error',
      ratelimit: 'Mock rate limit exceeded',
      content: 'Mock content validation error',
      network: 'Mock network error',
      platform: 'Mock platform error'
    };

    return {
      type: randomType,
      message: errorMessages[randomType],
      retryable: randomType !== 'auth' && randomType !== 'content',
      retryAfter: randomType === 'ratelimit' ? 3600 : undefined
    };
  }

  /**
   * サポート機能一覧（モック）
   */
  getSupportedFeatures() {
    const baseFeatures = {
      scheduling: true,
      stories: false,
      liveVideo: false,
      polls: false,
      carousel: true,
      video: true,
      location: true,
      hashtags: true,
      mentions: true,
      comments: true,
      analytics: false
    };

    // プラットフォーム別の特性を反映
    switch (this.platform) {
      case 'instagram':
        return { ...baseFeatures, stories: true, carousel: true };
      case 'x':
        return { ...baseFeatures, polls: true, carousel: false };
      case 'tiktok':
        return { ...baseFeatures, video: true, carousel: false, location: false };
      default:
        return baseFeatures;
    }
  }

  /**
   * コンテンツ最適化（モック）
   */
  optimizeContent(content: PostContent): PostContent {
    const limits = this.getLimits();
    
    return {
      ...content,
      text: this.truncateText(content.text, limits.textMaxLength),
      hashtags: content.hashtags?.slice(0, limits.hashtagMaxCount),
      media: content.media.slice(0, limits.mediaMaxCount)
    };
  }

  /**
   * ネットワーク遅延シミュレート
   */
  private async simulateNetworkDelay(baseMs = 500): Promise<void> {
    const delay = baseMs + Math.random() * 1000; // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * ランダムエラー発生
   */
  private maybeThrowMockError(operation: string): void {
    if (Math.random() * 100 < this.mockErrorRate) {
      throw new Error(`Mock error during ${operation} (${this.mockErrorRate}% error rate)`);
    }
  }
}