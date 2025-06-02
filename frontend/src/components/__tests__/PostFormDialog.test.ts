import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PostFormDialog from '../forms/PostFormDialog.vue';

// Mock the stores
vi.mock('@/stores/posts', () => ({
  usePostsStore: vi.fn(() => ({
    createPost: vi.fn(),
    loading: false,
    error: null,
  })),
}));

describe('PostFormDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('component can be imported', async () => {
    const module = await import('../forms/PostFormDialog.vue');
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe('object');
  });

  it('renders post form dialog correctly', () => {
    const wrapper = mount(PostFormDialog, {
      props: {
        modelValue: true,
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('shows dialog when modelValue is true', () => {
    const wrapper = mount(PostFormDialog, {
      props: {
        modelValue: true,
      },
    });

    expect(wrapper.props('modelValue')).toBe(true);
  });

  it('emits close event', async () => {
    const wrapper = mount(PostFormDialog, {
      props: {
        modelValue: true,
      },
    });

    await wrapper.vm.$emit('update:modelValue', false);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });
});
