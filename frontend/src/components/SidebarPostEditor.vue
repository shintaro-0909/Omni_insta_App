<template>
  <div class="sidebar-post-editor" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-overlay" @click="closeSidebar" v-if="isOpen" />
    
    <div class="sidebar-content">
      <!-- ヘッダー -->
      <div class="sidebar-header">
        <div class="header-title">
          <h3>📝 投稿詳細編集</h3>
          <p v-if="selectedPost">{{ formatDateTime(selectedPost.datetime) }}</p>
        </div>
        <button class="close-button" @click="closeSidebar">
          ✕
        </button>
      </div>

      <!-- コンテンツ -->
      <div v-if="selectedPost" class="sidebar-body">
        <!-- 基本情報セクション -->
        <div class="editor-section">
          <h4 class="section-title">🎯 基本情報</h4>
          
          <!-- 投稿タイトル -->
          <div class="field-group">
            <label class="field-label">投稿タイトル</label>
            <input
              v-model="editData.title"
              type="text"
              class="field-input"
              placeholder="投稿タイトルを入力..."
              @input="scheduleUpdate"
            />
          </div>

          <!-- 日時設定 -->
          <div class="field-group">
            <label class="field-label">投稿日時</label>
            <input
              v-model="editData.datetime"
              type="datetime-local"
              class="field-input"
              @change="scheduleUpdate"
            />
          </div>

          <!-- アカウント選択 -->
          <div class="field-group">
            <label class="field-label">Instagramアカウント</label>
            <select
              v-model="editData.accountId"
              class="field-input field-select"
              @change="scheduleUpdate"
            >
              <option value="">アカウントを選択...</option>
              <option 
                v-for="account in igAccounts" 
                :key="account.id" 
                :value="account.id"
              >
                @{{ account.username }}
              </option>
            </select>
          </div>

          <!-- ステータス -->
          <div class="field-group">
            <label class="field-label">ステータス</label>
            <select
              v-model="editData.status"
              class="field-input field-select"
              @change="scheduleUpdate"
            >
              <option value="pending">待機中</option>
              <option value="active">アクティブ</option>
              <option value="paused">一時停止</option>
              <option value="completed">完了</option>
              <option value="error">エラー</option>
            </select>
          </div>
        </div>

        <!-- 投稿内容セクション -->
        <div class="editor-section">
          <h4 class="section-title">📝 投稿内容</h4>
          
          <!-- 投稿文 -->
          <div class="field-group">
            <label class="field-label">
              投稿文
              <span class="char-counter" :class="{ 'char-limit-exceeded': textLength > 2200 }">
                {{ textLength }}/2200
              </span>
            </label>
            <textarea
              v-model="editData.text"
              class="field-textarea"
              :class="{ 'field-error': textLength > 2200 }"
              placeholder="投稿文を入力..."
              rows="8"
              @input="scheduleUpdate"
            />
            <div class="field-hint">
              Instagramの投稿文は2200文字まで入力できます
            </div>
          </div>

          <!-- ハッシュタグ提案 -->
          <div class="field-group">
            <label class="field-label">💡 ハッシュタグ提案</label>
            <div class="hashtag-suggestions">
              <button
                v-for="tag in suggestedHashtags"
                :key="tag"
                class="hashtag-btn"
                @click="addHashtag(tag)"
              >
                #{{ tag }}
              </button>
            </div>
          </div>
        </div>

        <!-- メディアセクション -->
        <div class="editor-section">
          <h4 class="section-title">🖼️ メディア</h4>
          
          <!-- 画像URL -->
          <div class="field-group">
            <label class="field-label">画像URL</label>
            <input
              v-model="editData.imageUrl"
              type="url"
              class="field-input"
              placeholder="https://example.com/image.jpg"
              @input="scheduleUpdate"
            />
          </div>

          <!-- 画像プレビュー -->
          <div v-if="editData.imageUrl" class="field-group">
            <label class="field-label">プレビュー</label>
            <div class="image-preview-container">
              <img
                :src="editData.imageUrl"
                alt="投稿画像プレビュー"
                class="image-preview"
                @error="handleImageError"
              />
              <div class="image-info">
                <p class="image-url">{{ truncateUrl(editData.imageUrl) }}</p>
                <button class="remove-image-btn" @click="removeImage">
                  🗑️ 削除
                </button>
              </div>
            </div>
          </div>

          <!-- ファイルアップロード -->
          <div class="field-group">
            <label class="field-label">ファイルから選択</label>
            <div class="file-upload-area" @drop="handleFileDrop" @dragover.prevent>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="file-input"
                @change="handleFileSelect"
              />
              <div class="file-upload-content">
                <div class="upload-icon">📁</div>
                <p>ファイルをドロップまたはクリックして選択</p>
                <button class="upload-btn" @click="($refs.fileInput as HTMLInputElement)?.click()">
                  ファイル選択
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- スケジュール設定セクション -->
        <div class="editor-section">
          <h4 class="section-title">⏰ スケジュール設定</h4>
          
          <!-- 投稿タイプ -->
          <div class="field-group">
            <label class="field-label">投稿タイプ</label>
            <div class="radio-group">
              <label class="radio-item">
                <input 
                  v-model="editData.scheduleType" 
                  type="radio" 
                  value="once"
                  @change="scheduleUpdate"
                />
                <span>一回限り</span>
              </label>
              <label class="radio-item">
                <input 
                  v-model="editData.scheduleType" 
                  type="radio" 
                  value="recurring"
                  @change="scheduleUpdate"
                />
                <span>繰り返し</span>
              </label>
              <label class="radio-item">
                <input 
                  v-model="editData.scheduleType" 
                  type="radio" 
                  value="random"
                  @change="scheduleUpdate"
                />
                <span>ランダム</span>
              </label>
            </div>
          </div>

          <!-- 繰り返し設定 -->
          <div v-if="editData.scheduleType === 'recurring'" class="field-group">
            <label class="field-label">繰り返し間隔</label>
            <select
              v-model="editData.repeatInterval"
              class="field-input field-select"
              @change="scheduleUpdate"
            >
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>

          <!-- ランダム設定 -->
          <div v-if="editData.scheduleType === 'random'" class="field-group">
            <label class="field-label">間隔設定（分）</label>
            <div class="interval-inputs">
              <input
                v-model.number="editData.minInterval"
                type="number"
                class="field-input interval-input"
                placeholder="最小"
                min="1"
                @input="scheduleUpdate"
              />
              <span class="interval-separator">〜</span>
              <input
                v-model.number="editData.maxInterval"
                type="number"
                class="field-input interval-input"
                placeholder="最大"
                min="1"
                @input="scheduleUpdate"
              />
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="sidebar-actions">
          <button class="action-btn primary" @click="savePost" :disabled="!canSave">
            💾 保存
          </button>
          <button class="action-btn secondary" @click="duplicatePost">
            📋 複製
          </button>
          <button class="action-btn danger" @click="deletePost">
            🗑️ 削除
          </button>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-else class="sidebar-empty">
        <div class="empty-icon">📝</div>
        <h3>投稿を選択してください</h3>
        <p>グリッド上の行をクリックして詳細編集を開始します</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useIgAccountsStore, type ScheduleStatus } from '@/stores';
import dayjs from 'dayjs';
import { useNotification } from '@/composables';

// Props
interface Props {
  isOpen: boolean;
  selectedPost: any | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'close': [];
  'save': [post: any];
  'duplicate': [post: any];
  'delete': [postId: string];
}>();

// Stores
const igAccountsStore = useIgAccountsStore();
const { notifySuccess, notifyError } = useNotification();

// Reactive data
const editData = ref({
  title: '',
  datetime: '',
  accountId: '',
  status: 'pending' as ScheduleStatus,
  text: '',
  imageUrl: '',
  scheduleType: 'once',
  repeatInterval: 'daily',
  minInterval: 60,
  maxInterval: 240,
});

const suggestedHashtags = ref([
  'instagram', 'photo', 'love', 'instagood', 'photooftheday',
  'beautiful', 'happy', 'picoftheday', 'followme', 'repost'
]);

// Computed
const igAccounts = computed(() => igAccountsStore.accounts);

const textLength = computed(() => editData.value.text?.length || 0);

const canSave = computed(() => {
  return !!(editData.value.title && editData.value.datetime && editData.value.accountId);
});

// Methods
const closeSidebar = () => {
  emit('close');
};

const savePost = () => {
  if (!canSave.value) {
    notifyError('保存エラー', '必須項目をすべて入力してください');
    return;
  }

  emit('save', { ...editData.value });
  notifySuccess('投稿保存完了', '投稿の変更が保存されました');
};

const duplicatePost = () => {
  const duplicatedPost = {
    ...editData.value,
    title: `${editData.value.title} (コピー)`,
    datetime: dayjs(editData.value.datetime).add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
  };
  emit('duplicate', duplicatedPost);
  notifySuccess('投稿複製完了', '投稿が複製されました');
};

const deletePost = () => {
  if (props.selectedPost) {
    emit('delete', props.selectedPost.id);
    notifySuccess('投稿削除完了', '投稿が削除されました');
  }
};

const addHashtag = (tag: string) => {
  const hashtag = `#${tag}`;
  if (!editData.value.text.includes(hashtag)) {
    editData.value.text += ` ${hashtag}`;
    scheduleUpdate();
  }
};

const removeImage = () => {
  editData.value.imageUrl = '';
  scheduleUpdate();
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/default-image.png';
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    // const file = input.files[0];
    // ここで実際のファイルアップロード処理を実装
    notifySuccess('アップロード開始', 'ファイルのアップロードを開始しました');
  }
};

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    // const file = event.dataTransfer.files[0];
    // ここで実際のファイルアップロード処理を実装
    notifySuccess('アップロード開始', 'ファイルのアップロードを開始しました');
  }
};

const formatDateTime = (datetime: string): string => {
  if (!datetime) return '';
  return dayjs(datetime).format('YYYY年MM月DD日 HH:mm');
};

const truncateUrl = (url: string): string => {
  if (!url) return '';
  return url.length > 50 ? url.substring(0, 50) + '...' : url;
};

// Debounced update function
let updateTimeout: ReturnType<typeof setTimeout>;
const scheduleUpdate = () => {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    if (props.selectedPost) {
      emit('save', { ...editData.value });
    }
  }, 300);
};

// Watchers
watch(() => props.selectedPost, (newPost) => {
  if (newPost) {
    editData.value = {
      title: newPost.title || '',
      datetime: newPost.datetime || '',
      accountId: newPost.accountId || '',
      status: newPost.status || 'pending',
      text: newPost.text || '',
      imageUrl: newPost.imageUrl || '',
      scheduleType: newPost.scheduleType || 'once',
      repeatInterval: newPost.repeatInterval || 'daily',
      minInterval: newPost.minInterval || 60,
      maxInterval: newPost.maxInterval || 240,
    };
  }
}, { immediate: true });
</script>

<style scoped>
.sidebar-post-editor {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 420px;
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-post-editor.sidebar-open {
  transform: translateX(0);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: -1;
}

.sidebar-content {
  width: 100%;
  height: 100%;
  background: white;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f9fafb;
}

.header-title h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.header-title p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.editor-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-group {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.char-counter {
  float: right;
  font-size: 12px;
  color: #6b7280;
}

.char-counter.char-limit-exceeded {
  color: #ef4444;
  font-weight: 600;
}

.field-input,
.field-select,
.field-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.field-input:focus,
.field-select:focus,
.field-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-error {
  border-color: #ef4444;
}

.field-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.radio-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.radio-item input {
  margin: 0;
}

.hashtag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hashtag-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.hashtag-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.image-preview-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 12px;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-url {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.remove-image-btn {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #991b1b;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-image-btn:hover {
  background: #fca5a5;
}

.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  transition: border-color 0.2s;
  cursor: pointer;
}

.file-upload-area:hover {
  border-color: #9ca3af;
}

.file-input {
  display: none;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s;
}

.upload-btn:hover {
  background: #2563eb;
}

.interval-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interval-input {
  flex: 1;
}

.interval-separator {
  color: #6b7280;
  font-weight: 500;
}

.sidebar-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

.action-btn.primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

.action-btn.danger {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.action-btn.danger:hover {
  background: #fca5a5;
}

.sidebar-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.sidebar-empty h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
}

.sidebar-empty p {
  margin: 0;
  color: #6b7280;
}

/* スクロールバー */
.sidebar-body::-webkit-scrollbar {
  width: 6px;
}

.sidebar-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.sidebar-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.sidebar-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>