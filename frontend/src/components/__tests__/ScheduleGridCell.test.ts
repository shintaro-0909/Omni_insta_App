import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ScheduleGridCell from '../ScheduleGridCell.vue';
import { createPinia } from 'pinia';

// Mock stores
const mockIgAccountsStore = {
  accounts: [
    { id: 'account1', username: 'test_account', profilePictureUrl: '' }
  ]
};

vi.mock('@/stores', () => ({
  useIgAccountsStore: () => mockIgAccountsStore
}));

describe('ScheduleGridCell', () => {
  let wrapper: any;
  
  const defaultProps = {
    value: 'test value',
    cellType: 'text' as const,
    rowData: {
      id: 'test-1',
      datetime: '2024-01-01T10:00',
      accountId: 'account1',
      text: 'Test post',
      status: 'pending'
    },
    columnIndex: 0
  };

  beforeEach(() => {
    const pinia = createPinia();
    wrapper = mount(ScheduleGridCell, {
      props: defaultProps,
      global: {
        plugins: [pinia]
      }
    });
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.schedule-grid-cell').exists()).toBe(true);
  });

  it('displays text cell correctly', () => {
    expect(wrapper.find('.text-cell').exists()).toBe(true);
    expect(wrapper.find('.text-preview').text()).toBe('test value');
  });

  it('enters edit mode on click', async () => {
    await wrapper.find('.schedule-grid-cell').trigger('click');
    expect(wrapper.vm.isEditing).toBe(true);
    expect(wrapper.find('.text-textarea').exists()).toBe(true);
  });

  it('validates datetime field', () => {
    wrapper = mount(ScheduleGridCell, {
      props: {
        ...defaultProps,
        cellType: 'datetime',
        value: ''
      },
      global: {
        plugins: [createPinia()]
      }
    });

    const errors = wrapper.vm.validateCell();
    expect(errors).toContain('日時は必須です');
  });

  it('validates text length', () => {
    const longText = 'x'.repeat(2201);
    wrapper = mount(ScheduleGridCell, {
      props: {
        ...defaultProps,
        value: longText
      },
      global: {
        plugins: [createPinia()]
      }
    });

    wrapper.vm.editValue = longText;
    const errors = wrapper.vm.validateCell();
    expect(errors).toContain('投稿文は2200文字以内で入力してください');
  });

  it('emits cell-value-changed on valid edit', async () => {
    await wrapper.find('.schedule-grid-cell').trigger('click');
    
    const textarea = wrapper.find('.text-textarea');
    await textarea.setValue('new value');
    
    // Trigger blur to finish edit
    await textarea.trigger('blur');
    
    expect(wrapper.emitted('cell-value-changed')).toBeTruthy();
    expect(wrapper.emitted('cell-value-changed')?.[0]).toEqual(['new value']);
  });

  it('handles account selection', () => {
    wrapper = mount(ScheduleGridCell, {
      props: {
        ...defaultProps,
        cellType: 'account',
        value: 'account1'
      },
      global: {
        plugins: [createPinia()]
      }
    });

    expect(wrapper.find('.account-display').exists()).toBe(true);
    expect(wrapper.vm.selectedAccount).toBeTruthy();
    expect(wrapper.vm.selectedAccount.username).toBe('test_account');
  });

  it('displays status badge correctly', () => {
    wrapper = mount(ScheduleGridCell, {
      props: {
        ...defaultProps,
        cellType: 'status',
        value: 'active'
      },
      global: {
        plugins: [createPinia()]
      }
    });

    expect(wrapper.find('.status-badge').exists()).toBe(true);
    expect(wrapper.find('.status-badge').text()).toContain('アクティブ');
    expect(wrapper.find('.status-active').exists()).toBe(true);
  });

  it('handles image URL validation', () => {
    wrapper = mount(ScheduleGridCell, {
      props: {
        ...defaultProps,
        cellType: 'imageUrl',
        value: 'invalid-url'
      },
      global: {
        plugins: [createPinia()]
      }
    });

    wrapper.vm.editValue = 'invalid-url';
    const errors = wrapper.vm.validateCell();
    expect(errors).toContain('有効なURLを入力してください');
  });

  it('allows canceling edit with escape key', async () => {
    const originalValue = 'original';
    wrapper = mount(ScheduleGridCell, {
      props: {
        ...defaultProps,
        value: originalValue
      },
      global: {
        plugins: [createPinia()]
      }
    });

    await wrapper.find('.schedule-grid-cell').trigger('click');
    
    const textarea = wrapper.find('.text-textarea');
    await textarea.setValue('changed value');
    await textarea.trigger('keyup.escape');
    
    expect(wrapper.vm.isEditing).toBe(false);
    expect(wrapper.vm.editValue).toBe(originalValue);
  });
});