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
          <!-- 画像アップロード & URL入力 -->
          <div class="mb-4">
            <v-label class="text-subtitle-2 font-weight-bold mb-2">
              画像 *
            </v-label>
            
            <!-- Upload Mode Tabs -->
            <v-tabs v-model="uploadMode" class="mb-3">
              <v-tab value="upload">
                <v-icon start>mdi-upload</v-icon>
                ファイルアップロード
              </v-tab>
              <v-tab value="url">
                <v-icon start>mdi-link</v-icon>
                URL指定
              </v-tab>
            </v-tabs>

            <!-- File Upload Section -->
            <div v-if="uploadMode === 'upload'">
              <!-- Drag and Drop Area -->
              <div
                v-if="!imageUpload.hasFiles.value"
                class="upload-dropzone"
                :class="{ 'dragover': dragHandlers.isDragging.value }"
                v-bind="dragHandlers.dragHandlers"
                @click="imageUpload.selectFiles"
              >
                <div class="text-center pa-6">
                  <v-icon size="48" color="primary" class="mb-2">
                    mdi-cloud-upload
                  </v-icon>
                  <h4 class="text-h6 mb-2">画像をドラッグ&ドロップ</h4>
                  <p class="text-body-2 text-grey mb-3">
                    または、クリックしてファイルを選択
                  </p>
                  <v-btn color="primary" variant="outlined">
                    <v-icon start>mdi-folder-open</v-icon>
                    ファイルを選択
                  </v-btn>
                  <div class="text-caption text-grey-darken-1 mt-2">
                    JPEG, PNG, WebP対応 | 最大50MB | 最大10枚
                  </div>
                </div>
              </div>

              <!-- Upload Progress -->
              <div v-if="imageUpload.isCompressing.value" class="mb-3">
                <div class="d-flex align-center mb-2">
                  <v-icon color="primary" class="me-2">mdi-image-multiple</v-icon>
                  <span class="text-body-2">画像を最適化中...</span>
                </div>
                <v-progress-linear
                  :model-value="imageUpload.compressionProgress.value"
                  color="primary"
                  height="8"
                  rounded
                />
              </div>

              <!-- Uploaded Images -->
              <div v-if="imageUpload.hasFiles.value" class="uploaded-images">
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-subtitle-2 font-weight-bold">
                    アップロード済み画像 ({{ imageUpload.files.value.length }})
                  </span>
                  <div class="d-flex align-center">
                    <v-chip
                      v-if="imageUpload.totalSavings.value !== '0 Bytes'"
                      color="success"
                      variant="outlined"
                      size="small"
                      class="me-2"
                    >
                      <v-icon start size="16">mdi-download</v-icon>
                      {{ imageUpload.totalSavings.value }} 削減
                    </v-chip>
                    <v-btn
                      size="small"
                      variant="outlined"
                      @click="imageUpload.selectFiles"
                    >
                      <v-icon start>mdi-plus</v-icon>
                      追加
                    </v-btn>
                  </div>
                </div>

                <v-row>
                  <v-col
                    v-for="file in imageUpload.files.value"
                    :key="file.id"
                    cols="6"
                    md="4"
                  >
                    <v-card
                      class="image-preview-card"
                      :class="{
                        'error-card': file.status === 'error',
                        'processing-card': file.status === 'compressing'
                      }"
                    >
                      <div class="image-preview-wrapper">
                        <v-img
                          :src="file.previewUrl"
                          height="120"
                          cover
                        >
                          <template #placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                              <v-progress-circular indeterminate size="32" />
                            </div>
                          </template>
                        </v-img>
                        
                        <!-- Status Overlay -->
                        <div v-if="file.status === 'compressing'" class="status-overlay">
                          <v-progress-circular indeterminate size="24" color="white" />
                        </div>
                        
                        <div v-else-if="file.status === 'compressed'" class="status-overlay success">
                          <v-icon color="white" size="24">mdi-check-circle</v-icon>
                        </div>
                        
                        <div v-else-if="file.status === 'error'" class="status-overlay error">
                          <v-icon color="white" size="24">mdi-alert-circle</v-icon>
                        </div>

                        <!-- Remove Button -->
                        <v-btn
                          icon="mdi-close"
                          size="small"
                          color="error"
                          variant="elevated"
                          class="remove-btn"
                          @click="imageUpload.removeFile(file.id)"
                        />
                      </div>

                      <!-- Compression Info -->
                      <v-card-text v-if="file.compressionResult" class="pa-2">
                        <div class="compression-stats">
                          <div class="text-caption text-grey">
                            {{ formatFileSize(file.originalFile.size) }} → 
                            {{ formatFileSize(file.compressionResult.compressedSize) }}
                          </div>
                          <v-chip
                            size="x-small"
                            color="success"
                            variant="outlined"
                          >
                            {{ (((file.originalFile.size - file.compressionResult.compressedSize) / file.originalFile.size) * 100).toFixed(0) }}% 削減
                          </v-chip>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Clear All Button -->
                <div class="text-center mt-3">
                  <v-btn
                    variant="outlined"
                    color="error"
                    size="small"
                    @click="imageUpload.clearFiles"
                  >
                    <v-icon start>mdi-delete</v-icon>
                    すべて削除
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- URL Input Section -->
            <div v-else-if="uploadMode === 'url'">
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

            <!-- Error Display -->
            <v-alert
              v-if="imageUpload.error.value"
              type="error"
              variant="outlined"
              class="mt-3"
              closable
              @click:close="imageUpload.error.value = null"
            >
              {{ imageUpload.error.value }}
            </v-alert>
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
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { usePostsStore, type Post, type CreatePostData, type UpdatePostData } from '@/stores/posts'
import { usePreviewStore, type PreviewPost, type PreviewAccount } from '@/stores/preview'
import { useIgAccountsStore } from '@/stores/igAccounts'
import { useImageUpload, useDragAndDrop } from '@/composables/useImageUpload'
import { formatFileSize } from '@/utils/imageOptimizer'
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
const uploadMode = ref<'upload' | 'url'>('upload')

// Image upload composable
const imageUpload = useImageUpload({
  maxFiles: 10,
  autoCompress: true,
  compressionPreset: 'instagram',
  enableThumbnails: true
})

// Drag and drop handlers
const dragHandlers = useDragAndDrop((files) => {
  imageUpload.addFiles(files)
})

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
  // Clear uploaded images when resetting form
  imageUpload.clearFiles()
  
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

    let validMediaUrls: string[]

    if (uploadMode.value === 'upload') {
      // アップロードモードの場合
      const uploadedFiles = imageUpload.getFilesForUpload()
      
      if (uploadedFiles.length === 0) {
        throw new Error('少なくとも1つの画像をアップロードしてください')
      }

      // TODO: 実際のアップロード処理（Firebase Storage等）
      // ここでは仮のURLを生成
      validMediaUrls = uploadedFiles.map((file, index) => 
        `https://example.com/optimized/${Date.now()}-${index}.jpg`
      )
      
      console.log('アップロード対象ファイル:', uploadedFiles)
      console.log('圧縮統計:', imageUpload.stats.value)
      
    } else {
      // URLモードの場合
      validMediaUrls = form.value.mediaUrls.filter(url => url.trim() !== '')
      
      if (validMediaUrls.length === 0) {
        throw new Error('少なくとも1つの画像URLが必要です')
      }
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
    // エラーメッセージを表示
    if (uploadMode.value === 'upload') {
      imageUpload.error.value = error instanceof Error ? error.message : '保存に失敗しました'
    }
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

// Cleanup on unmount
onUnmounted(() => {
  imageUpload.cleanup()
})
</script>

<style scoped>
.v-card {
  overflow-y: auto;
  max-height: 90vh;
}

/* Upload interface styles */
.upload-dropzone {
  border: 2px dashed rgb(var(--v-theme-primary));
  border-radius: 12px;
  background-color: rgba(var(--v-theme-primary), 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-dropzone:hover,
.upload-dropzone.dragover {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateY(-1px);
}

.image-preview-card {
  position: relative;
  transition: all 0.3s ease;
}

.image-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-preview-card.error-card {
  border: 2px solid rgb(var(--v-theme-error));
}

.image-preview-card.processing-card {
  border: 2px solid rgb(var(--v-theme-primary));
}

.image-preview-wrapper {
  position: relative;
  overflow: hidden;
}

.status-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-overlay.success {
  background-color: rgba(var(--v-theme-success), 0.9);
}

.status-overlay.error {
  background-color: rgba(var(--v-theme-error), 0.9);
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview-card:hover .remove-btn {
  opacity: 1;
}

.compression-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.uploaded-images {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 12px;
  padding: 16px;
  background-color: rgba(var(--v-theme-surface), 0.5);
}
</style> 