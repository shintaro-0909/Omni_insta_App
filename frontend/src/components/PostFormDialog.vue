<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        {{ isEditing ? 'コンテンツを編集' : '新しいコンテンツを作成' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="isFormValid">
          <!-- 画像URL入力 -->
          <div class="mb-4">
            <v-label class="text-subtitle-2 font-weight-bold mb-2">
              画像URL *
            </v-label>
            <div
              v-for="(_, index) in form.mediaUrls"
              :key="index"
              class="d-flex align-center mb-2"
            >
              <v-text-field
                v-model="form.mediaUrls[index]"
                :rules="[rules.required, rules.url]"
                placeholder="https://example.com/image.jpg"
                variant="outlined"
                density="compact"
                class="flex-grow-1"
              />
              <v-btn
                v-if="form.mediaUrls.length > 1"
                icon="mdi-close"
                variant="text"
                size="small"
                color="error"
                class="ml-2"
                @click="removeMediaUrl(index)"
              />
            </div>
            <v-btn
              variant="outlined"
              size="small"
              @click="addMediaUrl"
              :disabled="form.mediaUrls.length >= 10"
            >
              <v-icon start>mdi-plus</v-icon>
              画像を追加
            </v-btn>
            <div class="text-caption text-grey-darken-1 mt-1">
              最大10枚まで追加できます
            </div>
          </div>

          <!-- キャプション入力 -->
          <v-textarea
            v-model="form.caption"
            label="キャプション *"
            :rules="[rules.required]"
            placeholder="投稿の説明を入力してください..."
            variant="outlined"
            rows="4"
            counter="2200"
            class="mb-4"
          />

          <!-- タグ入力 -->
          <v-combobox
            v-model="form.tags"
            label="タグ"
            placeholder="タグを入力してEnterキーを押してください"
            variant="outlined"
            multiple
            chips
            closable-chips
            class="mb-4"
          >
            <template #chip="{ props, item }">
              <v-chip
                v-bind="props"
                :text="item.raw"
                size="small"
                closable
              />
            </template>
          </v-combobox>

          <!-- Instagram風プレビュー -->
          <div v-if="hasValidMedia">
            <v-label class="text-subtitle-2 font-weight-bold mb-2">
              Instagram投稿プレビュー
            </v-label>
            <InstagramPreview
              :post="previewPost"
              :account-data="selectedAccount"
              :allow-edit="true"
              class="mb-4"
              @update:location="updateLocation"
              @update:estimated-likes="updateEstimatedLikes"
              @hashtag-click="addHashtagFromPreview"
            />
          </div>

          <!-- 従来のシンプルプレビュー -->
          <div v-else-if="form.mediaUrls[0] && isValidUrl(form.mediaUrls[0])">
            <v-label class="text-subtitle-2 font-weight-bold mb-2">
              画像プレビュー
            </v-label>
            <v-card variant="outlined" class="mb-4">
              <v-img
                :src="form.mediaUrls[0]"
                height="200"
                cover
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular indeterminate />
                  </div>
                </template>
                <template #error>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon size="64" color="grey-lighten-2">
                      mdi-image-broken-variant
                    </v-icon>
                  </div>
                </template>
              </v-img>
              <v-card-text>
                <div class="text-body-2">
                  {{ form.caption }}
                </div>
                <div class="mt-2">
                  <v-chip
                    v-for="tag in form.tags"
                    :key="tag"
                    size="small"
                    variant="outlined"
                    class="mr-1"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleCancel"
        >
          キャンセル
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSave"
          :loading="loading"
          :disabled="!isFormValid"
        >
          {{ isEditing ? '更新' : '作成' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { usePostsStore, type Post, type CreatePostData, type UpdatePostData } from '@/stores/posts'
import { usePreviewStore, type PreviewPost, type PreviewAccount } from '@/stores/preview'
import { useIgAccountsStore } from '@/stores/igAccounts'
import InstagramPreview from './InstagramPreview.vue'

interface Props {
  modelValue: boolean
  post?: Post | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const postsStore = usePostsStore()
const previewStore = usePreviewStore()
const igAccountsStore = useIgAccountsStore()

// State
const formRef = ref()
const isFormValid = ref(false)
const loading = ref(false)
const previewLocation = ref('')
const estimatedLikes = ref(120)

// Form data
const form = ref({
  mediaUrls: [''],
  caption: '',
  tags: [] as string[]
})

// Computed
const isEditing = computed(() => !!props.post)

const hasValidMedia = computed(() => {
  return form.value.mediaUrls.some(url => url && isValidUrl(url))
})

const previewPost = computed((): PreviewPost => ({
  id: props.post?.id,
  mediaUrls: form.value.mediaUrls.filter(url => url && isValidUrl(url)),
  caption: form.value.caption,
  tags: form.value.tags,
  location: previewLocation.value,
  estimatedLikes: estimatedLikes.value
}))

const selectedAccount = computed((): PreviewAccount | undefined => {
  // 最初のアクティブなアカウントを選択
  const account = igAccountsStore.accounts[0]
  if (!account) return undefined
  
  return {
    id: account.id,
    username: account.username,
    name: account.name,
    profilePictureUrl: account.profilePictureUrl,
    followersCount: 1000, // デフォルト値
    avgLikes: estimatedLikes.value
  }
})

// Validation rules
const rules = {
  required: (value: string) => !!value || '必須項目です',
  url: (value: string) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return '有効なURLを入力してください'
    }
  }
}

// Methods
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const addMediaUrl = () => {
  if (form.value.mediaUrls.length < 10) {
    form.value.mediaUrls.push('')
  }
}

const removeMediaUrl = (index: number) => {
  if (form.value.mediaUrls.length > 1) {
    form.value.mediaUrls.splice(index, 1)
  }
}

// Preview methods
const updateLocation = (location: string) => {
  previewLocation.value = location
}

const updateEstimatedLikes = (likes: number) => {
  estimatedLikes.value = likes
}

const addHashtagFromPreview = (hashtag: string) => {
  if (!form.value.tags.includes(hashtag)) {
    form.value.tags.push(hashtag)
  }
}

const resetForm = () => {
  form.value = {
    mediaUrls: [''],
    caption: '',
    tags: []
  }
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const loadPostData = () => {
  if (props.post) {
    form.value = {
      mediaUrls: [...props.post.mediaUrls],
      caption: props.post.caption,
      tags: [...props.post.tags]
    }
  } else {
    resetForm()
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
  nextTick(() => {
    resetForm()
  })
}

const handleSave = async () => {
  if (!isFormValid.value) return

  try {
    loading.value = true

    // 空のURLを除去
    const validMediaUrls = form.value.mediaUrls.filter(url => url.trim() !== '')
    
    if (validMediaUrls.length === 0) {
      throw new Error('少なくとも1つの画像URLが必要です')
    }

    if (isEditing.value && props.post) {
      // 更新
      const updateData: UpdatePostData = {
        postId: props.post.id,
        mediaUrls: validMediaUrls,
        caption: form.value.caption.trim(),
        tags: form.value.tags.filter(tag => tag.trim() !== '')
      }
      await postsStore.updatePost(updateData)
    } else {
      // 新規作成
      const createData: CreatePostData = {
        mediaUrls: validMediaUrls,
        caption: form.value.caption.trim(),
        tags: form.value.tags.filter(tag => tag.trim() !== '')
      }
      await postsStore.createPost(createData)
    }

    emit('saved')
    emit('update:modelValue', false)
    resetForm()
  } catch (error) {
    console.error('保存エラー:', error)
  } finally {
    loading.value = false
  }
}

// Watch for dialog open/close
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    nextTick(() => {
      loadPostData()
      // IGアカウントを読み込み
      igAccountsStore.fetchAccounts()
    })
  }
})

// Watch for form changes to update preview
watch(() => previewPost.value, (newPost) => {
  if (hasValidMedia.value && selectedAccount.value) {
    previewStore.setPreviewPost(newPost)
    previewStore.setPreviewAccount(selectedAccount.value)
  }
}, { deep: true })
</script>

<style scoped>
.v-card {
  overflow-y: auto;
  max-height: 90vh;
}
</style> 