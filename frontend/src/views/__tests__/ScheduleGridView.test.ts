import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ScheduleGridView from '../ScheduleGridView.vue';
import { createPinia } from 'pinia';
import { nextTick } from 'vue';

// Mock AG Grid Vue component
vi.mock('ag-grid-vue3', () => ({
  AgGridVue: {
    name: 'AgGridVue',
    template: '<div class="ag-grid-mock">AG Grid Mock</div>',
    props: ['columnDefs', 'rowData', 'defaultColDef', 'gridOptions'],
    emits: ['grid-ready', 'cell-value-changed', 'selection-changed']
  }
}));

// Mock stores
const mockSchedulesStore = {
  schedules: [],
  schedulesCount: { total: 0, active: 0, pending: 0, completed: 0 },
  fetchSchedules: vi.fn(),
  bulkUpdateSchedules: vi.fn()
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

vi.mock('@/composables', () => ({
  useNotification: () => ({
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
    notifyWarning: vi.fn()
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

describe('ScheduleGridView', () => {
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
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.schedule-grid-view').exists()).toBe(true);
  });

  it('displays page title and description', () => {
    expect(wrapper.find('.page-title').text()).toContain('Instagram投稿グリッド管理');
    expect(wrapper.find('.page-description').text()).toContain('Googleスプレッドシート風');
  });

  it('has action buttons', () => {
    const actionButtons = wrapper.findAll('.action-btn');
    expect(actionButtons.length).toBeGreaterThan(0);
    
    const addButton = wrapper.find('.action-btn.primary');
    expect(addButton.text()).toContain('新しい投稿');
  });

  it('adds new row when add button clicked', async () => {
    const initialRowCount = wrapper.vm.rowData.length;
    
    await wrapper.find('.action-btn.primary').trigger('click');
    
    expect(wrapper.vm.rowData.length).toBe(initialRowCount + 1);
    expect(wrapper.vm.rowData[0].title).toContain('新規投稿');
  });

  it('opens bulk schedule dialog', async () => {
    // Select some rows first
    wrapper.vm.selectedRows = [
      { id: 'test1', title: 'Test 1' },
      { id: 'test2', title: 'Test 2' }
    ];
    
    await nextTick();
    
    const bulkButton = wrapper.find('.action-btn.secondary');
    await bulkButton.trigger('click');
    
    expect(wrapper.vm.bulkScheduleDialog).toBe(true);
  });

  it('applies filters correctly', async () => {
    wrapper.vm.rowData = [
      { id: '1', status: 'active', accountId: 'account1' },
      { id: '2', status: 'pending', accountId: 'account1' },
      { id: '3', status: 'active', accountId: 'account2' }
    ];
    
    wrapper.vm.statusFilter = 'active';
    await nextTick();
    
    const filtered = wrapper.vm.filteredRowData;
    expect(filtered.length).toBe(2);
    expect(filtered.every((row: any) => row.status === 'active')).toBe(true);
  });

  it('clears filters', async () => {
    wrapper.vm.statusFilter = 'active';
    wrapper.vm.accountFilter = 'account1';
    
    await wrapper.vm.clearFilters();
    
    expect(wrapper.vm.statusFilter).toBe('');
    expect(wrapper.vm.accountFilter).toBe('');
  });

  it('handles cell value changes', () => {
    const mockEvent = {
      data: { id: 'test1', title: 'Original' },
      colDef: { field: 'title' },
      newValue: 'Updated'
    };
    
    wrapper.vm.onCellValueChanged(mockEvent);
    
    expect(mockEvent.data.title).toBe('Updated');
  });

  it('validates cells correctly', () => {
    const testData = {
      datetime: '',
      accountId: '',
      text: 'x'.repeat(2201)
    };
    
    const datetimeErrors = wrapper.vm.validateCell(testData, 'datetime');
    expect(datetimeErrors).toContain('日時は必須です');
    
    const accountErrors = wrapper.vm.validateCell(testData, 'accountId');
    expect(accountErrors).toContain('アカウントを選択してください');
    
    const textErrors = wrapper.vm.validateCell(testData, 'text');
    expect(textErrors).toContain('投稿文は2200文字以内で入力してください');
  });

  it('handles row drag and drop', () => {
    wrapper.vm.rowData = [
      { id: '1', title: 'First' },
      { id: '2', title: 'Second' },
      { id: '3', title: 'Third' }
    ];
    
    const mockEvent = {
      node: { data: { id: '1', title: 'First' } },
      overIndex: 2
    };
    
    wrapper.vm.onRowDragEnd(mockEvent);
    
    // Check that the row was moved to the new position
    expect(wrapper.vm.rowData[2].id).toBe('1');
  });

  it('opens sidebar on cell click', () => {
    const mockEvent = {
      data: { id: 'test1', title: 'Test' },
      colDef: { field: 'title' }
    };
    
    wrapper.vm.onCellClicked(mockEvent);
    
    expect(wrapper.vm.selectedPost).toEqual(mockEvent.data);
    expect(wrapper.vm.showSidebar).toBe(true);
  });

  it('handles sidebar post save', () => {
    wrapper.vm.rowData = [
      { id: 'test1', title: 'Original' }
    ];
    
    const updatedPost = { id: 'test1', title: 'Updated' };
    wrapper.vm.onPostSave(updatedPost);
    
    expect(wrapper.vm.rowData[0].title).toBe('Updated');
  });

  it('handles post duplication', () => {
    const originalCount = wrapper.vm.rowData.length;
    const post = { id: 'original', title: 'Original Post' };
    
    wrapper.vm.onPostDuplicate(post);
    
    expect(wrapper.vm.rowData.length).toBe(originalCount + 1);
    expect(wrapper.vm.rowData[wrapper.vm.rowData.length - 1].title).toContain('Original Post');
  });

  it('handles post deletion', () => {
    wrapper.vm.rowData = [
      { id: 'keep', title: 'Keep' },
      { id: 'delete', title: 'Delete' }
    ];
    
    wrapper.vm.onPostDelete('delete');
    
    expect(wrapper.vm.rowData.length).toBe(1);
    expect(wrapper.vm.rowData[0].id).toBe('keep');
  });

  it('displays sync status correctly', () => {
    wrapper.vm.syncStatus = 'syncing';
    expect(wrapper.vm.getSyncStatusText()).toBe('同期中...');
    
    wrapper.vm.syncStatus = 'error';
    expect(wrapper.vm.getSyncStatusText()).toBe('同期エラー');
    
    wrapper.vm.syncStatus = 'synced';
    expect(wrapper.vm.getSyncStatusText()).toBe('同期済み');
  });

  it('shows row count in status bar', () => {
    wrapper.vm.rowData = [
      { id: '1' }, { id: '2' }, { id: '3' }
    ];
    
    const statusBar = wrapper.find('.grid-status-bar');
    expect(statusBar.text()).toContain('総投稿数: 3行');
  });
});