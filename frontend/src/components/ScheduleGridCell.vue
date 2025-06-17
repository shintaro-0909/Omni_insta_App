<template>
  <div 
    class="schedule-grid-cell"
    :class="[
      `cell-type-${cellType}`,
      { 'cell-editing': isEditing, 'cell-error': hasError }
    ]"
    @click="startEdit"
    @dblclick="startEdit"
  >
    <!-- DateTime Cell -->
    <div v-if="cellType === 'datetime'" class="datetime-cell">
      <input
        v-if="isEditing"
        ref="inputRef"
        v-model="editValue"
        type="datetime-local"
        class="cell-input datetime-input"
        @blur="finishEdit"
        @keyup.enter="finishEdit"
        @keyup.escape="cancelEdit"
      />
      <div v-else class="cell-display">
        {{ formatDateTime(value) }}
      </div>
    </div>

    <!-- Account Cell -->
    <div v-else-if="cellType === 'account'" class="account-cell">
      <select
        v-if="isEditing"
        ref="inputRef"
        v-model="editValue"
        class="cell-input account-select"
        @blur="finishEdit"
        @keyup.enter="finishEdit"
        @keyup.escape="cancelEdit"
      >
        <option value="">選択してください</option>
        <option 
          v-for="account in igAccounts" 
          :key="account.id" 
          :value="account.id"
        >
          @{{ account.username }}
        </option>
      </select>
      <div v-else class="cell-display account-display">
        <div v-if="selectedAccount" class="account-info">
          <img 
            :src="selectedAccount.profilePictureUrl || '/default-avatar.png'" 
            :alt="selectedAccount.username"
            class="account-avatar"
          />
          <span>@{{ selectedAccount.username }}</span>
        </div>
        <span v-else class="no-account">未選択</span>
      </div>
    </div>

    <!-- Text Cell -->
    <div v-else-if="cellType === 'text'" class="text-cell">
      <textarea
        v-if="isEditing"
        ref="inputRef"
        v-model="editValue"
        class="cell-input text-textarea"
        :placeholder="'投稿文を入力...'"
        @blur="finishEdit"
        @keyup.ctrl.enter="finishEdit"
        @keyup.escape="cancelEdit"
      />
      <div v-else class="cell-display text-display">
        <div class="text-preview">
          {{ truncateText(value, 50) }}
        </div>
        <div v-if="value && value.length > 50" class="char-count">
          {{ value.length }}/2200文字
        </div>
      </div>
    </div>

    <!-- Image URL Cell -->
    <div v-else-if="cellType === 'imageUrl'" class="image-cell">
      <input
        v-if="isEditing"
        ref="inputRef"
        v-model="editValue"
        type="url"
        class="cell-input image-input"
        placeholder="画像URLを入力..."
        @blur="finishEdit"
        @keyup.enter="finishEdit"
        @keyup.escape="cancelEdit"
      />
      <div v-else class="cell-display image-display">
        <img 
          v-if="value" 
          :src="value" 
          :alt="'投稿画像'"
          class="image-preview"
          @error="handleImageError"
        />
        <div v-else class="no-image">
          📷 画像なし
        </div>
      </div>
    </div>

    <!-- Status Cell -->
    <div v-else-if="cellType === 'status'" class="status-cell">
      <select
        v-if="isEditing"
        ref="inputRef"
        v-model="editValue"
        class="cell-input status-select"
        @blur="finishEdit"
        @keyup.enter="finishEdit"
        @keyup.escape="cancelEdit"
      >
        <option value="pending">待機中</option>
        <option value="active">アクティブ</option>
        <option value="paused">一時停止</option>
        <option value="completed">完了</option>
        <option value="error">エラー</option>
      </select>
      <div v-else class="cell-display status-display">
        <span 
          class="status-badge"
          :class="`status-${value}`"
        >
          {{ getStatusIcon(value) }} {{ getStatusText(value) }}
        </span>
      </div>
    </div>

    <!-- Validation Error -->
    <div v-if="hasError" class="cell-error-tooltip">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { useIgAccountsStore, type ScheduleStatus } from '@/stores';
import dayjs from 'dayjs';

// Props
interface Props {
  value: any;
  cellType: 'datetime' | 'account' | 'text' | 'imageUrl' | 'status';
  rowData: any;
  columnIndex: number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'cell-value-changed': [value: any];
  'start-edit': [];
  'finish-edit': [];
}>();

// Stores
const igAccountsStore = useIgAccountsStore();

// Reactive data
const isEditing = ref(false);
const editValue = ref(props.value);
const inputRef = ref<HTMLElement>();

// Computed
const igAccounts = computed(() => igAccountsStore.accounts);

const selectedAccount = computed(() => {
  if (props.cellType === 'account' && props.value) {
    return igAccounts.value.find(account => account.id === props.value);
  }
  return null;
});

const hasError = computed(() => {
  return validateCell().length > 0;
});

const errorMessage = computed(() => {
  const errors = validateCell();
  return errors.join(', ');
});

// Methods
const startEdit = async () => {
  if (isEditing.value) return;
  
  isEditing.value = true;
  editValue.value = props.value;
  emit('start-edit');
  
  await nextTick();
  if (inputRef.value) {
    inputRef.value.focus();
    if (props.cellType === 'text' && inputRef.value instanceof HTMLTextAreaElement) {
      // テキストエリアの場合、カーソルを最後に移動
      inputRef.value.setSelectionRange(editValue.value?.length || 0, editValue.value?.length || 0);
    }
  }
};

const finishEdit = () => {
  if (!isEditing.value) return;
  
  const errors = validateCell();
  if (errors.length === 0) {
    emit('cell-value-changed', editValue.value);
    isEditing.value = false;
    emit('finish-edit');
  }
};

const cancelEdit = () => {
  editValue.value = props.value;
  isEditing.value = false;
  emit('finish-edit');
};

const validateCell = (): string[] => {
  const errors: string[] = [];
  
  switch (props.cellType) {
    case 'datetime':
      if (!editValue.value) {
        errors.push('日時は必須です');
      } else {
        const date = dayjs(editValue.value);
        if (!date.isValid()) {
          errors.push('有効な日時を入力してください');
        } else if (date.isBefore(dayjs())) {
          errors.push('過去の日時は設定できません');
        }
      }
      break;
      
    case 'account':
      if (!editValue.value) {
        errors.push('アカウントを選択してください');
      }
      break;
      
    case 'text':
      if (editValue.value && editValue.value.length > 2200) {
        errors.push('投稿文は2200文字以内で入力してください');
      }
      break;
      
    case 'imageUrl':
      if (editValue.value && !isValidUrl(editValue.value)) {
        errors.push('有効なURLを入力してください');
      }
      break;
  }
  
  return errors;
};

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const formatDateTime = (datetime: string): string => {
  if (!datetime) return '未設定';
  return dayjs(datetime).format('YYYY/MM/DD HH:mm');
};

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const getStatusIcon = (status: ScheduleStatus): string => {
  switch (status) {
    case 'active': return '▶️';
    case 'paused': return '⏸️';
    case 'completed': return '✅';
    case 'error': return '⚠️';
    default: return '⏳';
  }
};

const getStatusText = (status: ScheduleStatus): string => {
  switch (status) {
    case 'active': return 'アクティブ';
    case 'paused': return '一時停止';
    case 'completed': return '完了';
    case 'error': return 'エラー';
    default: return '待機中';
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/default-image.png';
};

// Watchers
watch(() => props.value, (newValue) => {
  if (!isEditing.value) {
    editValue.value = newValue;
  }
});
</script>

<style scoped>
.schedule-grid-cell {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 40px;
  padding: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.schedule-grid-cell:hover {
  border-color: #e2e8f0;
  background: #f8fafc;
}

.schedule-grid-cell.cell-editing {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.schedule-grid-cell.cell-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.cell-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-family: inherit;
  resize: none;
}

.cell-display {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 14px;
}

/* DateTime Cell */
.datetime-cell .cell-display {
  color: #374151;
  font-weight: 500;
}

.datetime-input {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

/* Account Cell */
.account-display {
  gap: 8px;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.no-account {
  color: #9ca3af;
  font-style: italic;
}

.account-select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

/* Text Cell */
.text-cell {
  min-height: 60px;
}

.text-display {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.text-preview {
  line-height: 1.4;
  color: #374151;
}

.char-count {
  font-size: 12px;
  color: #6b7280;
}

.text-textarea {
  min-height: 60px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  line-height: 1.4;
}

/* Image Cell */
.image-display {
  justify-content: center;
}

.image-preview {
  max-width: 80px;
  max-height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.no-image {
  color: #9ca3af;
  font-size: 12px;
  text-align: center;
}

.image-input {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

/* Status Cell */
.status-display {
  justify-content: center;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-badge.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-paused {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-completed {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.status-pending {
  background: #f3f4f6;
  color: #374151;
}

.status-select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

/* Error Tooltip */
.cell-error-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  z-index: 10;
  margin-top: 2px;
}

.cell-error-tooltip::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 8px;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #ef4444;
}

/* Column specific widths */
.cell-type-datetime {
  min-width: 150px;
}

.cell-type-account {
  min-width: 200px;
}

.cell-type-text {
  min-width: 300px;
}

.cell-type-imageUrl {
  min-width: 150px;
}

.cell-type-status {
  min-width: 120px;
}
</style>