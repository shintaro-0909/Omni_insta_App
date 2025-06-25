/**
 * 🧪 Mock Adapter Unit Tests
 * 
 * [TEST-001] モックアダプターの包括的テスト
 * - プラットフォーム別制限・機能の検証
 * - エラーシミュレーション・ネットワーク遅延テスト  
 * - バリデーション・最適化機能テスト
 * - 実API呼び出しなしでの完全テスト
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockSocialMediaAdapter } from '../mockAdapter';
import { Platform, AuthCredentials, PostContent } from '../baseAdapter';

describe('MockSocialMediaAdapter', () => {
  let mockCredentials: AuthCredentials;
  let mockContent: PostContent;

  beforeEach(() => {
    mockCredentials = {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      expiresAt: new Date(Date.now() + 3600000),
      userId: 'mock_user_id'
    };

    mockContent = {
      text: 'Test post content #test',
      media: [
        {
          type: 'image',
          url: 'https://example.com/image.jpg',
          alt: 'Test image'
        }
      ],
      hashtags: ['#test', '#mock'],
      mentions: ['@testuser']
    };
  });

  describe('Platform-specific Limits', () => {
    it('returns correct Instagram limits', () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const limits = adapter.getLimits();

      expect(limits.textMaxLength).toBe(2200);
      expect(limits.mediaMaxCount).toBe(10);
      expect(limits.hashtagMaxCount).toBe(30);
      expect(limits.rateLimits.postsPerHour).toBe(5);
      expect(limits.rateLimits.postsPerDay).toBe(25);
    });

    it('returns correct X (Twitter) limits', () => {
      const adapter = new MockSocialMediaAdapter('x', mockCredentials);
      const limits = adapter.getLimits();

      expect(limits.textMaxLength).toBe(280);
      expect(limits.mediaMaxCount).toBe(4);
      expect(limits.hashtagMaxCount).toBe(5);
      expect(limits.rateLimits.postsPerHour).toBe(15);
      expect(limits.rateLimits.postsPerDay).toBe(100);
    });

    it('returns correct TikTok limits', () => {
      const adapter = new MockSocialMediaAdapter('tiktok', mockCredentials);
      const limits = adapter.getLimits();

      expect(limits.textMaxLength).toBe(2200);
      expect(limits.mediaMaxCount).toBe(1);
      expect(limits.videoMaxDuration).toBe(10 * 60);
      expect(limits.imageMaxSize).toBe(0); // 画像投稿不可
      expect(limits.supportedMediaTypes).toEqual(['video/mp4']);
    });

    it('returns correct Facebook limits', () => {
      const adapter = new MockSocialMediaAdapter('facebook', mockCredentials);
      const limits = adapter.getLimits();

      expect(limits.textMaxLength).toBe(63206);
      expect(limits.videoMaxDuration).toBe(240 * 60); // 4時間
      expect(limits.videoMaxSize).toBe(4 * 1024 * 1024 * 1024); // 4GB
    });
  });

  describe('Content Validation', () => {
    it('validates valid content', () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const validation = adapter.validateContent(mockContent);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('rejects content exceeding text limit', () => {
      const adapter = new MockSocialMediaAdapter('x', mockCredentials);
      const longContent = {
        ...mockContent,
        text: 'a'.repeat(300) // X limit is 280
      };

      const validation = adapter.validateContent(longContent);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('テキストが長すぎます（最大280文字）');
    });

    it('rejects content with too many media items', () => {
      const adapter = new MockSocialMediaAdapter('x', mockCredentials);
      const mediaHeavyContent = {
        ...mockContent,
        media: Array(6).fill({ type: 'image', url: 'test.jpg' }) // X limit is 4
      };

      const validation = adapter.validateContent(mediaHeavyContent);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('メディアが多すぎます（最大4個）');
    });

    it('validates TikTok video requirement', () => {
      const adapter = new MockSocialMediaAdapter('tiktok', mockCredentials);
      const imageContent = {
        ...mockContent,
        media: [{ type: 'image', url: 'test.jpg' }]
      };

      const validation = adapter.validateContent(imageContent as any);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('TikTokは動画のみ対応しています');
    });
  });

  describe('Account Information', () => {
    it('returns platform-specific account data', async () => {
      const instagramAdapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const xAdapter = new MockSocialMediaAdapter('x', mockCredentials);

      const instagramAccount = await instagramAdapter.getAccountInfo();
      const xAccount = await xAdapter.getAccountInfo();

      expect(instagramAccount.username).toBe('test_instagram_user');
      expect(instagramAccount.followersCount).toBe(1250);

      expect(xAccount.username).toBe('test_x_user');
      expect(xAccount.followersCount).toBe(890);
    });

    it('generates consistent account data', async () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      
      const account1 = await adapter.getAccountInfo();
      const account2 = await adapter.getAccountInfo();

      expect(account1.id).toBe(account2.id);
      expect(account1.username).toBe(account2.username);
    });
  });

  describe('Post Publishing', () => {
    it('successfully publishes valid content', async () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const result = await adapter.publishPost(mockContent);

      expect(result.success).toBe(true);
      expect(result.postId).toMatch(/^mock_instagram_post_/);
      expect(result.url).toContain('mock-instagram.example.com');
      expect(result.platformResponse).toBeDefined();
    });

    it('fails to publish invalid content', async () => {
      const adapter = new MockSocialMediaAdapter('x', mockCredentials);
      const invalidContent = {
        text: 'a'.repeat(300),
        media: [],
        hashtags: [],
        mentions: []
      };

      const result = await adapter.publishPost(invalidContent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('テキストが長すぎます');
    });

    it('simulates post engagement data', async () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const result = await adapter.publishPost(mockContent);

      expect(result.platformResponse?.mockEngagement).toBeDefined();
      expect(typeof result.platformResponse.mockEngagement.likes).toBe('number');
      expect(typeof result.platformResponse.mockEngagement.comments).toBe('number');
    });
  });

  describe('Post Scheduling', () => {
    it('successfully schedules posts', async () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const scheduleAt = new Date(Date.now() + 3600000); // 1 hour later

      const result = await adapter.schedulePost(mockContent, scheduleAt);

      expect(result.success).toBe(true);
      expect(result.scheduledFor).toEqual(scheduleAt);
      expect(result.postId).toMatch(/^mock_scheduled_instagram_/);
    });

    it('validates content before scheduling', async () => {
      const adapter = new MockSocialMediaAdapter('x', mockCredentials);
      const invalidContent = { ...mockContent, text: 'a'.repeat(300) };
      const scheduleAt = new Date(Date.now() + 3600000);

      const result = await adapter.schedulePost(invalidContent, scheduleAt);

      expect(result.success).toBe(false);
      expect(result.error).toContain('テキストが長すぎます');
    });
  });

  describe('Error Simulation', () => {
    it('throws errors based on configured error rate', async () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials, 100); // 100% error rate
      
      await expect(adapter.publishPost(mockContent)).rejects.toThrow();
    });

    it('does not throw errors with 0% error rate', async () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials, 0);
      
      const result = await adapter.publishPost(mockContent);
      expect(result.success).toBe(true);
    });

    it('handles platform errors appropriately', () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const errorInfo = adapter.handlePlatformError(new Error('Test error'));

      expect(errorInfo).toHaveProperty('type');
      expect(errorInfo).toHaveProperty('message');
      expect(errorInfo).toHaveProperty('retryable');
      expect(['auth', 'ratelimit', 'content', 'network', 'platform'].includes(errorInfo.type)).toBe(true);
    });
  });

  describe('Platform Features', () => {
    it('returns Instagram-specific features', () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const features = adapter.getSupportedFeatures();

      expect(features.stories).toBe(true);
      expect(features.carousel).toBe(true);
      expect(features.video).toBe(true);
    });

    it('returns X-specific features', () => {
      const adapter = new MockSocialMediaAdapter('x', mockCredentials);
      const features = adapter.getSupportedFeatures();

      expect(features.polls).toBe(true);
      expect(features.carousel).toBe(false);
      expect(features.stories).toBe(false);
    });

    it('returns TikTok-specific features', () => {
      const adapter = new MockSocialMediaAdapter('tiktok', mockCredentials);
      const features = adapter.getSupportedFeatures();

      expect(features.video).toBe(true);
      expect(features.carousel).toBe(false);
      expect(features.location).toBe(false);
    });
  });

  describe('Content Optimization', () => {
    it('optimizes content for platform limits', () => {
      const adapter = new MockSocialMediaAdapter('x', mockCredentials);
      const longContent = {
        ...mockContent,
        text: 'a'.repeat(300),
        hashtags: Array(10).fill('#tag'),
        media: Array(6).fill({ type: 'image', url: 'test.jpg' })
      };

      const optimized = adapter.optimizeContent(longContent as any);

      expect(optimized.text.length).toBeLessThanOrEqual(280);
      expect(optimized.hashtags?.length).toBeLessThanOrEqual(5);
      expect(optimized.media.length).toBeLessThanOrEqual(4);
    });

    it('preserves content within limits', () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const optimized = adapter.optimizeContent(mockContent);

      expect(optimized.text).toBe(mockContent.text);
      expect(optimized.hashtags).toEqual(mockContent.hashtags);
      expect(optimized.media).toEqual(mockContent.media);
    });
  });

  describe('Authentication', () => {
    it('validates credentials with 90% success rate', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.05); // Below 0.1 threshold
      
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const validation = await adapter.validateCredentials();

      expect(validation.isValid).toBe(true);
    });

    it('fails credential validation 10% of the time', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.15); // Above 0.1 threshold
      
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const validation = await adapter.validateCredentials();

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Mock authentication expired');
    });

    it('refreshes credentials successfully', async () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const result = await adapter.refreshCredentials();

      expect(result.success).toBe(true);
      expect(result.credentials?.accessToken).toMatch(/^mock_refreshed_token_/);
      expect(result.credentials?.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('Post Management', () => {
    it('deletes posts successfully', async () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const result = await adapter.deletePost('mock_post_123');

      expect(result.success).toBe(true);
    });
  });

  describe('Network Simulation', () => {
    it('includes realistic network delays', async () => {
      const adapter = new MockSocialMediaAdapter('instagram', mockCredentials);
      const startTime = Date.now();
      
      await adapter.getAccountInfo();
      
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThan(400); // Minimum expected delay
    });
  });
});