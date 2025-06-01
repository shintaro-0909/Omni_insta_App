<template>
  <div class="instagram-preview">
    <!-- プレビューヘッダー -->
    <div class="preview-header">
      <v-icon icon="mdi-instagram" color="primary" class="mr-2" />
      <span class="preview-title">Instagram投稿プレビュー</span>
      <v-spacer />
      <v-btn
        v-if="allowEdit"
        icon="mdi-fullscreen"
        variant="text"
        size="small"
        @click="openFullscreen"
      />
    </div>

    <!-- Instagram風カード -->
    <v-card class="instagram-card" elevation="2" rounded="xl">
      <!-- 投稿ヘッダー -->
      <div class="post-header">
        <div class="d-flex align-center">
          <v-avatar size="32" class="profile-avatar">
            <v-img
              v-if="accountData?.profilePictureUrl"
              :src="accountData.profilePictureUrl"
              :alt="accountData.username"
            />
            <v-icon v-else icon="mdi-account-circle" />
          </v-avatar>

          <div class="profile-info ml-3">
            <div class="username">
              {{ accountData?.username || 'username' }}
            </div>
            <div class="location" v-if="post.location">{{ post.location }}</div>
          </div>
        </div>

        <v-btn icon="mdi-dots-horizontal" variant="text" size="small" />
      </div>

      <!-- 投稿画像 -->
      <div class="post-media">
        <div
          v-if="post.mediaUrls && post.mediaUrls.length > 0"
          class="media-container"
        >
          <!-- 単一画像 -->
          <div v-if="post.mediaUrls.length === 1" class="single-media">
            <v-img
              :src="post.mediaUrls[0]"
              aspect-ratio="1"
              cover
              class="post-image"
            >
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular indeterminate color="primary" />
                </div>
              </template>
            </v-img>
          </div>

          <!-- カルーセル画像 -->
          <div v-else class="carousel-media">
            <v-carousel
              v-model="currentSlide"
              height="400"
              hide-delimiters
              show-arrows="hover"
              class="post-carousel"
            >
              <v-carousel-item
                v-for="(mediaUrl, index) in post.mediaUrls"
                :key="index"
                :src="mediaUrl"
                cover
              />
            </v-carousel>

            <!-- カルーセルインジケーター -->
            <div class="carousel-indicators">
              <div
                v-for="(_, index) in post.mediaUrls"
                :key="index"
                class="indicator"
                :class="{ active: index === currentSlide }"
                @click="currentSlide = index"
              />
            </div>
          </div>
        </div>

        <!-- 画像がない場合のプレースホルダー -->
        <div v-else class="media-placeholder">
          <v-icon size="64" color="grey-lighten-2">mdi-image-outline</v-icon>
          <div class="placeholder-text">画像を選択してください</div>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="post-actions">
        <div class="action-buttons">
          <v-btn icon="mdi-heart-outline" variant="text" size="small" />
          <v-btn icon="mdi-chat-outline" variant="text" size="small" />
          <v-btn icon="mdi-send-outline" variant="text" size="small" />
        </div>
        <v-btn icon="mdi-bookmark-outline" variant="text" size="small" />
      </div>

      <!-- いいね数 -->
      <div class="post-likes">
        <strong>{{ formatNumber(estimatedLikes) }}件のいいね</strong>
      </div>

      <!-- キャプション -->
      <div class="post-caption">
        <div class="caption-content">
          <strong class="username">{{
            accountData?.username || 'username'
          }}</strong>
          <span class="caption-text" v-html="formattedCaption"></span>
        </div>

        <!-- ハッシュタグ -->
        <div v-if="hashtags.length > 0" class="hashtags">
          <span
            v-for="(tag, index) in hashtags"
            :key="index"
            class="hashtag"
            @click="selectHashtag(tag)"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <!-- 投稿時間 -->
      <div class="post-time">
        {{ formatPostTime }}
      </div>
    </v-card>

    <!-- プレビュー設定 -->
    <v-card
      v-if="allowEdit"
      class="preview-settings mt-4"
      elevation="0"
      rounded="xl"
    >
      <v-card-title class="text-subtitle-1">
        <v-icon icon="mdi-tune" class="mr-2" />
        プレビュー設定
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="settings.location"
              label="位置情報"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-map-marker"
              @update:model-value="updateLocation"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="settings.estimatedLikes"
              label="推定いいね数"
              type="number"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-heart"
              @update:model-value="updateEstimatedLikes"
            />
          </v-col>
          <v-col cols="12">
            <v-switch
              v-model="settings.showHashtags"
              label="ハッシュタグを表示"
              color="primary"
              @update:model-value="updateHashtagsVisibility"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- フルスクリーンダイアログ -->
    <v-dialog v-model="fullscreenDialog" fullscreen>
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Instagram投稿プレビュー</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" @click="fullscreenDialog = false" />
        </v-toolbar>

        <div class="fullscreen-content">
          <div class="preview-container">
            <!-- フルスクリーン版のプレビュー -->
            <div class="instagram-preview-large">
              <InstagramPreview
                :post="post"
                :account-data="accountData"
                :scheduled-at="scheduledAt"
                :allow-edit="false"
                class="large-preview"
              />
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';

  // Props
  interface Props {
    post: {
      id?: string;
      mediaUrls: string[];
      caption: string;
      tags?: string[];
      location?: string;
    };
    accountData?: {
      id: string;
      username: string;
      name?: string;
      profilePictureUrl?: string;
    };
    scheduledAt?: Date | string;
    allowEdit?: boolean;
    estimatedLikesDefault?: number;
  }

  interface Emits {
    (e: 'update:location', value: string): void;
    (e: 'update:estimatedLikes', value: number): void;
    (e: 'hashtag-click', tag: string): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    allowEdit: true,
    estimatedLikesDefault: 120,
  });

  const emit = defineEmits<Emits>();

  // State
  const currentSlide = ref(0);
  const fullscreenDialog = ref(false);
  const estimatedLikes = ref(props.estimatedLikesDefault);

  // プレビュー設定
  const settings = ref({
    location: props.post.location || '',
    estimatedLikes: props.estimatedLikesDefault,
    showHashtags: true,
  });

  // Computed
  const formattedCaption = computed(() => {
    if (!props.post.caption) return '';

    let formatted = props.post.caption;

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

    // 改行を<br>に変換
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  });

  const hashtags = computed(() => {
    if (!settings.value.showHashtags || !props.post.tags) return [];
    return props.post.tags;
  });

  const formatPostTime = computed(() => {
    if (!props.scheduledAt) return '投稿予定時刻未設定';

    const date =
      typeof props.scheduledAt === 'string'
        ? new Date(props.scheduledAt)
        : props.scheduledAt;

    const now = new Date();
    const diffMinutes = Math.floor(
      (date.getTime() - now.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 0) {
      return `${Math.abs(diffMinutes)}分前`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分後に投稿予定`;
    } else if (diffMinutes < 1440) {
      // 24時間
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}時間後に投稿予定`;
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  });

  // Methods
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const openFullscreen = () => {
    fullscreenDialog.value = true;
  };

  const selectHashtag = (tag: string) => {
    emit('hashtag-click', tag);
  };

  const updateLocation = (value: string) => {
    settings.value.location = value;
    emit('update:location', value);
  };

  const updateEstimatedLikes = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      estimatedLikes.value = num;
      settings.value.estimatedLikes = num;
      emit('update:estimatedLikes', num);
    }
  };

  const updateHashtagsVisibility = (value: boolean | null) => {
    settings.value.showHashtags = value ?? true;
  };

  // Watchers
  watch(
    () => props.post.location,
    newLocation => {
      settings.value.location = newLocation || '';
    }
  );

  watch(
    () => props.estimatedLikesDefault,
    newDefault => {
      estimatedLikes.value = newDefault;
      settings.value.estimatedLikes = newDefault;
    }
  );
</script>

<style scoped>
  /* 🎨 Instagram風プレビューのスタイル */

  .instagram-preview {
    max-width: 400px;
    margin: 0 auto;
  }

  .preview-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
    border-radius: 12px 12px 0 0;
    border: 1px solid #e2e8f0;
    border-bottom: none;
  }

  .preview-title {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.875rem;
  }

  .instagram-card {
    border: 1px solid #dbdbdb;
    border-radius: 0 0 12px 12px;
    background: #ffffff;
    overflow: hidden;
  }

  /* 投稿ヘッダー */
  .post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid #efefef;
  }

  .profile-avatar {
    border: 1px solid #dbdbdb;
  }

  .profile-info {
    flex: 1;
  }

  .username {
    font-weight: 600;
    font-size: 0.875rem;
    color: #262626;
    line-height: 1.2;
  }

  .location {
    font-size: 0.75rem;
    color: #8e8e8e;
    line-height: 1.2;
  }

  /* 投稿メディア */
  .post-media {
    position: relative;
    aspect-ratio: 1;
    background: #000000;
  }

  .media-container {
    width: 100%;
    height: 100%;
  }

  .single-media {
    width: 100%;
    height: 100%;
  }

  .post-image {
    width: 100%;
    height: 100%;
  }

  .carousel-media {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .post-carousel {
    width: 100%;
    height: 100%;
  }

  .carousel-indicators {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 4px;
    z-index: 2;
  }

  .indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .indicator.active {
    background: rgba(255, 255, 255, 1);
  }

  .media-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    background: #f8f9fa;
    color: #6c757d;
  }

  .placeholder-text {
    margin-top: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* アクション */
  .post-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  /* いいね数 */
  .post-likes {
    padding: 0 16px 8px;
    font-size: 0.875rem;
    color: #262626;
  }

  /* キャプション */
  .post-caption {
    padding: 0 16px;
    margin-bottom: 8px;
  }

  .caption-content {
    font-size: 0.875rem;
    line-height: 1.4;
    color: #262626;
    word-wrap: break-word;
  }

  .caption-text {
    margin-left: 4px;
  }

  :deep(.caption-link) {
    color: #00376b;
    text-decoration: none;
  }

  :deep(.mention) {
    color: #00376b;
    font-weight: 600;
  }

  .hashtags {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hashtag {
    color: #00376b;
    cursor: pointer;
    font-size: 0.875rem;
    transition: opacity 0.2s ease;
  }

  .hashtag:hover {
    opacity: 0.7;
  }

  /* 投稿時間 */
  .post-time {
    padding: 0 16px 12px;
    font-size: 0.75rem;
    color: #8e8e8e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* プレビュー設定 */
  .preview-settings {
    border: 1px solid #e2e8f0;
    background: white;
  }

  /* フルスクリーン */
  .fullscreen-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    padding: 20px;
  }

  .preview-container {
    max-width: 500px;
    width: 100%;
  }

  .instagram-preview-large {
    transform: scale(1.2);
    transform-origin: center;
  }

  /* アニメーション */
  .instagram-card {
    animation: fadeInUp 0.4s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* レスポンシブ */
  @media (max-width: 768px) {
    .instagram-preview {
      max-width: 100%;
    }

    .fullscreen-content {
      padding: 10px;
    }

    .instagram-preview-large {
      transform: none;
    }
  }

  /* ダークモード対応 */
  @media (prefers-color-scheme: dark) {
    .instagram-card {
      background: #000000;
      border-color: #262626;
    }

    .post-header {
      border-bottom-color: #262626;
    }

    .username,
    .caption-content,
    .post-likes {
      color: #ffffff;
    }

    .location,
    .post-time {
      color: #8e8e8e;
    }
  }
</style>
