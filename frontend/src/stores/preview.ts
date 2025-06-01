import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// プレビュー設定の型定義
export interface PreviewSettings {
  showRealTimePreview: boolean;
  defaultLikesRange: {
    min: number;
    max: number;
  };
  imageQuality: 'high' | 'medium' | 'low';
  showMetadata: boolean;
  previewMode: 'mobile' | 'desktop';
  darkMode: boolean;
}

// 投稿データの型定義
export interface PreviewPost {
  id?: string;
  mediaUrls: string[];
  caption: string;
  tags?: string[];
  location?: string;
  estimatedLikes?: number;
}

// アカウントデータの型定義
export interface PreviewAccount {
  id: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
  followersCount?: number;
  avgLikes?: number;
}

export const usePreviewStore = defineStore('preview', () => {
  // State
  const settings = ref<PreviewSettings>({
    showRealTimePreview: true,
    defaultLikesRange: {
      min: 50,
      max: 500,
    },
    imageQuality: 'high',
    showMetadata: true,
    previewMode: 'mobile',
    darkMode: false,
  });

  const currentPost = ref<PreviewPost | null>(null);
  const currentAccount = ref<PreviewAccount | null>(null);
  const scheduledTime = ref<Date | null>(null);
  const previewHistory = ref<PreviewPost[]>([]);

  // Getters
  const isPreviewReady = computed(() => {
    return !!(currentPost.value && currentAccount.value);
  });

  const estimatedEngagement = computed(() => {
    if (!currentAccount.value || !currentPost.value) return null;

    const followers = currentAccount.value.followersCount || 1000;
    const avgLikes =
      currentAccount.value.avgLikes || Math.floor(followers * 0.03);

    // ハッシュタグによるブースト計算
    const hashtagBoost = (currentPost.value.tags?.length || 0) * 0.05;

    // 時間帯による調整（仮想的な計算）
    const timeBoost = getTimeBoost();

    const estimatedLikes = Math.floor(
      avgLikes * (1 + hashtagBoost + timeBoost)
    );
    const estimatedComments = Math.floor(estimatedLikes * 0.02);
    const estimatedShares = Math.floor(estimatedLikes * 0.001);

    return {
      likes: estimatedLikes,
      comments: estimatedComments,
      shares: estimatedShares,
      engagementRate: (
        ((estimatedLikes + estimatedComments) / followers) *
        100
      ).toFixed(2),
    };
  });

  const formattedCaption = computed(() => {
    if (!currentPost.value?.caption) return '';

    return formatCaption(currentPost.value.caption);
  });

  const hashtagAnalysis = computed(() => {
    if (!currentPost.value?.tags) return null;

    const tags = currentPost.value.tags;

    return {
      total: tags.length,
      recommended: tags.length >= 5 && tags.length <= 15,
      popularTags: tags.filter(tag => isPopularHashtag(tag)),
      nicheTags: tags.filter(tag => !isPopularHashtag(tag)),
      suggestions: getHashtagSuggestions(tags),
    };
  });

  const previewMetrics = computed(() => {
    if (!currentPost.value) return null;

    return {
      imageCount: currentPost.value.mediaUrls.length,
      captionLength: currentPost.value.caption.length,
      hashtagCount: currentPost.value.tags?.length || 0,
      estimatedReach: calculateEstimatedReach(),
      optimalPosting: getOptimalPostingTime(),
    };
  });

  // Actions
  const setPreviewPost = (post: PreviewPost) => {
    currentPost.value = { ...post };

    // プレビュー履歴に追加
    if (post.id) {
      const existingIndex = previewHistory.value.findIndex(
        p => p.id === post.id
      );
      if (existingIndex >= 0) {
        previewHistory.value[existingIndex] = post;
      } else {
        previewHistory.value.unshift(post);
        // 履歴は最大20件まで
        if (previewHistory.value.length > 20) {
          previewHistory.value = previewHistory.value.slice(0, 20);
        }
      }
    }
  };

  const setPreviewAccount = (account: PreviewAccount) => {
    currentAccount.value = { ...account };
  };

  const setScheduledTime = (time: Date) => {
    scheduledTime.value = new Date(time);
  };

  const updateSettings = (newSettings: Partial<PreviewSettings>) => {
    settings.value = {
      ...settings.value,
      ...newSettings,
    };

    // ローカルストレージに保存
    localStorage.setItem(
      'instagram-preview-settings',
      JSON.stringify(settings.value)
    );
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('instagram-preview-settings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        settings.value = {
          ...settings.value,
          ...parsedSettings,
        };
      } catch (error) {
        console.warn('Failed to load preview settings:', error);
      }
    }
  };

  const generateEstimatedLikes = (): number => {
    const min = settings.value.defaultLikesRange.min;
    const max = settings.value.defaultLikesRange.max;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const optimizeCaption = (caption: string): string => {
    let optimized = caption;

    // 改行の最適化
    optimized = optimized.replace(/\n{3,}/g, '\n\n');

    // 絵文字の間隔調整
    optimized = optimized.replace(/([^\s])([🎉🔥💯✨🌟💖])/gu, '$1 $2');

    return optimized.trim();
  };

  const validatePost = (post: PreviewPost): string[] => {
    const issues: string[] = [];

    // 画像チェック
    if (!post.mediaUrls || post.mediaUrls.length === 0) {
      issues.push('画像が選択されていません');
    }

    // キャプションチェック
    if (!post.caption || post.caption.trim().length === 0) {
      issues.push('キャプションが入力されていません');
    } else if (post.caption.length > 2200) {
      issues.push('キャプションが長すぎます（2200文字以下推奨）');
    }

    // ハッシュタグチェック
    if (post.tags && post.tags.length > 30) {
      issues.push('ハッシュタグが多すぎます（30個以下推奨）');
    }

    return issues;
  };

  // Utility functions
  const formatCaption = (caption: string): string => {
    if (!caption) return '';

    let formatted = caption;

    // URLをリンクに変換
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" class="caption-link">$1</a>'
    );

    // @メンションをスタイル
    formatted = formatted.replace(
      /@(\w+)/g,
      '<span class="mention">@$1</span>'
    );

    // ハッシュタグをスタイル
    formatted = formatted.replace(
      /#(\w+)/g,
      '<span class="hashtag">#$1</span>'
    );

    // 改行を<br>に変換
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  };

  const isPopularHashtag = (tag: string): boolean => {
    // 人気ハッシュタグの簡易判定（実際のAPIと連携することも可能）
    const popularTags = [
      'instagood',
      'photooftheday',
      'love',
      'beautiful',
      'happy',
      'fashion',
      'followme',
      'nature',
      'travel',
      'art',
      'food',
      'style',
      'japan',
      'tokyo',
      'instagram',
    ];
    return popularTags.includes(tag.toLowerCase());
  };

  const getHashtagSuggestions = (currentTags: string[]): string[] => {
    // 関連ハッシュタグの提案（実際のAPIと連携可能）
    const suggestions = [
      'instagood',
      'photooftheday',
      'instalike',
      'instadaily',
      'followforfollow',
      'likeforlike',
      'instamood',
      'bestoftheday',
    ];

    return suggestions
      .filter(
        tag =>
          !currentTags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
      )
      .slice(0, 5);
  };

  const getTimeBoost = (): number => {
    if (!scheduledTime.value) return 0;

    const hour = scheduledTime.value.getHours();

    // ゴールデンタイムによるブースト
    if ((hour >= 19 && hour <= 21) || (hour >= 12 && hour <= 13)) {
      return 0.2; // 20%ブースト
    } else if (hour >= 9 && hour <= 11) {
      return 0.1; // 10%ブースト
    }

    return 0;
  };

  const calculateEstimatedReach = (): number => {
    if (!currentAccount.value) return 0;

    const followers = currentAccount.value.followersCount || 1000;
    const baseReach = followers * 0.05; // 5%の基本リーチ

    // ハッシュタグによる拡張リーチ
    const hashtagReach = (currentPost.value?.tags?.length || 0) * 50;

    return Math.floor(baseReach + hashtagReach);
  };

  const getOptimalPostingTime = (): string => {
    const now = new Date();
    const optimal = new Date(now);

    // 今日の19:00を基準とする
    optimal.setHours(19, 0, 0, 0);

    // 今日の19:00が過ぎていたら明日の19:00
    if (optimal <= now) {
      optimal.setDate(optimal.getDate() + 1);
    }

    return optimal.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearPreview = () => {
    currentPost.value = null;
    currentAccount.value = null;
    scheduledTime.value = null;
  };

  const exportPreview = (): string => {
    if (!currentPost.value || !currentAccount.value) return '';

    const data = {
      post: currentPost.value,
      account: currentAccount.value,
      scheduledTime: scheduledTime.value,
      engagement: estimatedEngagement.value,
      metrics: previewMetrics.value,
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  };

  // Initialize
  loadSettings();

  return {
    // State
    settings,
    currentPost,
    currentAccount,
    scheduledTime,
    previewHistory,

    // Getters
    isPreviewReady,
    estimatedEngagement,
    formattedCaption,
    hashtagAnalysis,
    previewMetrics,

    // Actions
    setPreviewPost,
    setPreviewAccount,
    setScheduledTime,
    updateSettings,
    loadSettings,
    generateEstimatedLikes,
    optimizeCaption,
    validatePost,
    clearPreview,
    exportPreview,
  };
});
