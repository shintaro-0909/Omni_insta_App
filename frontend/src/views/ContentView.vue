<template>
  <div class="content-layout">
    <!-- サイドバーナビゲーション -->
    <SidebarNavigation />
    
    <div class="content-view">

    <!-- ヒーローセクション -->
    <section class="hero">
      <div class="floating-elements">
        <div class="floating-circle circle-1"></div>
        <div class="floating-circle circle-2"></div>
        <div class="floating-circle circle-3"></div>
      </div>

      <div class="hero-container-simplified">
        <div class="hero-content-centered">
          <h1>コンテンツ <span class="gradient-text">ライブラリ</span></h1>
          <p class="hero-description">
            Instagram投稿用のコンテンツを一元管理。
            画像、キャプション、タグを整理し、簡単に再利用できます。
          </p>
          <div class="hero-actions">
            <button class="cta-button primary" @click="showCreateDialog = true">
              🎨 新しいコンテンツ作成
            </button>
          </div>
        </div>

      </div>
    </section>

    <div class="content-content">
      <!-- 統計情報セクション -->
      <section class="stats-section">
        <div class="section-header">
          <h2 class="section-title">📊 コンテンツ統計</h2>
          <p class="section-description">ライブラリに保存されたコンテンツの状況をひと目で確認</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card gradient-primary">
            <div class="stat-icon">🖼️</div>
            <div class="stat-content">
              <div class="stat-value">{{ postsStore.postsCount }}</div>
              <div class="stat-title">総コンテンツ</div>
              <div class="stat-trend">
                <span class="trend-positive">ライブラリ総数</span>
              </div>
            </div>
          </div>

          <div class="stat-card gradient-success">
            <div class="stat-icon">🏷️</div>
            <div class="stat-content">
              <div class="stat-value">{{ postsStore.allTags.length }}</div>
              <div class="stat-title">タグ数</div>
              <div class="stat-trend">
                <span class="trend-positive">整理タグ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- フィルターセクション -->
      <section class="filters-section">
        <div class="filters-container">
          <div class="filter-group">
            <label class="filter-label">タグでフィルター</label>
            <div class="tag-filter">
              <div class="selected-tags">
                <span 
                  v-for="tag in selectedTags" 
                  :key="tag" 
                  class="selected-tag"
                  @click="removeTag(tag)"
                >
                  {{ tag }} ✕
                </span>
              </div>
              <select 
                v-model="tempTag" 
                class="tag-select"
                @change="addTag"
              >
                <option value="">タグを選択...</option>
                <option 
                  v-for="tag in postsStore.allTags" 
                  :key="tag" 
                  :value="tag"
                  :disabled="selectedTags.includes(tag)"
                >
                  {{ tag }}
                </option>
              </select>
            </div>
          </div>

          <div class="filter-actions">
            <button class="filter-refresh-button" @click="refreshPosts" :disabled="postsStore.loading">
              🔄 更新
            </button>
            <button v-if="selectedTags.length > 0" class="filter-clear-button" @click="clearTags">
              🗑️ クリア
            </button>
          </div>
        </div>
      </section>

      <!-- コンテンツ一覧セクション -->
      <section class="content-list-section">
        <div class="section-header">
          <h2 class="section-title">🖼️ コンテンツ一覧</h2>
        </div>

        <!-- エラー表示 -->
        <div v-if="postsStore.error" class="error-alert">
          <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{{ postsStore.error }}</span>
            <button class="error-close" @click="postsStore.clearError">✕</button>
          </div>
        </div>

        <!-- コンテンツグリッド -->
        <div v-if="postsStore.postsCount > 0" class="content-grid">
          <div
            v-for="post in postsStore.posts"
            :key="post.id"
            class="content-card"
            @click="viewPost(post)"
          >
            <!-- 画像プレビュー -->
            <div class="content-image">
              <img 
                v-if="post.mediaUrls && post.mediaUrls[0]" 
                :src="post.mediaUrls[0]" 
                :alt="post.caption" 
                class="image-thumbnail"
              />
              <div v-else class="image-placeholder">
                🖼️
              </div>
              
              <!-- 複数画像インジケーター -->
              <div v-if="post.mediaUrls && post.mediaUrls.length > 1" class="media-count">
                🖼️ {{ post.mediaUrls.length }}
              </div>
            </div>

            <!-- コンテンツ情報 -->
            <div class="content-info">
              <!-- キャプション -->
              <div class="content-caption">
                {{ post.caption || 'キャプションなし' }}
              </div>

              <!-- タグ -->
              <div class="content-tags">
                <span 
                  v-for="tag in post.tags.slice(0, 3)" 
                  :key="tag" 
                  class="content-tag"
                >
                  {{ tag }}
                </span>
                <span v-if="post.tags.length > 3" class="content-tag more">
                  +{{ post.tags.length - 3 }}
                </span>
              </div>

              <!-- 統計情報 -->
              <div class="content-stats">
                <div class="stats-item">
                  <span class="stats-label">📲 投稿回数:</span>
                  <span class="stats-value">{{ post.timesPosted }}</span>
                </div>
                <div class="stats-item">
                  <span class="stats-label">📅 作成日:</span>
                  <span class="stats-value">{{ formatDate(post.createdAt) }}</span>
                </div>
              </div>

              <!-- アクション -->
              <div class="content-actions">
                <button 
                  class="action-button edit"
                  @click.stop="editPost(post)"
                  title="編集"
                >
                  ✏️ 編集
                </button>
                <button 
                  class="action-button delete"
                  @click.stop="confirmDelete(post)"
                  title="削除"
                >
                  🗑️ 削除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空の状態 -->
        <div 
          v-else-if="!postsStore.loading && postsStore.postsCount === 0" 
          class="empty-state"
        >
          <div class="empty-icon">🎨</div>
          <div class="empty-title">コンテンツがありません</div>
          <div class="empty-description">
            最初のコンテンツを作成して、Instagram予約投稿を始めましょう！<br>
            画像、キャプション、タグを一元管理できます。
          </div>
          <button class="cta-button primary" @click="showCreateDialog = true">
            🎨 最初のコンテンツを作成
          </button>
        </div>

        <!-- 無限スクロール -->
        <div 
          v-if="postsStore.hasMore" 
          class="load-more-section"
        >
          <button 
            class="load-more-button" 
            @click="loadMorePosts"
            :disabled="postsStore.loading"
          >
            <span v-if="postsStore.loading">読み込み中...</span>
            <span v-else>さらに読み込む</span>
          </button>
        </div>
      </section>
    </div>

    <!-- 作成・編集ダイアログ -->
    <PostFormDialog
      v-model="showCreateDialog"
      :post="editingPost"
      @created="handlePostSaved"
      @updated="handlePostSaved"
    />

    <!-- 詳細表示ダイアログ -->
    <PostViewDialog
      v-model="showViewDialog"
      :post="viewingPost"
      @edit="editPost"
      @delete="confirmDelete"
    />

  </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { usePostsStore, type Post } from '@/stores';
  import { format } from 'date-fns';
  import { ja } from 'date-fns/locale';
  import { PostFormDialog, PostViewDialog, SidebarNavigation } from '@/components';
  import { useNotification, useConfirm } from '@/composables';

  const route = useRoute();
  const postsStore = usePostsStore();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();
  const { confirmPostDelete } = useConfirm();

  // State
  const showCreateDialog = ref(false);
  const showViewDialog = ref(false);
  const editingPost = ref<Post | null>(null);
  const viewingPost = ref<Post | null>(null);
  const selectedTags = ref<string[]>([]);
  const tempTag = ref('');

  // Methods
  const refreshPosts = async () => {
    await postsStore.loadPosts(true, selectedTags.value);
  };

  const loadMorePosts = async () => {
    await postsStore.loadPosts(false, selectedTags.value);
  };

  const handleTagFilter = async () => {
    await postsStore.loadPosts(true, selectedTags.value);
  };

  const editPost = (post: Post) => {
    editingPost.value = post;
    showCreateDialog.value = true;
    showViewDialog.value = false;
  };

  const viewPost = (post: Post) => {
    viewingPost.value = post;
    showViewDialog.value = true;
  };

  const confirmDelete = async (post: Post) => {
    const confirmed = await confirmPostDelete(post.caption);
    if (confirmed) {
      try {
        await postsStore.deletePost(post.id);
        notifySuccess('コンテンツ削除完了', 'コンテンツをライブラリから削除しました。');
        showViewDialog.value = false;
      } catch (error) {
        console.error('削除エラー:', error);
        notifyError('削除エラー', 'コンテンツの削除中にエラーが発生しました。もう一度お試しください。');
      }
    }
  };

  const handlePostSaved = () => {
    showCreateDialog.value = false;
    editingPost.value = null;
    notifyInfo('コンテンツ更新', 'ライブラリが最新の状態に更新されました。');
  };

  const formatDate = (date: Date) => {
    return format(date, 'MM/dd HH:mm', { locale: ja });
  };

  const addTag = () => {
    if (tempTag.value && !selectedTags.value.includes(tempTag.value)) {
      selectedTags.value.push(tempTag.value);
      tempTag.value = '';
      handleTagFilter();
    }
  };

  const removeTag = (tag: string) => {
    selectedTags.value = selectedTags.value.filter(t => t !== tag);
    handleTagFilter();
  };

  const clearTags = () => {
    selectedTags.value = [];
    handleTagFilter();
  };

  // Lifecycle
  onMounted(async () => {
    try {
      await postsStore.loadPosts(true);
      
      // Check for query parameters to trigger actions
      if (route.query.action === 'add') {
        showCreateDialog.value = true;
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      notifyError('データ読み込みエラー', 'コンテンツの読み込み中にエラーが発生しました。ページを再読み込みしてください。');
    }
  });
</script>

<style scoped>
/* LP-demo.htmlと統一されたスタイルシステム */
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --bg-light: #f7fafc;
  --white: #ffffff;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
}

/* フルスクリーンレイアウトサポート */
.content-layout {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: white;
  overflow-x: hidden;
  display: flex;
}

.content-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
  flex: 1;
  margin-left: 72px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* サイドバーが開いている場合のマージン調整 */
@media (min-width: 768px) {
  .content-view {
    margin-left: 280px;
  }
}

/* スマホ用調整 */
@media (max-width: 767px) {
  .content-view {
    margin-left: 0;
  }
}

/* 統一ナビゲーション */
.omniy-nav {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 1rem 0;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-primary);
}

.cta-button {
  background: var(--primary-gradient);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  border: none;
  cursor: pointer;
  display: inline-block;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* ヒーローセクション */
.hero {
  margin-top: 80px;
  padding: 4rem 2rem 6rem;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
  position: relative;
  overflow: hidden;
}

.hero-container-simplified {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem 0;
}

.hero-content-centered {
  max-width: 800px;
  margin: 0 auto;
}

.hero-content-centered h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 3rem;
}

/* 浮遊する要素 */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: var(--primary-gradient);
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  background: var(--secondary-gradient);
  top: 60%;
  right: 10%;
  animation-delay: 5s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  background: var(--accent-gradient);
  bottom: 20%;
  left: 15%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(20px, 30px) scale(1.05); }
}


/* メインコンテンツ */
.content-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

/* 統計セクション */
.stats-section {
  margin-bottom: 6rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.gradient-primary { background: var(--primary-gradient); }
.gradient-success { background: var(--success-gradient); }

.stat-icon {
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.stat-title {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.stat-trend {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* フィルターセクション */
.filters-section {
  margin-bottom: 3rem;
}

.filters-container {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  display: flex;
  gap: 2rem;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
}

.filter-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
}

.tag-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-height: 2rem;
}

.selected-tag {
  background: var(--primary-gradient);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.selected-tag:hover {
  opacity: 0.8;
}

.tag-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tag-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-actions {
  display: flex;
  gap: 1rem;
}

.filter-refresh-button,
.filter-clear-button {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.filter-refresh-button {
  background: var(--accent-gradient);
  color: white;
}

.filter-clear-button {
  background: var(--bg-light);
  color: var(--text-secondary);
  border: 2px solid #e2e8f0;
}

.filter-refresh-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.filter-clear-button:hover {
  border-color: #cbd5e0;
  color: var(--text-primary);
}

.filter-refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* エラー表示 */
.error-alert {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 1.5rem;
  color: #dc2626;
}

.error-text {
  flex: 1;
  color: #991b1b;
  font-weight: 500;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #991b1b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.error-close:hover {
  background: rgba(185, 28, 28, 0.1);
}

/* コンテンツグリッド */
.content-list-section {
  margin-bottom: 4rem;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.content-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.content-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.content-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.image-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.content-card:hover .image-thumbnail {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--text-secondary);
}

.media-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.content-info {
  padding: 1.5rem;
}

.content-caption {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  height: 3rem;
  overflow: hidden;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.content-tag {
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.content-tag.more {
  background: var(--bg-light);
  color: var(--text-secondary);
}

.content-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.stats-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.stats-label {
  color: var(--text-secondary);
}

.stats-value {
  color: var(--text-primary);
  font-weight: 500;
}

.content-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.action-button {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
}

.action-button.edit {
  background: var(--accent-gradient);
  color: white;
}

.action-button.delete {
  background: var(--bg-light);
  color: var(--text-secondary);
  border: 2px solid #e2e8f0;
}

.action-button:hover {
  transform: translateY(-2px);
}

.action-button.edit:hover {
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.action-button.delete:hover {
  border-color: #f56565;
  color: #e53e3e;
}

/* 空の状態 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* ロードモア */
.load-more-section {
  text-align: center;
  margin-top: 3rem;
}

.load-more-button {
  background: var(--bg-light);
  color: var(--text-primary);
  border: 2px solid #e2e8f0;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-button:hover {
  border-color: #667eea;
  background: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 削除ダイアログ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.delete-dialog {
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  max-width: 400px;
  width: 90%;
  overflow: hidden;
}

.dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dialog-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.dialog-content {
  padding: 1.5rem;
}

.dialog-message {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.dialog-actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.dialog-button {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.dialog-button.secondary {
  background: var(--bg-light);
  color: var(--text-primary);
  border: 2px solid #e2e8f0;
}

.dialog-button.secondary:hover {
  border-color: #cbd5e0;
}

.dialog-button.danger {
  background: var(--secondary-gradient);
  color: white;
}

.dialog-button.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
}

.dialog-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .hero-content-centered h1 {
    font-size: 2.5rem;
  }

  .hero-container-simplified {
    padding: 1rem 0;
  }

  .nav-links {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    justify-content: center;
  }

  .section-title {
    font-size: 2rem;
  }
}</style>
