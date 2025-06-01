<template>
  <v-container>
    <!-- ページヘッダー -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <h1 class="text-h3 font-weight-bold">コンテンツライブラリ</h1>
        <p class="text-h6 text-grey-darken-1 mt-2">
          投稿用のコンテンツを管理します
        </p>
      </v-col>
      <v-col cols="12" md="4" class="text-md-right">
        <v-btn color="primary" size="large" @click="showCreateDialog = true">
          <v-icon start>mdi-plus</v-icon>
          新しいコンテンツ
        </v-btn>
      </v-col>
    </v-row>

    <!-- 統計情報 -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4">
          <div class="text-h4 font-weight-bold text-primary">
            {{ postsStore.postsCount }}
          </div>
          <div class="text-body-2 text-grey-darken-1">総コンテンツ数</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4">
          <div class="text-h4 font-weight-bold text-success">
            {{ postsStore.allTags.length }}
          </div>
          <div class="text-body-2 text-grey-darken-1">タグ数</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- フィルター -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedTags"
          :items="postsStore.allTags"
          label="タグでフィルター"
          multiple
          chips
          clearable
          @update:model-value="handleTagFilter"
        >
          <template #chip="{ props, item }">
            <v-chip v-bind="props" :text="item.raw" size="small" closable />
          </template>
        </v-select>
      </v-col>
      <v-col cols="12" md="6" class="text-md-right">
        <v-btn
          variant="outlined"
          @click="refreshPosts"
          :loading="postsStore.loading"
        >
          <v-icon start>mdi-refresh</v-icon>
          更新
        </v-btn>
      </v-col>
    </v-row>

    <!-- コンテンツ一覧 -->
    <v-row>
      <v-col
        v-for="post in postsStore.posts"
        :key="post.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card elevation="2" class="mb-4">
          <!-- 画像プレビュー -->
          <v-img
            :src="post.mediaUrls[0]"
            height="200"
            cover
            class="cursor-pointer"
            @click="viewPost(post)"
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-icon size="64" color="grey-lighten-2"> mdi-image </v-icon>
              </div>
            </template>

            <!-- 複数画像インジケーター -->
            <div
              v-if="post.mediaUrls.length > 1"
              class="position-absolute"
              style="top: 8px; right: 8px"
            >
              <v-chip size="small" color="black" variant="flat">
                <v-icon start size="small">mdi-image-multiple</v-icon>
                {{ post.mediaUrls.length }}
              </v-chip>
            </div>
          </v-img>

          <v-card-text>
            <!-- キャプション -->
            <div
              class="text-body-2 mb-2"
              style="height: 60px; overflow: hidden"
            >
              {{ post.caption }}
            </div>

            <!-- タグ -->
            <div class="mb-2">
              <v-chip
                v-for="tag in post.tags.slice(0, 3)"
                :key="tag"
                size="x-small"
                variant="outlined"
                class="mr-1 mb-1"
              >
                {{ tag }}
              </v-chip>
              <v-chip
                v-if="post.tags.length > 3"
                size="x-small"
                variant="outlined"
                class="mr-1 mb-1"
              >
                +{{ post.tags.length - 3 }}
              </v-chip>
            </div>

            <!-- 統計情報 -->
            <div
              class="d-flex justify-space-between align-center text-caption text-grey-darken-1"
            >
              <span>投稿回数: {{ post.timesPosted }}</span>
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn variant="text" size="small" @click="editPost(post)">
              <v-icon start>mdi-pencil</v-icon>
              編集
            </v-btn>
            <v-spacer />
            <v-btn
              variant="text"
              size="small"
              color="error"
              @click="confirmDelete(post)"
            >
              <v-icon start>mdi-delete</v-icon>
              削除
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 無限スクロール -->
    <div v-if="postsStore.hasMore" class="text-center py-4">
      <v-btn
        variant="outlined"
        @click="loadMorePosts"
        :loading="postsStore.loading"
      >
        さらに読み込む
      </v-btn>
    </div>

    <!-- 空の状態 -->
    <div
      v-if="!postsStore.loading && postsStore.postsCount === 0"
      class="text-center py-16"
    >
      <v-icon size="120" color="grey-lighten-2" class="mb-4">
        mdi-image-multiple-outline
      </v-icon>
      <h2 class="text-h5 font-weight-bold mb-4">コンテンツがありません</h2>
      <p class="text-body-1 text-grey-darken-1 mb-6">
        最初のコンテンツを作成して、予約投稿を始めましょう！
      </p>
      <v-btn color="primary" size="large" @click="showCreateDialog = true">
        <v-icon start>mdi-plus</v-icon>
        新しいコンテンツを作成
      </v-btn>
    </div>

    <!-- 作成・編集ダイアログ -->
    <PostFormDialog
      v-model="showCreateDialog"
      :post="editingPost"
      @saved="handlePostSaved"
    />

    <!-- 詳細表示ダイアログ -->
    <PostViewDialog
      v-model="showViewDialog"
      :post="viewingPost"
      @edit="editPost"
      @delete="confirmDelete"
    />

    <!-- 削除確認ダイアログ -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6"> コンテンツを削除 </v-card-title>
        <v-card-text>
          このコンテンツを削除してもよろしいですか？<br />
          この操作は取り消せません。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">
            キャンセル
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="handleDelete"
            :loading="postsStore.loading"
          >
            削除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- エラースナックバー -->
    <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
      {{ postsStore.error }}
      <template #actions>
        <v-btn variant="text" @click="postsStore.clearError"> 閉じる </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { usePostsStore, type Post } from '@/stores';
  import { format } from 'date-fns';
  import { ja } from 'date-fns/locale';
  import { PostFormDialog, PostViewDialog } from '@/components';

  const postsStore = usePostsStore();

  // State
  const showCreateDialog = ref(false);
  const showViewDialog = ref(false);
  const showDeleteDialog = ref(false);
  const editingPost = ref<Post | null>(null);
  const viewingPost = ref<Post | null>(null);
  const deletingPost = ref<Post | null>(null);
  const selectedTags = ref<string[]>([]);

  // Computed
  const showError = computed({
    get: () => !!postsStore.error,
    set: () => postsStore.clearError(),
  });

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

  const confirmDelete = (post: Post) => {
    deletingPost.value = post;
    showDeleteDialog.value = true;
    showViewDialog.value = false;
  };

  const handleDelete = async () => {
    if (deletingPost.value) {
      try {
        await postsStore.deletePost(deletingPost.value.id);
        showDeleteDialog.value = false;
        deletingPost.value = null;
      } catch (error) {
        console.error('削除エラー:', error);
      }
    }
  };

  const handlePostSaved = () => {
    showCreateDialog.value = false;
    editingPost.value = null;
  };

  const formatDate = (date: Date) => {
    return format(date, 'MM/dd HH:mm', { locale: ja });
  };

  // Lifecycle
  onMounted(async () => {
    await postsStore.loadPosts(true);
  });
</script>

<style scoped>
  .cursor-pointer {
    cursor: pointer;
  }

  .position-absolute {
    position: absolute;
  }
</style>
