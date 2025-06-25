/**
 * 🏭 Social Media Adapter Factory
 * 
 * [FACTORY-001] プラットフォーム別アダプター生成・DI制御
 * - Feature Flag による実API/Mock切り替え
 * - プラットフォーム別クレデンシャル管理
 * - エラーハンドリング・ログ統一
 * - テスト環境での完全分離
 */
import { 
  BaseSocialMediaAdapter, 
  Platform, 
  AuthCredentials 
} from './baseAdapter';
import { MockSocialMediaAdapter } from './mockAdapter';
// import { InstagramAdapter } from './instagramAdapter'; // 将来実装
// import { XAdapter } from './xAdapter'; // 将来実装
// import { FacebookAdapter } from './facebookAdapter'; // 将来実装
// import { TikTokAdapter } from './tiktokAdapter'; // 将来実装

export interface AdapterConfig {
  enableRealPosting: boolean;
  mockErrorRate?: number;
  timeout?: number;
  retryAttempts?: number;
}

export interface PlatformCredentials {
  platform: Platform;
  credentials: AuthCredentials;
  isActive: boolean;
  lastValidated?: Date;
  errors?: string[];
}

/**
 * アダプターファクトリークラス
 */
export class SocialMediaAdapterFactory {
  private static instance: SocialMediaAdapterFactory;
  private adapters = new Map<string, BaseSocialMediaAdapter>();
  private config: AdapterConfig;

  private constructor(config: AdapterConfig) {
    this.config = config;
  }

  /**
   * シングルトンインスタンス取得
   */
  static getInstance(config?: AdapterConfig): SocialMediaAdapterFactory {
    if (!SocialMediaAdapterFactory.instance) {
      const defaultConfig: AdapterConfig = {
        enableRealPosting: process.env.ENABLE_REAL_POST === 'true',
        mockErrorRate: 0,
        timeout: 30000,
        retryAttempts: 3
      };
      
      SocialMediaAdapterFactory.instance = new SocialMediaAdapterFactory(
        config || defaultConfig
      );
    }
    return SocialMediaAdapterFactory.instance;
  }

  /**
   * プラットフォーム別アダプター作成
   */
  async createAdapter(
    platform: Platform, 
    credentials: AuthCredentials
  ): Promise<BaseSocialMediaAdapter> {
    const adapterKey = `${platform}_${credentials.userId || 'default'}`;

    // キャッシュされたアダプターがあれば返す
    if (this.adapters.has(adapterKey)) {
      const existingAdapter = this.adapters.get(adapterKey)!;
      
      // 認証の有効性を確認
      try {
        const validation = await existingAdapter.validateCredentials();
        if (validation.isValid) {
          return existingAdapter;
        } else {
          console.warn(`[ADAPTER] Cached adapter for ${platform} is invalid, creating new one`);
          this.adapters.delete(adapterKey);
        }
      } catch (error) {
        console.error(`[ADAPTER] Error validating cached adapter for ${platform}:`, error);
        this.adapters.delete(adapterKey);
      }
    }

    // 新しいアダプターを作成
    const adapter = await this.createNewAdapter(platform, credentials);
    this.adapters.set(adapterKey, adapter);
    
    console.log(`[ADAPTER] Created new ${platform} adapter (real: ${this.config.enableRealPosting})`);
    return adapter;
  }

  /**
   * 新しいアダプターの実際の作成処理
   */
  private async createNewAdapter(
    platform: Platform, 
    credentials: AuthCredentials
  ): Promise<BaseSocialMediaAdapter> {
    
    // 実投稿が無効な場合はモックアダプターを返す
    if (!this.config.enableRealPosting) {
      return new MockSocialMediaAdapter(
        platform, 
        credentials, 
        this.config.mockErrorRate || 0
      );
    }

    // プラットフォーム別の実アダプター作成
    switch (platform) {
      case 'instagram':
        // 将来実装: 実際のInstagram Graph API
        console.warn(`[ADAPTER] Real Instagram adapter not implemented yet, using mock`);
        return new MockSocialMediaAdapter(platform, credentials, 0);

      case 'x':
        // 将来実装: X (Twitter) API v2
        console.warn(`[ADAPTER] Real X adapter not implemented yet, using mock`);
        return new MockSocialMediaAdapter(platform, credentials, 0);

      case 'facebook':
        // 将来実装: Facebook Graph API
        console.warn(`[ADAPTER] Real Facebook adapter not implemented yet, using mock`);
        return new MockSocialMediaAdapter(platform, credentials, 0);

      case 'tiktok':
        // 将来実装: TikTok for Business API
        console.warn(`[ADAPTER] Real TikTok adapter not implemented yet, using mock`);
        return new MockSocialMediaAdapter(platform, credentials, 0);

      case 'linkedin':
        // 将来実装: LinkedIn API
        console.warn(`[ADAPTER] Real LinkedIn adapter not implemented yet, using mock`);
        return new MockSocialMediaAdapter(platform, credentials, 0);

      default:
        console.warn(`[ADAPTER] Unknown platform: ${platform}, using mock`);
        return new MockSocialMediaAdapter(platform, credentials, 0);
    }
  }

  /**
   * 複数プラットフォームに同時投稿
   */
  async publishToMultiplePlatforms(
    platformCredentials: PlatformCredentials[],
    content: any,
    options?: any
  ): Promise<Record<Platform, any>> {
    const results: Record<Platform, any> = {};
    const activeCredentials = platformCredentials.filter(pc => pc.isActive);

    console.log(`[ADAPTER] Publishing to ${activeCredentials.length} platforms`);

    // 並列実行で各プラットフォームに投稿
    const publishPromises = activeCredentials.map(async (pc) => {
      try {
        const adapter = await this.createAdapter(pc.platform, pc.credentials);
        const result = await adapter.publishPost(content, options);
        
        results[pc.platform] = {
          success: true,
          result
        };
        
        console.log(`[ADAPTER] ✅ Published to ${pc.platform}: ${result.postId}`);
      } catch (error) {
        console.error(`[ADAPTER] ❌ Failed to publish to ${pc.platform}:`, error);
        
        results[pc.platform] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    await Promise.allSettled(publishPromises);
    return results;
  }

  /**
   * 全プラットフォームの認証状態確認
   */
  async validateAllCredentials(
    platformCredentials: PlatformCredentials[]
  ): Promise<Record<Platform, { isValid: boolean; error?: string }>> {
    const results: Record<Platform, { isValid: boolean; error?: string }> = {};

    const validationPromises = platformCredentials.map(async (pc) => {
      try {
        const adapter = await this.createAdapter(pc.platform, pc.credentials);
        const validation = await adapter.validateCredentials();
        
        results[pc.platform] = validation;
      } catch (error) {
        results[pc.platform] = {
          isValid: false,
          error: error instanceof Error ? error.message : 'Validation failed'
        };
      }
    });

    await Promise.allSettled(validationPromises);
    return results;
  }

  /**
   * プラットフォーム別投稿制限取得
   */
  getPlatformLimits(platform: Platform) {
    // モックアダプターから制限を取得（実装は共通）
    const mockAdapter = new MockSocialMediaAdapter(platform, { accessToken: 'dummy' });
    return mockAdapter.getLimits();
  }

  /**
   * サポートされているプラットフォーム一覧
   */
  getSupportedPlatforms(): Platform[] {
    return ['instagram', 'x', 'facebook', 'tiktok', 'linkedin'];
  }

  /**
   * プラットフォーム別サポート機能取得
   */
  getPlatformFeatures(platform: Platform) {
    const mockAdapter = new MockSocialMediaAdapter(platform, { accessToken: 'dummy' });
    return mockAdapter.getSupportedFeatures();
  }

  /**
   * 設定更新
   */
  updateConfig(newConfig: Partial<AdapterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 設定変更により既存のアダプターをクリア
    this.adapters.clear();
    
    console.log(`[ADAPTER] Config updated:`, this.config);
  }

  /**
   * キャッシュクリア
   */
  clearCache(): void {
    this.adapters.clear();
    console.log(`[ADAPTER] Adapter cache cleared`);
  }

  /**
   * 統計情報取得
   */
  getStats() {
    return {
      cachedAdapters: this.adapters.size,
      config: this.config,
      supportedPlatforms: this.getSupportedPlatforms()
    };
  }
}

/**
 * ファクトリーのデフォルトインスタンス取得ヘルパー
 */
export function getAdapterFactory(): SocialMediaAdapterFactory {
  return SocialMediaAdapterFactory.getInstance();
}

/**
 * 単一プラットフォーム用の簡易ヘルパー
 */
export async function createSingleAdapter(
  platform: Platform, 
  credentials: AuthCredentials
): Promise<BaseSocialMediaAdapter> {
  const factory = getAdapterFactory();
  return factory.createAdapter(platform, credentials);
}