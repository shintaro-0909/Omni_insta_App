import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UsageDashboard from '../UsageDashboard.vue'

// Mock the stores
vi.mock('@/stores/planLimits', () => ({
  usePlanLimitsStore: vi.fn(() => ({
    currentPlan: 'Free',
    usage: {
      accountsUsed: 0,
      postsUsed: 0,
      scheduleCreationsUsed: 0
    },
    limits: {
      accounts: 1,
      postsPerMonth: 10,
      scheduleCreations: 10
    },
    loading: false,
    fetchLimitsAndUsage: vi.fn()
  }))
}))

describe('UsageDashboard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('component can be imported', async () => {
    const module = await import('../UsageDashboard.vue')
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('object')
  })

  it('renders usage dashboard correctly', () => {
    const wrapper = mount(UsageDashboard)
    
    expect(wrapper.exists()).toBe(true)
  })

  it('displays plan information', () => {
    const wrapper = mount(UsageDashboard)

    expect(wrapper.text()).toContain('Free')
  })

  it('shows usage metrics', () => {
    const wrapper = mount(UsageDashboard)

    expect(wrapper.text()).toContain('使用量ダッシュボード')
  })
})