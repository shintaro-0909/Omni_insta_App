<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-image-plus</v-icon>
        {{ post ? '投稿を編集' : '新しい投稿を作成' }}
        <v-spacer />
        <v-btn icon variant="text" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="handleSubmit">
          <!-- Simple Media URL Input -->
          <v-text-field
            v-model="form.mediaUrls[0]"
            label="画像URL"
            placeholder="https://example.com/image.jpg"
            variant="outlined"
            :rules="urlRules"
            class="mb-3"
          />

          <!-- Caption -->
          <v-textarea
            v-model="form.caption"
            label="キャプション"
            placeholder="素敵な写真をシェア！ #instagram #photo"
            variant="outlined"
            rows="4"
            counter="2200"
            :rules="captionRules"
            class="mb-3"
          />

          <!-- Tags Input -->
          <v-combobox
            v-model="form.tags"
            label="タグ"
            placeholder="タグを入力してEnter"
            variant="outlined"
            multiple
            chips
            clearable
            :delimiters="[',', ' ', '#']"
            class="mb-3"
          >
            <template #chip="{ props, item }">
              <v-chip v-bind="props" color="primary" size="small">
                #{{ item.raw }}
              </v-chip>
            </template>
          </v-combobox>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-btn variant="outlined" @click="handleClose" :disabled="loading">
          キャンセル
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!canSubmit"
        >
          <v-icon start>mdi-content-save</v-icon>
          {{ post ? '更新' : '作成' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    usePostsStore,
    type Post,
    type CreatePostData,
    type UpdatePostData,
  } from '@/stores';

  interface Props {
    modelValue: boolean;
    post?: Post | null;
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'created', post: Post): void;
    (e: 'updated', post: Post): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const postsStore = usePostsStore();

  // Form data
  const form = ref({
    mediaUrls: [''],
    caption: '',
    tags: [] as string[],
  });

  const loading = ref(false);

  // Validation rules
  const urlRules = [
    (v: string) => !!v || 'URLは必須です',
    (v: string) => {
      try {
        new URL(v);
        return true;
      } catch {
        return '有効なURLを入力してください';
      }
    },
  ];

  const captionRules = [
    (v: string) =>
      v.length <= 2200 || 'キャプションは2200文字以内で入力してください',
  ];

  // Computed
  const canSubmit = computed(() => {
    return form.value.mediaUrls[0] && form.value.caption;
  });

  // Methods
  const handleClose = () => {
    emit('update:modelValue', false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!canSubmit.value) return;

    loading.value = true;

    try {
      const postData: CreatePostData = {
        mediaUrls: form.value.mediaUrls.filter(url => url.trim()),
        caption: form.value.caption,
        tags: form.value.tags,
      };

      if (props.post) {
        const updateData: UpdatePostData = {
          postId: props.post.id,
          mediaUrls: postData.mediaUrls,
          caption: postData.caption,
          tags: postData.tags,
        };
        await postsStore.updatePost(updateData);
        // Create a mock updated post object for the emit
        const updated = {
          ...props.post!,
          ...postData,
          updatedAt: new Date(),
        };
        emit('updated', updated);
      } else {
        const postId = await postsStore.createPost(postData);
        // Create a mock post object for the emit
        const created = {
          id: postId,
          ...postData,
          ownerUid: 'mock-uid',
          timesPosted: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        emit('created', created);
      }

      emit('update:modelValue', false);
      resetForm();
    } catch (error) {
      console.error('Post submission error:', error);
    } finally {
      loading.value = false;
    }
  };

  const resetForm = () => {
    form.value = {
      mediaUrls: [''],
      caption: '',
      tags: [],
    };
  };

  // Initialize form when editing
  if (props.post) {
    form.value = {
      mediaUrls: props.post.mediaUrls || [''],
      caption: props.post.caption || '',
      tags: props.post.tags || [],
    };
  }
</script>

<style scoped>
  .post-form-dialog {
    border-radius: 16px !important;
  }
</style>
