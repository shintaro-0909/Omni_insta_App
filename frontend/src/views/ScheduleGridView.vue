<template>
  <div class="schedule-grid-layout">
    <!-- サイドバーナビゲーション -->
    <SidebarNavigation />
    
    <div class="schedule-grid-view">
      <!-- ヘッダー -->
      <div class="grid-header">
        <div class="header-left">
          <h1 class="page-title">
            📊 Instagram投稿グリッド管理
          </h1>
          <p class="page-description">
            Googleスプレッドシート風のインターフェースで効率的に予約投稿を管理
          </p>
        </div>
        
        <div class="header-actions">
          <button 
            class="action-btn primary"
            @click="addNewRow"
          >
            ➕ 新しい投稿
            <span class="shortcut-hint">Ctrl+Enter</span>
          </button>
          
          <button 
            class="action-btn secondary"
            @click="bulkSchedule"
            :disabled="!hasSelectedRows"
          >
            🚀 一括予約
            <span class="shortcut-hint">Ctrl+Shift+S</span>
          </button>
          
          <button 
            class="action-btn secondary"
            @click="exportData"
          >
            📥 エクスポート
          </button>
        </div>
      </div>

      <!-- ツールバー -->
      <div class="grid-toolbar">
        <div class="toolbar-left">
          <div class="filter-group">
            <select v-model="statusFilter" @change="applyFilters" class="filter-select">
              <option value="">全ステータス</option>
              <option value="pending">待機中</option>
              <option value="active">アクティブ</option>
              <option value="paused">一時停止</option>
              <option value="completed">完了</option>
              <option value="error">エラー</option>
            </select>
          </div>
          
          <div class="filter-group">
            <select v-model="accountFilter" @change="applyFilters" class="filter-select">
              <option value="">全アカウント</option>
              <option 
                v-for="account in igAccounts" 
                :key="account.id" 
                :value="account.id"
              >
                @{{ account.username }}
              </option>
            </select>
          </div>
          
          <button class="clear-filters-btn" @click="clearFilters">
            🗑️ フィルタークリア
          </button>
        </div>
        
        <div class="toolbar-right">
          <div class="selection-info" v-if="selectedRows.length > 0">
            {{ selectedRows.length }}行選択中
          </div>
          
          <div class="view-options">
            <button 
              class="view-btn"
              :class="{ active: showSidebar }"
              @click="toggleSidebar"
            >
              📝 詳細編集
            </button>
          </div>
        </div>
      </div>

      <!-- グリッド -->
      <div class="grid-container">
        <ag-grid-vue
          ref="agGrid"
          class="ag-theme-alpine schedule-grid"
          :column-defs="columnDefs"
          :row-data="filteredRowData"
          :default-col-def="defaultColDef"
          :grid-options="gridOptions"
          :suppress-row-click-selection="false"
          :row-selection="'multiple'"
          :row-multiselect-with-click="true"
          :suppress-cell-focus="false"
          :enable-range-selection="true"
          :enable-fill-handle="true"
          :enable-cell-text-selection="true"
          :row-drag-managed="true"
          :animate-rows="true"
          @grid-ready="onGridReady"
          @cell-value-changed="onCellValueChanged"
          @selection-changed="onSelectionChanged"
          @row-drag-end="onRowDragEnd"
          @cell-clicked="onCellClicked"
          @paste-start="onPasteStart"
          @paste-end="onPasteEnd"
        />
      </div>

      <!-- ステータスバー -->
      <div class="grid-status-bar">
        <div class="status-left">
          <span class="row-count">
            総投稿数: {{ rowData.length }}行
          </span>
          <span class="filter-count" v-if="isFiltered">
            ({{ filteredRowData.length }}行表示中)
          </span>
        </div>
        
        <div class="status-right">
          <div class="sync-status" :class="syncStatus">
            <span class="sync-indicator"></span>
            {{ getSyncStatusText() }}
          </div>
          
          <div class="keyboard-hints">
            <span class="hint">Ctrl+C: コピー</span>
            <span class="hint">Ctrl+V: 貼り付け</span>
            <span class="hint">Delete: 削除</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 詳細編集サイドバー -->
    <SidebarPostEditor
      :is-open="showSidebar"
      :selected-post="selectedPost"
      @close="closeSidebar"
      @save="onPostSave"
      @duplicate="onPostDuplicate"
      @delete="onPostDelete"
    />

    <!-- 一括予約ダイアログ -->
    <v-dialog v-model="bulkScheduleDialog" max-width="600px">
      <v-card>
        <v-card-title>🚀 一括予約設定</v-card-title>
        <v-card-text>
          <p>{{ selectedRows.length }}件の投稿を一括で予約設定します。</p>
          
          <v-row class="mt-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="bulkScheduleData.startDate"
                label="開始日時"
                type="datetime-local"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="bulkScheduleData.interval"
                label="間隔（分）"
                type="number"
                variant="outlined"
                min="1"
              />
            </v-col>
          </v-row>
          
          <v-checkbox
            v-model="bulkScheduleData.skipWeekends"
            label="週末をスキップ"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="bulkScheduleDialog = false">
            キャンセル
          </v-btn>
          <v-btn color="primary" @click="executeBulkSchedule">
            一括予約実行
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import type { 
  GridApi, 
  ColDef, 
  GridOptions, 
  CellValueChangedEvent,
  SelectionChangedEvent,
  RowDragEndEvent,
  CellClickedEvent
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { useSchedulesStore, useIgAccountsStore, type ScheduleStatus } from '@/stores';
import { useNotification } from '@/composables';
import { SidebarNavigation, SidebarPostEditor, ScheduleGridCell } from '@/components';
import dayjs from 'dayjs';

// Stores
const schedulesStore = useSchedulesStore();
const igAccountsStore = useIgAccountsStore();
const { notifySuccess, notifyError, notifyWarning } = useNotification();

// Reactive data
const agGrid = ref<typeof AgGridVue>();
const gridApi = ref<GridApi>();

const rowData = ref<any[]>([]);
const selectedRows = ref<any[]>([]);
const selectedPost = ref<any>(null);

const showSidebar = ref(false);
const bulkScheduleDialog = ref(false);

const statusFilter = ref('');
const accountFilter = ref('');

const syncStatus = ref<'synced' | 'syncing' | 'error'>('synced');

const bulkScheduleData = ref({
  startDate: '',
  interval: 30,
  skipWeekends: true,
});

// Computed
const igAccounts = computed(() => igAccountsStore.accounts);

const filteredRowData = computed(() => {
  let filtered = rowData.value;
  
  if (statusFilter.value) {
    filtered = filtered.filter(row => row.status === statusFilter.value);
  }
  
  if (accountFilter.value) {
    filtered = filtered.filter(row => row.accountId === accountFilter.value);
  }
  
  return filtered;
});

const isFiltered = computed(() => {
  return statusFilter.value || accountFilter.value;
});

const hasSelectedRows = computed(() => {
  return selectedRows.value.length > 0;
});

// Grid configuration
const defaultColDef = ref<ColDef>({
  resizable: true,
  sortable: true,
  filter: true,
  editable: false,
  minWidth: 100,
});

const columnDefs = ref<ColDef[]>([
  {
    headerName: '',
    field: 'dragHandle',
    rowDrag: true,
    width: 40,
    suppressHeaderMenuButton: true,
    sortable: false,
    filter: false,
    pinned: 'left',
  },
  {
    headerName: '日時',
    field: 'datetime',
    width: 180,
    pinned: 'left',
    cellRenderer: ScheduleGridCell,
    cellRendererParams: {
      cellType: 'datetime',
    },
    cellClass: (params) => {
      const errors = validateCell(params.data, 'datetime');
      return errors.length > 0 ? 'cell-error' : '';
    },
  },
  {
    headerName: 'アカウント',
    field: 'accountId',
    width: 200,
    cellRenderer: ScheduleGridCell,
    cellRendererParams: {
      cellType: 'account',
    },
    cellClass: (params) => {
      const errors = validateCell(params.data, 'accountId');
      return errors.length > 0 ? 'cell-error' : '';
    },
  },
  {
    headerName: '投稿文',
    field: 'text',
    width: 350,
    cellRenderer: ScheduleGridCell,
    cellRendererParams: {
      cellType: 'text',
    },
    cellClass: (params) => {
      const errors = validateCell(params.data, 'text');
      return errors.length > 0 ? 'cell-error' : '';
    },
  },
  {
    headerName: '画像',
    field: 'imageUrl',
    width: 150,
    cellRenderer: ScheduleGridCell,
    cellRendererParams: {
      cellType: 'imageUrl',
    },
  },
  {
    headerName: 'ステータス',
    field: 'status',
    width: 130,
    cellRenderer: ScheduleGridCell,
    cellRendererParams: {
      cellType: 'status',
    },
  },
]);

const gridOptions = ref<GridOptions>({
  pagination: false,
  paginationPageSize: 100,
  rowHeight: 60,
  headerHeight: 40,
  suppressRowHoverHighlight: false,
  suppressCellFocus: false,
  enableRangeSelection: true,
  enableFillHandle: true,
  rowMultiSelectWithClick: true,
  suppressRowClickSelection: false,
  rowDragManaged: true,
  animateRows: true,
  getRowId: (params) => params.data.id,
});

// Methods
const onGridReady = (params: any) => {
  gridApi.value = params.api;
  loadData();
};

const loadData = async () => {
  try {
    // サンプルデータを生成（実際の実装では Firestore から取得）
    const sampleData = Array.from({ length: 20 }, (_, index) => ({
      id: `post-${index + 1}`,
      datetime: dayjs().add(index + 1, 'hour').format('YYYY-MM-DDTHH:mm'),
      accountId: igAccounts.value[index % igAccounts.value.length]?.id || '',
      text: `サンプル投稿文 ${index + 1}\n#instagram #photo #love`,
      imageUrl: index % 3 === 0 ? 'https://via.placeholder.com/400x400' : '',
      status: ['pending', 'active', 'completed'][index % 3] as ScheduleStatus,
      title: `投稿 ${index + 1}`,
      scheduleType: 'once',
    }));
    
    rowData.value = sampleData;
    
    // 実際の実装では以下のようにFirestoreから取得
    // await schedulesStore.fetchSchedules();
    // rowData.value = schedulesStore.schedules.map(schedule => ({
    //   id: schedule.id,
    //   datetime: schedule.nextRunAt ? dayjs(schedule.nextRunAt.seconds * 1000).format('YYYY-MM-DDTHH:mm') : '',
    //   accountId: schedule.igAccount?.id || '',
    //   text: schedule.content?.caption || '',
    //   imageUrl: schedule.content?.mediaUrl || '',
    //   status: schedule.status,
    //   title: schedule.title,
    //   scheduleType: schedule.type,
    // }));
    
  } catch (error) {
    console.error('Error loading data:', error);
    notifyError('データ読み込みエラー', 'スケジュールデータの読み込みに失敗しました');
  }
};

const addNewRow = () => {
  const newRow = {
    id: `new-${Date.now()}`,
    datetime: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
    accountId: '',
    text: '',
    imageUrl: '',
    status: 'pending' as ScheduleStatus,
    title: `新規投稿 ${rowData.value.length + 1}`,
    scheduleType: 'once',
  };
  
  rowData.value.unshift(newRow);
  
  nextTick(() => {
    if (gridApi.value) {
      gridApi.value.setGridOption('rowData', rowData.value);
      gridApi.value.ensureIndexVisible(0);
    }
  });
  
  notifySuccess('新規投稿追加', '新しい投稿行が追加されました');
};

const bulkSchedule = () => {
  if (selectedRows.value.length === 0) {
    notifyWarning('選択エラー', '投稿を選択してください');
    return;
  }
  
  bulkScheduleData.value.startDate = dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm');
  bulkScheduleDialog.value = true;
};

const executeBulkSchedule = () => {
  const { startDate, interval, skipWeekends } = bulkScheduleData.value;
  
  if (!startDate) {
    notifyError('入力エラー', '開始日時を入力してください');
    return;
  }
  
  let currentDate = dayjs(startDate);
  
  selectedRows.value.forEach((row) => {
    if (skipWeekends) {
      while (currentDate.day() === 0 || currentDate.day() === 6) {
        currentDate = currentDate.add(1, 'day');
      }
    }
    
    const rowIndex = rowData.value.findIndex(r => r.id === row.id);
    if (rowIndex !== -1) {
      rowData.value[rowIndex].datetime = currentDate.format('YYYY-MM-DDTHH:mm');
      rowData.value[rowIndex].status = 'active';
    }
    
    currentDate = currentDate.add(interval, 'minute');
  });
  
  gridApi.value?.setGridOption('rowData', rowData.value);
  bulkScheduleDialog.value = false;
  
  notifySuccess('一括予約完了', `${selectedRows.value.length}件の投稿を予約しました`);
  
  // Firestore同期（デバウンス処理）
  scheduleSyncUpdate();
};

const exportData = () => {
  if (gridApi.value) {
    gridApi.value.exportDataAsCsv({
      fileName: `instagram-schedule-${dayjs().format('YYYY-MM-DD')}.csv`,
    });
    notifySuccess('エクスポート完了', 'CSVファイルをダウンロードしました');
  }
};

const applyFilters = () => {
  // フィルタは computed property で自動適用される
};

const clearFilters = () => {
  statusFilter.value = '';
  accountFilter.value = '';
};

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

const closeSidebar = () => {
  showSidebar.value = false;
  selectedPost.value = null;
};

// Grid event handlers
const onCellValueChanged = (event: CellValueChangedEvent) => {
  const { data, colDef, newValue } = event;
  
  if (colDef.field && data) {
    data[colDef.field] = newValue;
    scheduleSyncUpdate();
  }
};

const onSelectionChanged = (event: SelectionChangedEvent) => {
  if (gridApi.value) {
    selectedRows.value = gridApi.value.getSelectedRows();
  }
};

const onRowDragEnd = (event: RowDragEndEvent) => {
  const { node, overIndex } = event;
  
  if (overIndex !== undefined && node.data) {
    const draggedData = node.data;
    const newRowData = [...rowData.value];
    
    // Remove from old position
    const oldIndex = newRowData.findIndex(row => row.id === draggedData.id);
    newRowData.splice(oldIndex, 1);
    
    // Insert at new position
    newRowData.splice(overIndex, 0, draggedData);
    
    rowData.value = newRowData;
    scheduleSyncUpdate();
    
    notifySuccess('並び替え完了', '投稿の順序を変更しました');
  }
};

const onCellClicked = (event: CellClickedEvent) => {
  if (event.data && event.colDef.field !== 'dragHandle') {
    selectedPost.value = event.data;
    if (!showSidebar.value) {
      showSidebar.value = true;
    }
  }
};

const onPasteStart = () => {
  syncStatus.value = 'syncing';
};

const onPasteEnd = () => {
  scheduleSyncUpdate();
  notifySuccess('貼り付け完了', 'データが貼り付けられました');
};

// Sidebar event handlers
const onPostSave = (post: any) => {
  const index = rowData.value.findIndex(row => row.id === post.id);
  if (index !== -1) {
    rowData.value[index] = { ...rowData.value[index], ...post };
    gridApi.value?.setGridOption('rowData', rowData.value);
    scheduleSyncUpdate();
  }
};

const onPostDuplicate = (post: any) => {
  const newPost = {
    ...post,
    id: `duplicate-${Date.now()}`,
  };
  rowData.value.push(newPost);
  gridApi.value?.setGridOption('rowData', rowData.value);
  scheduleSyncUpdate();
};

const onPostDelete = (postId: string) => {
  rowData.value = rowData.value.filter(row => row.id !== postId);
  gridApi.value?.setGridOption('rowData', rowData.value);
  selectedPost.value = null;
  scheduleSyncUpdate();
};

// Validation
const validateCell = (rowData: any, field: string): string[] => {
  const errors: string[] = [];
  
  switch (field) {
    case 'datetime':
      if (!rowData.datetime) {
        errors.push('日時は必須です');
      } else if (dayjs(rowData.datetime).isBefore(dayjs())) {
        errors.push('過去の日時は設定できません');
      }
      break;
      
    case 'accountId':
      if (!rowData.accountId) {
        errors.push('アカウントを選択してください');
      }
      break;
      
    case 'text':
      if (rowData.text && rowData.text.length > 2200) {
        errors.push('投稿文は2200文字以内で入力してください');
      }
      break;
  }
  
  return errors;
};

// Sync management
let syncTimeout: ReturnType<typeof setTimeout>;
const scheduleSyncUpdate = () => {
  syncStatus.value = 'syncing';
  
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      // ここで実際のFirestore同期処理を実装
      // await schedulesStore.bulkUpdateSchedules(rowData.value);
      
      syncStatus.value = 'synced';
    } catch (error) {
      console.error('Sync error:', error);
      syncStatus.value = 'error';
      notifyError('同期エラー', 'データの同期に失敗しました');
    }
  }, 300);
};

const getSyncStatusText = (): string => {
  switch (syncStatus.value) {
    case 'syncing': return '同期中...';
    case 'error': return '同期エラー';
    default: return '同期済み';
  }
};

// Keyboard shortcuts
const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    addNewRow();
  }
  
  if (event.ctrlKey && event.shiftKey && event.key === 'S') {
    event.preventDefault();
    bulkSchedule();
  }
};

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      igAccountsStore.loadAccounts(),
      schedulesStore.fetchSchedules(true),
    ]);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
  } catch (error) {
    console.error('Error loading initial data:', error);
    notifyError('初期化エラー', 'データの読み込みに失敗しました');
  }
});

// Cleanup
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcuts);
});
</script>

<style scoped>
.schedule-grid-layout {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
}

.schedule-grid-view {
  flex: 1;
  margin-left: 72px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 768px) {
  .schedule-grid-view {
    margin-left: 280px;
  }
}

@media (max-width: 767px) {
  .schedule-grid-view {
    margin-left: 0;
  }
}

.grid-header {
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.page-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.shortcut-hint {
  font-size: 11px;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.grid-toolbar {
  padding: 16px 32px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  min-width: 150px;
}

.clear-filters-btn {
  padding: 8px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-filters-btn:hover {
  background: #e5e7eb;
}

.selection-info {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
}

.view-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn.active,
.view-btn:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.grid-container {
  flex: 1;
  margin: 0 32px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.schedule-grid {
  height: calc(100vh - 300px);
  width: 100%;
}

.grid-status-bar {
  padding: 12px 32px;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  gap: 16px;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.row-count {
  color: #374151;
  font-weight: 500;
}

.filter-count {
  color: #6b7280;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.sync-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.sync-status.syncing .sync-indicator {
  background: #f59e0b;
  animation: pulse 1.5s infinite;
}

.sync-status.error .sync-indicator {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.keyboard-hints {
  display: flex;
  gap: 16px;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
}

/* AG Grid カスタマイズ */
:deep(.ag-theme-alpine) {
  --ag-grid-size: 8px;
  --ag-row-height: 60px;
  --ag-header-height: 40px;
  --ag-border-color: #e5e7eb;
  --ag-header-background-color: #f9fafb;
  --ag-header-foreground-color: #374151;
  --ag-row-hover-color: #f8fafc;
  --ag-selected-row-background-color: #eff6ff;
  --ag-range-selection-background-color: rgba(59, 130, 246, 0.1);
}

:deep(.ag-theme-alpine .ag-row) {
  border-bottom: 1px solid #f3f4f6;
}

:deep(.ag-theme-alpine .ag-header-cell) {
  font-weight: 600;
  font-size: 14px;
}

:deep(.ag-theme-alpine .cell-error) {
  background-color: #fef2f2;
  border-color: #fca5a5;
}

:deep(.ag-theme-alpine .ag-row-drag) {
  cursor: grab;
  color: #9ca3af;
}

:deep(.ag-theme-alpine .ag-row-drag:active) {
  cursor: grabbing;
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .grid-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: flex-start;
  }
  
  .grid-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .grid-header,
  .grid-toolbar {
    padding: 16px 20px;
  }
  
  .grid-container {
    margin: 0 20px;
  }
  
  .grid-status-bar {
    padding: 12px 20px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .keyboard-hints {
    display: none;
  }
}
</style>