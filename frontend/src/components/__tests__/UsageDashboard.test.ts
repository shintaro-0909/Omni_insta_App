import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UsageDashboard from '../UsageDashboard.vue'
import { usePlanLimitsStore } from '@/stores/planLimits'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

describe('UsageDashboard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders usage dashboard correctly', () => {
    const wrapper = mount(UsageDashboard, {
      global: {
        plugins: [vuetify]
      }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('[data-testid="usage-dashboard"]').exists()).toBe(true)
  })

  it('displays correct usage information', async () => {
    const wrapper = mount(UsageDashboard, {
      global: {
        plugins: [vuetify]
      }
    })

    const store = usePlanLimitsStore()
    
    // Mock store data
    store.currentPlan = 'Basic'
    store.usage = {
      accountsUsed: 2,
      postsUsed: 45,
      scheduleCreationsUsed: 12
    }
    store.limits = {
      accounts: 3,
      postsPerMonth: 100,
      scheduleCreations: 50
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Basic')
    expect(wrapper.text()).toContain('2/3')
    expect(wrapper.text()).toContain('45/100')
  })

  it('shows upgrade button when approaching limits', async () => {
    const wrapper = mount(UsageDashboard, {
      global: {
        plugins: [vuetify]
      }
    })

    const store = usePlanLimitsStore()
    
    // Set usage near limits (>80%)
    store.currentPlan = 'Free'
    store.usage = {
      accountsUsed: 1,
      postsUsed: 9,
      scheduleCreationsUsed: 8
    }
    store.limits = {
      accounts: 1,
      postsPerMonth: 10,
      scheduleCreations: 10
    }

    await wrapper.vm.$nextTick()

    const upgradeButton = wrapper.find('[data-testid="upgrade-button"]')
    expect(upgradeButton.exists()).toBe(true)
  })

  it('calculates usage percentage correctly', () => {
    const wrapper = mount(UsageDashboard, {
      global: {
        plugins: [vuetify]
      }
    })

    const component = wrapper.vm as any
    expect(component.getUsagePercentage(25, 100)).toBe(25)
    expect(component.getUsagePercentage(0, 100)).toBe(0)
    expect(component.getUsagePercentage(100, 100)).toBe(100)
  })

  it('determines correct progress bar color based on usage', () => {
    const wrapper = mount(UsageDashboard, {
      global: {
        plugins: [vuetify]
      }
    })

    const component = wrapper.vm as any
    expect(component.getProgressColor(30)).toBe('success')
    expect(component.getProgressColor(75)).toBe('warning')
    expect(component.getProgressColor(95)).toBe('error')
  })
})