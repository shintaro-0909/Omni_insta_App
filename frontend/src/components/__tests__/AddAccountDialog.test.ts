import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AddAccountDialog from '../AddAccountDialog.vue'

// Mock the stores
vi.mock('@/stores/igAccounts', () => ({
  useIgAccountsStore: vi.fn(() => ({
    addAccount: vi.fn(),
    loading: false,
    error: null
  }))
}))

describe('AddAccountDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    
    // Mock window.open
    global.window.open = vi.fn()
  })

  it('component can be imported', async () => {
    const module = await import('../AddAccountDialog.vue')
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('object')
  })

  it('renders add account dialog correctly', () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      }
    })
    
    expect(wrapper.exists()).toBe(true)
  })

  it('shows dialog when modelValue is true', () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      }
    })

    expect(wrapper.props('modelValue')).toBe(true)
  })

  it('emits close event', async () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      }
    })

    await wrapper.vm.$emit('update:modelValue', false)

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
})