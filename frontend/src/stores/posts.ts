import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebase';
// import { measureAsync } from '@/utils/api/performance' // temporarily disabled
// import { useOptimizedFetch } from '@/composables/api/useOptimizedFetch'
// import { usePersistedCache, createCachedStoreAction } from '@/composables/api/usePersistedCache'
// TODO: Re-enable when these composables are implemented

// Mock implementations for development (unused but kept for future re-enabling)
// const createCachedStoreAction = (fn: any) => fn

// 投稿コンテンツの型定義
export interface Post {
  id: string;
  ownerUid: string;
  mediaUrls: string[];
  caption: string;
  tags: string[];
  timesPosted: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostData {
  mediaUrls: string[];
  caption: string;
  tags: string[];
}

export interface UpdatePostData {
  postId: string;
  mediaUrls?: string[];
  caption?: string;
  tags?: string[];
}

export const usePostsStore = defineStore('posts', () => {
  // State - use shallowRef for better performance with arrays
  const posts = shallowRef<Post[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasMore = ref(true);
  const lastPostId = ref<string | null>(null);

  // Cached computations for better performance
  const cachedTags = ref<string[]>([]);
  const lastTagsUpdate = ref<number>(0);

  // Getters with memoization
  const postsCount = computed(() => posts.value.length);

  // Memoized posts by tag function
  const postsByTagCache = new Map<string, Post[]>();
  const postsByTag = computed(() => (tag: string) => {
    const cacheKey = `${tag}-${posts.value.length}-${posts.value[0]?.id || 'empty'}`;
    if (!postsByTagCache.has(cacheKey)) {
      const filtered = posts.value.filter(post => post.tags.includes(tag));
      postsByTagCache.set(cacheKey, filtered);

      // Cleanup old cache entries
      if (postsByTagCache.size > 50) {
        const oldestKey = postsByTagCache.keys().next().value;
        postsByTagCache.delete(oldestKey);
      }
    }
    return postsByTagCache.get(cacheKey)!;
  });

  // Memoized tags computation
  const allTags = computed(() => {
    const now = Date.now();

    // Cache tags for 30 seconds to avoid expensive recomputation
    if (now - lastTagsUpdate.value < 30000 && cachedTags.value.length > 0) {
      return cachedTags.value;
    }

    const tagSet = new Set<string>();
    posts.value.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });

    cachedTags.value = Array.from(tagSet).sort();
    lastTagsUpdate.value = now;

    return cachedTags.value;
  });

  // Actions
  const createPost = async (postData: CreatePostData) => {
    try {
      loading.value = true;
      error.value = null;

      // 開発環境用: デモモードで動作する場合のモック処理
      if (import.meta.env.DEV && (!functions || !navigator.onLine)) {
        // モックデータとして新しい投稿を作成
        const mockPost: Post = {
          id: `mock-post-${Date.now()}`,
          ownerUid: 'demo-user',
          mediaUrls: postData.mediaUrls.length > 0 ? postData.mediaUrls : ['https://picsum.photos/400/400?random=' + Date.now()],
          caption: postData.caption || 'デモ投稿です',
          tags: postData.tags.length > 0 ? postData.tags : ['demo', 'test'],
          timesPosted: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // 投稿を一覧の先頭に追加
        posts.value.unshift(mockPost);
        
        // キャッシュをクリア
        postsByTagCache.clear();
        lastTagsUpdate.value = 0;
        
        return mockPost.id;
      }

      const createPostFn = httpsCallable(functions, 'createPost');
      const result = await createPostFn(postData);
      const data = result.data as any;

      if (data.success) {
        // 新しい投稿を一覧の先頭に追加
        await loadPosts(true); // リフレッシュ
        return data.postId;
      } else {
        throw new Error('Failed to create post');
      }
    } catch (err: any) {
      error.value = err.message || '投稿の作成に失敗しました';
      console.error('投稿作成エラー:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create cached fetcher for posts (simplified mock implementation)
  const cachedPostsFetcher = async (
    tags?: string[],
    lastPostId?: string | null
  ) => {
    const getPostsFn = httpsCallable(functions, 'getPosts');
    const result = await getPostsFn({
      limit: 20,
      lastPostId: lastPostId,
      tags: tags,
    });
    const data = result.data as any;

    if (data.success) {
      return {
        posts: data.posts.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt.seconds * 1000),
          updatedAt: new Date(post.updatedAt.seconds * 1000),
        })),
        hasMore: data.hasMore,
        lastPostId: data.lastPostId,
      };
    } else {
      throw new Error('Failed to load posts');
    }
  };

  const loadPosts = async (refresh = false, tags?: string[]) => {
    try {
      loading.value = true;
      error.value = null;

      if (refresh) {
        posts.value = [];
        lastPostId.value = null;
        hasMore.value = true;
      }

      if (!hasMore.value && !refresh) {
        return;
      }

      // 開発環境用: デモモードで動作する場合のモック処理
      if (import.meta.env.DEV && (!functions || !navigator.onLine)) {
        // モックデータを生成
        const mockPosts: Post[] = [
          {
            id: 'mock-1',
            ownerUid: 'demo-user',
            mediaUrls: ['https://picsum.photos/400/600?random=1'],
            caption: '素敵な朝の風景✨ 今日も一日頑張りましょう！ #朝 #風景 #日常',
            tags: ['朝', '風景', '日常', 'モチベーション'],
            timesPosted: 2,
            createdAt: new Date('2025-06-08T08:00:00Z'),
            updatedAt: new Date('2025-06-08T08:00:00Z'),
          },
          {
            id: 'mock-2',
            ownerUid: 'demo-user',
            mediaUrls: [
              'https://picsum.photos/400/400?random=2',
              'https://picsum.photos/400/600?random=3'
            ],
            caption: 'おいしいカフェでひと休み☕️ 新しいメニューを試してみました！',
            tags: ['カフェ', 'コーヒー', 'グルメ', 'リラックス'],
            timesPosted: 1,
            createdAt: new Date('2025-06-07T14:30:00Z'),
            updatedAt: new Date('2025-06-07T14:30:00Z'),
          },
          {
            id: 'mock-3',
            ownerUid: 'demo-user',
            mediaUrls: ['https://picsum.photos/600/400?random=4'],
            caption: '夕日が綺麗でした🌅 自然の美しさに感動！',
            tags: ['夕日', '自然', '美しい', '癒し'],
            timesPosted: 0,
            createdAt: new Date('2025-06-06T18:45:00Z'),
            updatedAt: new Date('2025-06-06T18:45:00Z'),
          }
        ];

        // タグフィルタリング
        let filteredPosts = mockPosts;
        if (tags && tags.length > 0) {
          filteredPosts = mockPosts.filter(post => 
            tags.some(tag => post.tags.includes(tag))
          );
        }

        if (refresh) {
          posts.value = filteredPosts;
        } else {
          posts.value.push(...filteredPosts);
        }

        hasMore.value = false; // モックデータなので追加読み込みなし
        lastPostId.value = null;
        
        // キャッシュをクリア
        postsByTagCache.clear();
        lastTagsUpdate.value = 0;
        
        return;
      }

      // Use cached fetcher for better performance
      const result = await cachedPostsFetcher(tags, lastPostId.value);

      if (refresh) {
        posts.value = result.posts;
      } else {
        posts.value.push(...result.posts);
      }

      hasMore.value = result.hasMore;
      lastPostId.value = result.lastPostId;
    } catch (err: any) {
      error.value = err.message || '投稿の読み込みに失敗しました';
      console.error('投稿読み込みエラー:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getPost = async (postId: string): Promise<Post | null> => {
    try {
      loading.value = true;
      error.value = null;

      const getPostFn = httpsCallable(functions, 'getPost');
      const result = await getPostFn({ postId });
      const data = result.data as any;

      if (data.success) {
        const post = data.post;
        return {
          ...post,
          createdAt: new Date(post.createdAt.seconds * 1000),
          updatedAt: new Date(post.updatedAt.seconds * 1000),
        };
      } else {
        throw new Error('Failed to get post');
      }
    } catch (err: any) {
      error.value = err.message || '投稿の取得に失敗しました';
      console.error('投稿取得エラー:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePost = async (updateData: UpdatePostData) => {
    try {
      loading.value = true;
      error.value = null;

      const updatePostFn = httpsCallable(functions, 'updatePost');
      const result = await updatePostFn(updateData);
      const data = result.data as any;

      if (data.success) {
        // ローカルの投稿リストを更新
        const index = posts.value.findIndex(
          post => post.id === updateData.postId
        );
        if (index !== -1) {
          const updatedPost = await getPost(updateData.postId);
          if (updatedPost) {
            posts.value[index] = updatedPost;
          }
        }
      } else {
        throw new Error('Failed to update post');
      }
    } catch (err: any) {
      error.value = err.message || '投稿の更新に失敗しました';
      console.error('投稿更新エラー:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      loading.value = true;
      error.value = null;

      // 開発環境用: デモモードで動作する場合のモック処理
      if (import.meta.env.DEV && (!functions || !navigator.onLine)) {
        // ローカルの投稿リストから削除
        posts.value = posts.value.filter(post => post.id !== postId);
        
        // キャッシュをクリア
        postsByTagCache.clear();
        lastTagsUpdate.value = 0;
        
        return;
      }

      const deletePostFn = httpsCallable(functions, 'deletePost');
      const result = await deletePostFn({ postId });
      const data = result.data as any;

      if (data.success) {
        // ローカルの投稿リストから削除
        posts.value = posts.value.filter(post => post.id !== postId);
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (err: any) {
      error.value = err.message || '投稿の削除に失敗しました';
      console.error('投稿削除エラー:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
    posts.value = [];
    loading.value = false;
    error.value = null;
    hasMore.value = true;
    lastPostId.value = null;
  };

  return {
    // State
    posts,
    loading,
    error,
    hasMore,
    // Getters
    postsCount,
    postsByTag,
    allTags,
    // Actions
    createPost,
    loadPosts,
    getPost,
    updatePost,
    deletePost,
    clearError,
    reset,
  };
});
