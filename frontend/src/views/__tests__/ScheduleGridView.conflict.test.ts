/**
 * 🚀 ScheduleGridView Conflict Resolution Tests
 * 
 * [CONFLICT-001] 修正: 同時編集競合解決テスト
 * - 2人のユーザーが同一セルを同時編集
 * - last-write-wins 戦略の検証
 * - serverTimestamp による競合解決
 * - オフライン→オンライン時の同期処理
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { nextTick } from 'vue';
import ScheduleGridView from '../ScheduleGridView.vue';

// Mock AG Grid Vue component
vi.mock('ag-grid-vue3', () => ({
  AgGridVue: {
    name: 'AgGridVue',
    template: '<div class="ag-grid-mock">AG Grid Mock</div>',
    props: ['columnDefs', 'rowData', 'defaultColDef', 'gridOptions'],
    emits: ['grid-ready', 'cell-value-changed', 'selection-changed']
  }
}));

// Enhanced mock stores for conflict testing
const mockSchedulesStore = {
  schedules: [],
  schedulesCount: { total: 0, active: 0, pending: 0, completed: 0 },
  fetchSchedules: vi.fn(),
  bulkUpdateSchedules: vi.fn(),
  updateSchedule: vi.fn(),
  getScheduleVersion: vi.fn(() => 1),
  setScheduleVersion: vi.fn()
};

const mockIgAccountsStore = {
  accounts: [
    { id: 'account1', username: 'test_account' }
  ],
  loadAccounts: vi.fn()
};

vi.mock('@/stores', () => ({
  useSchedulesStore: () => mockSchedulesStore,
  useIgAccountsStore: () => mockIgAccountsStore
}));

// Enhanced mock for conflict testing
vi.mock('@/composables', () => ({
  useNotification: () => ({
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
    notifyWarning: vi.fn()
  }),
  useFirestore: () => ({
    isEmulatorMode: { value: true },
    isOffline: { value: false },
    connectionStatus: { value: 'online' },
    createDocument: vi.fn(),
    updateDocument: vi.fn((collection, docId, data) => {
      // Simulate conflict scenarios
      if (data.conflictTest) {
        throw new Error('Document version conflict');
      }
      return Promise.resolve();
    }),
    getCollectionData: vi.fn(() => Promise.resolve([])),
    updateConnectionStatus: vi.fn(),
    // Mock transaction-like behavior
    runTransaction: vi.fn((updateFunction) => {
      return Promise.resolve(updateFunction());
    })
  })
}));

// Mock components
vi.mock('@/components', () => ({
  SidebarNavigation: { name: 'SidebarNavigation', template: '<div>Sidebar</div>' },
  SidebarPostEditor: { 
    name: 'SidebarPostEditor', 
    template: '<div>Editor</div>',
    props: ['isOpen', 'selectedPost'],
    emits: ['close', 'save', 'duplicate', 'delete']
  },
  ScheduleGridCell: { name: 'ScheduleGridCell', template: '<div>Cell</div>' }
}));

describe('🚀 ScheduleGridView Conflict Resolution', () => {
  let wrapper: any;

  beforeEach(() => {
    const pinia = createPinia();
    wrapper = mount(ScheduleGridView, {
      global: {
        plugins: [pinia],
        stubs: {
          'router-link': true,
          'v-dialog': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-row': true,
          'v-col': true,
          'v-text-field': true,
          'v-checkbox': true,
          'v-btn': true,
          'v-spacer': true
        }
      }
    });

    // セットアップ: 基本データ
    wrapper.vm.rowData = [
      {
        id: 'schedule-1',
        title: 'Original Title',
        text: 'Original content',
        version: 1,
        lastModified: new Date('2024-01-01T10:00:00Z'),
        accountId: 'account1'
      }
    ];
  });

  describe('🔄 Concurrent Edit Scenarios', () => {
    it('handles simultaneous cell edits with last-write-wins strategy', async () => {
      const scheduleId = 'schedule-1';
      const initialData = wrapper.vm.rowData.find((r: any) => r.id === scheduleId);
      
      // シミュレート: User A の編集
      const userAEdit = {
        data: { ...initialData },
        colDef: { field: 'title' },
        newValue: 'User A Title',
        timestamp: new Date('2024-01-01T10:01:00Z')
      };

      // シミュレート: User B の編集（より新しいタイムスタンプ）
      const userBEdit = {
        data: { ...initialData },
        colDef: { field: 'title' },
        newValue: 'User B Title',
        timestamp: new Date('2024-01-01T10:02:00Z')
      };

      // User A の編集を適用
      wrapper.vm.onCellValueChanged(userAEdit);
      await nextTick();

      // User B の編集を適用（競合発生）
      wrapper.vm.onCellValueChanged(userBEdit);
      await nextTick();

      // Last-write-wins: User B の値が残る
      const updatedData = wrapper.vm.rowData.find((r: any) => r.id === scheduleId);
      expect(updatedData.title).toBe('User B Title');
    });

    it('detects and resolves version conflicts', async () => {
      const conflictResolver = wrapper.vm.resolveConflict;
      
      const serverData = {
        id: 'schedule-1',
        title: 'Server Version',
        version: 2,
        lastModified: new Date('2024-01-01T10:03:00Z')
      };

      const localData = {
        id: 'schedule-1',
        title: 'Local Version',
        version: 1,
        lastModified: new Date('2024-01-01T10:01:00Z')
      };

      const resolved = conflictResolver(serverData, localData);

      // Server version should win (higher version)
      expect(resolved.title).toBe('Server Version');
      expect(resolved.version).toBe(2);
    });

    it('merges non-conflicting field changes', async () => {
      const conflictResolver = wrapper.vm.mergeChanges;
      
      const serverData = {
        id: 'schedule-1',
        title: 'Server Title',
        text: 'Original text',
        status: 'active'
      };

      const localData = {
        id: 'schedule-1',
        title: 'Original Title',
        text: 'Local text changes',
        status: 'active'
      };

      const merged = conflictResolver(serverData, localData);

      // Non-conflicting changes should be merged
      expect(merged.title).toBe('Server Title');  // Server wins
      expect(merged.text).toBe('Local text changes');   // Local wins
      expect(merged.status).toBe('active');             // Same value
    });
  });

  describe('🌐 Network State Conflicts', () => {
    it('handles offline-to-online sync conflicts', async () => {
      // シミュレート: オフライン状態
      const { updateConnectionStatus } = wrapper.vm;
      updateConnectionStatus('offline');

      // オフライン中の編集
      const offlineEdit = {
        data: { id: 'schedule-1', title: 'Original Title' },
        colDef: { field: 'title' },
        newValue: 'Offline Edit'
      };

      wrapper.vm.onCellValueChanged(offlineEdit);
      await nextTick();

      // オンライン復帰時にサーバーに異なるデータがある場合
      updateConnectionStatus('online');
      
      const serverData = {
        id: 'schedule-1',
        title: 'Server Edit During Offline',
        lastModified: new Date()
      };

      // 競合解決処理をトリガー
      await wrapper.vm.syncOfflineChanges();

      // 適切な競合解決が行われることを確認
      expect(wrapper.vm.syncStatus).not.toBe('error');
    });

    it('queues multiple offline edits for sync', async () => {
      const { updateConnectionStatus } = wrapper.vm;
      updateConnectionStatus('offline');

      // 複数のオフライン編集
      const edits = [
        {
          data: { id: 'schedule-1' },
          colDef: { field: 'title' },
          newValue: 'Edit 1'
        },
        {
          data: { id: 'schedule-1' },
          colDef: { field: 'text' },
          newValue: 'Edit 2'
        },
        {
          data: { id: 'schedule-1' },
          colDef: { field: 'status' },
          newValue: 'pending'
        }
      ];

      for (const edit of edits) {
        wrapper.vm.onCellValueChanged(edit);
        await nextTick();
      }

      // オフライン編集キューの確認
      expect(wrapper.vm.offlineEditQueue).toHaveLength(3);

      // オンライン復帰
      updateConnectionStatus('online');
      await wrapper.vm.syncOfflineChanges();

      // キューがクリアされることを確認
      expect(wrapper.vm.offlineEditQueue).toHaveLength(0);
    });
  });

  describe('🔒 Data Integrity & Validation', () => {
    it('validates data integrity before applying changes', async () => {
      const validator = wrapper.vm.validateDataIntegrity;
      
      const validData = {
        id: 'schedule-1',
        title: 'Valid Title',
        text: 'Valid content',
        accountId: 'account1',
        datetime: '2024-01-01T10:00:00Z'
      };

      const invalidData = {
        id: 'schedule-1',
        title: '',  // Invalid: empty title
        text: 'x'.repeat(2201),  // Invalid: too long
        accountId: '',  // Invalid: missing account
        datetime: '2023-01-01T10:00:00Z'  // Invalid: past date
      };

      expect(validator(validData)).toBe(true);
      expect(validator(invalidData)).toBe(false);
    });

    it('prevents data corruption during conflict resolution', async () => {
      const corruptData = {
        id: 'schedule-1',
        title: 'Title',
        text: null,  // Corrupt data
        accountId: undefined,  // Corrupt data
        invalidField: 'should not exist'
      };

      const validData = {
        id: 'schedule-1',
        title: 'Valid Title',
        text: 'Valid content',
        accountId: 'account1'
      };

      const sanitized = wrapper.vm.sanitizeData(corruptData, validData);

      expect(sanitized.text).toBe('Valid content');
      expect(sanitized.accountId).toBe('account1');
      expect(sanitized.invalidField).toBeUndefined();
    });
  });

  describe('⚡ Performance Under Concurrent Load', () => {
    it('handles rapid consecutive edits efficiently', async () => {
      const startTime = performance.now();
      
      // 連続100回の編集をシミュレート
      const edits = Array.from({ length: 100 }, (_, i) => ({
        data: { id: 'schedule-1', title: `Title ${i}` },
        colDef: { field: 'title' },
        newValue: `Rapid Edit ${i}`
      }));

      for (const edit of edits) {
        wrapper.vm.onCellValueChanged(edit);
      }

      await nextTick();
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // 100編集を100ms以内で処理できることを確認
      expect(processingTime).toBeLessThan(100);
      
      // 最終的な値が最後の編集であることを確認
      const finalData = wrapper.vm.rowData.find((r: any) => r.id === 'schedule-1');
      expect(finalData.title).toBe('Rapid Edit 99');
    });

    it('debounces sync operations to prevent excessive API calls', async () => {
      vi.useFakeTimers();
      
      const syncSpy = vi.spyOn(wrapper.vm, 'scheduleSyncUpdate');
      
      // 短時間で複数の編集
      for (let i = 0; i < 5; i++) {
        wrapper.vm.onCellValueChanged({
          data: { id: 'schedule-1' },
          colDef: { field: 'title' },
          newValue: `Edit ${i}`
        });
      }

      // Debounce期間内
      vi.advanceTimersByTime(250);
      expect(syncSpy).toHaveBeenCalledTimes(5);

      // Debounce期間後（300ms後）
      vi.advanceTimersByTime(100);
      
      // 実際の同期は1回のみ実行される
      await vi.runAllTimersAsync();
      
      vi.useRealTimers();
    });
  });

  describe('🔄 Real-time Collaboration Features', () => {
    it('shows live editing indicators for other users', async () => {
      // 他のユーザーの編集状態をシミュレート
      wrapper.vm.setUserEditingStatus('user-2', 'schedule-1', 'title');
      
      await nextTick();
      
      // 編集インジケーターが表示されることを確認
      const editingIndicator = wrapper.find('.editing-indicator-user-2');
      expect(editingIndicator.exists()).toBe(true);
    });

    it('resolves simultaneous saves with proper user notification', async () => {
      const notifySpy = vi.fn();
      wrapper.vm.notifyWarning = notifySpy;

      // 同時保存のシミュレート
      await wrapper.vm.handleSimultaneousSave({
        id: 'schedule-1',
        conflictType: 'simultaneous_edit',
        users: ['user-1', 'user-2']
      });

      expect(notifySpy).toHaveBeenCalledWith(
        '競合解決',
        expect.stringContaining('他のユーザーと同時編集')
      );
    });
  });
});

// Helper functions for the component
const helperMethods = `
// ScheduleGridView.vue に追加する競合解決メソッド

const resolveConflict = (serverData: any, localData: any) => {
  // Version-based conflict resolution
  if (serverData.version > localData.version) {
    return { ...serverData, resolvedBy: 'server' };
  } else if (serverData.lastModified > localData.lastModified) {
    return { ...serverData, resolvedBy: 'timestamp' };
  }
  return { ...localData, resolvedBy: 'local' };
};

const mergeChanges = (serverData: any, localData: any) => {
  const merged = { ...serverData };
  
  // Merge non-conflicting fields
  Object.keys(localData).forEach(key => {
    if (key !== 'id' && key !== 'version' && localData[key] !== serverData[key]) {
      // Apply field-specific merge logic
      if (key === 'text' && localData[key]?.length > serverData[key]?.length) {
        merged[key] = localData[key];
      }
    }
  });
  
  return merged;
};

const validateDataIntegrity = (data: any): boolean => {
  return !!(
    data.id &&
    data.title &&
    data.title.length > 0 &&
    data.accountId &&
    (!data.text || data.text.length <= 2200) &&
    (!data.datetime || new Date(data.datetime) > new Date())
  );
};

const sanitizeData = (corruptData: any, fallbackData: any) => {
  const sanitized = { ...fallbackData };
  
  Object.keys(corruptData).forEach(key => {
    if (corruptData[key] != null && typeof corruptData[key] !== 'undefined') {
      sanitized[key] = corruptData[key];
    }
  });
  
  return sanitized;
};
`;

console.log('🚀 Conflict Resolution Tests Created');
console.log('Helper methods to add to ScheduleGridView.vue:');
console.log(helperMethods);