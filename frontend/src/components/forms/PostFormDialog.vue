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
          <!-- Image Upload Section -->
          <div class="mb-4">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">📸 画像をアップロード</h4>
            
            <!-- File Upload Area -->
            <div 
              class="upload-area"
              :class="{ 'dragging': isDragging }"
              @dragenter="handleDragEnter"
              @dragleave="handleDragLeave"
              @dragover="handleDragOver"
              @drop="handleDrop"
              @click="triggerFileInput"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              >
              
              <div v-if="uploadedImages.length === 0" class="upload-prompt">
                <div class="upload-icon">📷</div>
                <div class="upload-text">
                  <div class="upload-title">画像をアップロード</div>
                  <div class="upload-subtitle">
                    ドラッグ&ドロップまたはクリックして選択
                  </div>
                  <div class="upload-format">
                    JPG, PNG, WebP対応（最大10MB）
                  </div>
                </div>
              </div>

              <!-- Uploaded Images Preview -->
              <div v-else class="uploaded-images">
                <div 
                  v-for="(image, index) in uploadedImages" 
                  :key="index"
                  class="image-preview"
                >
                  <img :src="image.url" :alt="`Image ${index + 1}`" class="preview-img">
                  <button 
                    type="button"
                    class="remove-image"
                    @click.stop="removeImage(index)"
                    title="画像を削除"
                  >
                    ✕
                  </button>
                </div>
                
                <!-- Add More Button -->
                <div class="add-more-btn" @click.stop="triggerFileInput">
                  <div class="add-icon">➕</div>
                  <div class="add-text">追加</div>
                </div>
              </div>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress mb-3">
              <div class="progress-text">アップロード中... {{ uploadProgress }}%</div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
              </div>
            </div>
          </div>

          <!-- Alternative: Manual URL Input -->
          <div class="mb-4">
            <v-expansion-panels variant="accordion" class="mb-3">
              <v-expansion-panel title="📎 または画像URLを手動入力">
                <v-expansion-panel-text>
                  <v-text-field
                    v-model="manualUrl"
                    label="画像URL"
                    placeholder="https://example.com/image.jpg"
                    variant="outlined"
                    :rules="urlRules"
                    class="mb-3"
                  />
                  <v-btn 
                    variant="outlined" 
                    @click="addManualUrl"
                    :disabled="!manualUrl || !isValidUrl(manualUrl)"
                  >
                    URLを追加
                  </v-btn>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

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
            @blur="onCaptionBlur"
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
  import { ref, reactive, computed, watch } from 'vue';
  import {
    usePostsStore,
    type Post,
    type CreatePostData,
    type UpdatePostData,
  } from '@/stores';
  import { useDragAndDrop } from '@/composables/business/useImageUpload';
  import { useNotification } from '@/composables';

  interface Props {
    modelValue: boolean;
    post?: Post | null;
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'created', post: Post): void;
    (e: 'updated', post: Post): void;
  }

  interface UploadedImage {
    file: File;
    url: string;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const postsStore = usePostsStore();
  const { notifySuccess, notifyError, notifyWarning } = useNotification();

  // Form data
  const defaultForm = {
    mediaUrls: [] as string[],
    caption: '',
    tags: [] as string[],
  };
  
  const form = reactive({ ...defaultForm });
  const loading = ref(false);

  // File upload states
  const fileInput = ref<HTMLInputElement | null>(null);
  const uploadedImages = ref<UploadedImage[]>([]);
  const uploadProgress = ref(0);
  const manualUrl = ref('');

  // Drag and drop
  const { isDragging, onDragEnter, onDragLeave, onDragOver, onDrop } = useDragAndDrop(handleFileDrop);

  // Handle drag and drop events
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    onDragEnter(e);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    onDragLeave(e);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    onDragOver(e);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    onDrop(e);
  };

  // File handling
  function handleFileDrop(files: FileList) {
    handleFiles(Array.from(files));
  }

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      handleFiles(Array.from(target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    let hasValidFiles = false;
    
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        notifyWarning('ファイル形式エラー', `「${file.name}」は画像ファイルではありません。JPG、PNG、WebP形式のファイルを選択してください。`);
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        notifyWarning('ファイルサイズエラー', `「${file.name}」のサイズが${fileSizeMB}MBで制限を超えています。10MB以下のファイルを選択してください。`);
        continue;
      }

      hasValidFiles = true;

      // Create preview URL
      const url = URL.createObjectURL(file);
      
      uploadedImages.value.push({
        file,
        url
      });

      // Simulate upload progress (in real implementation, this would be actual upload)
      await simulateUpload();
    }

    updateFormMediaUrls();
    
    // Show success notification if any files were processed
    if (hasValidFiles) {
      const fileCount = uploadedImages.value.length;
      notifySuccess('アップロード完了', `${fileCount}個の画像をアップロードしました。`);
    }
  };

  const simulateUpload = async () => {
    uploadProgress.value = 0;
    
    for (let i = 0; i <= 100; i += 10) {
      uploadProgress.value = i;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Reset progress after a short delay
    setTimeout(() => {
      uploadProgress.value = 0;
    }, 1000);
  };

  const removeImage = (index: number) => {
    const image = uploadedImages.value[index];
    if (image) {
      URL.revokeObjectURL(image.url);
      uploadedImages.value.splice(index, 1);
      updateFormMediaUrls();
    }
  };

  const addManualUrl = () => {
    if (manualUrl.value && isValidUrl(manualUrl.value)) {
      uploadedImages.value.push({
        file: new File([], 'manual-url', { type: 'image/jpeg' }),
        url: manualUrl.value
      });
      
      notifySuccess('URL追加完了', '画像URLを追加しました。');
      manualUrl.value = '';
      updateFormMediaUrls();
    } else {
      notifyWarning('無効なURL', '有効な画像URLを入力してください。');
    }
  };

  const updateFormMediaUrls = () => {
    form.mediaUrls = uploadedImages.value.map(img => img.url);
    console.log('📸 Updated form mediaUrls:', form.mediaUrls);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Debug event handlers
  const onCaptionBlur = () => {
    console.log('👁️ Caption blur - current value:', form.caption);
  };

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
      !v || v.length <= 2200 || 'キャプションは2200文字以内で入力してください',
  ];

  // Computed
  const canSubmit = computed(() => {
    const hasImages = uploadedImages.value.length > 0;
    const hasCaption = !!form.caption?.trim();
    
    console.log('🔍 canSubmit check:', {
      hasImages,
      hasCaption,
      imagesCount: uploadedImages.value.length,
      caption: form.caption,
      captionLength: form.caption?.length || 0
    });
    
    // 画像があれば投稿可能（キャプションは任意）
    return hasImages;
  });

  // Methods
  const handleClose = () => {
    console.log('❌ handleClose called');
    emit('update:modelValue', false);
    // Don't reset immediately - let the watcher handle it
  };

  const handleSubmit = async () => {
    if (!canSubmit.value) return;

    loading.value = true;

    try {
      const postData: CreatePostData = {
        mediaUrls: form.mediaUrls?.filter(url => url.trim()) || [],
        caption: form.caption?.trim() || '',
        tags: form.tags || [],
      };

      console.log('📤 Submitting post data:', postData);

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
        notifySuccess('投稿更新完了', '投稿内容を更新しました。');
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
        notifySuccess('投稿作成完了', '新しい投稿をコンテンツライブラリに追加しました。');
      }

      emit('update:modelValue', false);
      // Reset after successful submission
      setTimeout(() => resetForm(), 100);
    } catch (error) {
      console.error('Post submission error:', error);
      const action = props.post ? '更新' : '作成';
      notifyError(`投稿${action}エラー`, `投稿の${action}中にエラーが発生しました。もう一度お試しください。`);
    } finally {
      loading.value = false;
    }
  };

  const resetForm = () => {
    console.log('🔄 resetForm called - current form state:', JSON.parse(JSON.stringify(form)));
    
    Object.assign(form, { ...defaultForm });
    
    // Clean up uploaded images
    uploadedImages.value.forEach(image => {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    });
    uploadedImages.value = [];
    uploadProgress.value = 0;
    manualUrl.value = '';
    
    console.log('🔄 resetForm completed - new form state:', JSON.parse(JSON.stringify(form)));
  };

  // Watch for post prop changes to initialize form
  watch(() => props.post, (newPost) => {
    console.log('👀 Post prop changed:', newPost);
    
    if (newPost) {
      Object.assign(form, {
        mediaUrls: newPost.mediaUrls || [],
        caption: newPost.caption || '',
        tags: newPost.tags || [],
      });
      
      // Initialize uploaded images for editing
      if (newPost.mediaUrls) {
        uploadedImages.value = newPost.mediaUrls.map(url => ({
          file: new File([], 'existing-image', { type: 'image/jpeg' }),
          url: url
        }));
      }
    }
  }, { immediate: true });

  // Watch for dialog open/close
  watch(() => props.modelValue, (isOpen, wasOpen) => {
    console.log('🪟 Dialog state changed:', { isOpen, wasOpen, hasPost: !!props.post });
    
    if (isOpen && !wasOpen) {
      // Dialog is opening
      if (!props.post) {
        // Only reset if it's a new post (not editing)
        console.log('📝 Opening dialog for new post - initializing empty form');
        Object.assign(form, { ...defaultForm });
        uploadedImages.value = [];
        uploadProgress.value = 0;
        manualUrl.value = '';
      }
    }
  });

  // Watch form changes for debugging
  watch(() => form, (newForm) => {
    console.log('📋 Form state changed:', JSON.parse(JSON.stringify(newForm)));
  }, { deep: true });
</script>

<style scoped>
  .post-form-dialog {
    border-radius: 16px !important;
  }

  /* Upload Area Styles */
  .upload-area {
    border: 2px dashed #e0e7ff;
    border-radius: 16px;
    padding: 2rem;
    background: #fafbff;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .upload-area:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }

  .upload-area.dragging {
    border-color: #667eea;
    background: #e0e7ff;
    transform: scale(1.02);
  }

  .upload-prompt {
    text-align: center;
    color: #718096;
  }

  .upload-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .upload-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  .upload-subtitle {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .upload-format {
    font-size: 0.9rem;
    color: #a0aec0;
  }

  /* Uploaded Images Grid */
  .uploaded-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
    width: 100%;
  }

  .image-preview {
    position: relative;
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    background: #f7fafc;
  }

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-image {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    transition: all 0.2s ease;
  }

  .remove-image:hover {
    background: rgba(220, 38, 38, 0.8);
    transform: scale(1.1);
  }

  .add-more-btn {
    aspect-ratio: 1;
    border: 2px dashed #cbd5e0;
    border-radius: 12px;
    background: #f7fafc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #718096;
  }

  .add-more-btn:hover {
    border-color: #667eea;
    background: #f0f4ff;
    color: #667eea;
  }

  .add-icon {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  .add-text {
    font-size: 0.9rem;
    font-weight: 500;
  }

  /* Upload Progress */
  .upload-progress {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .progress-text {
    font-size: 0.9rem;
    color: #667eea;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .upload-area {
      padding: 1.5rem;
      min-height: 150px;
    }

    .upload-icon {
      font-size: 2.5rem;
    }

    .upload-title {
      font-size: 1.1rem;
    }

    .uploaded-images {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.75rem;
    }
  }
</style>
