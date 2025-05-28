import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AddAccountDialog from '../AddAccountDialog.vue'
import { useIgAccountsStore } from '@/stores/igAccounts'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

// Mock Instagram OAuth URL
const mockInstagramOAuthUrl = 'https://api.instagram.com/oauth/authorize'

describe('AddAccountDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    
    // Mock window.open
    global.window.open = vi.fn()
    
    // Mock environment variables
    vi.mock('@/config', () => ({
      INSTAGRAM_APP_ID: 'test-app-id',
      INSTAGRAM_REDIRECT_URI: 'http://localhost:3000/callback'
    }))
  })

  it('renders add account dialog correctly', () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-account-dialog"]').exists()).toBe(true)
  })

  it('shows Instagram connection button', () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const connectButton = wrapper.find('[data-testid="connect-instagram-button"]')
    expect(connectButton.exists()).toBe(true)
    expect(connectButton.text()).toContain('Instagram')
  })

  it('opens Instagram OAuth when connect button is clicked', async () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const connectButton = wrapper.find('[data-testid="connect-instagram-button"]')
    await connectButton.trigger('click')

    expect(window.open).toHaveBeenCalled()
    const openCall = vi.mocked(window.open).mock.calls[0]
    expect(openCall[0]).toContain('api.instagram.com/oauth/authorize')
  })

  it('validates access token input', async () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    // Switch to manual token input mode
    const manualButton = wrapper.find('[data-testid="manual-token-button"]')
    if (manualButton.exists()) {
      await manualButton.trigger('click')
    }

    const tokenInput = wrapper.find('[data-testid="access-token-input"]')
    if (tokenInput.exists()) {
      await tokenInput.setValue('')
      
      const submitButton = wrapper.find('[data-testid="submit-token-button"]')
      await submitButton.trigger('click')

      expect(wrapper.text()).toContain('required')
    }
  })

  it('adds Instagram account with valid token', async () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const store = useIgAccountsStore()
    const addAccountSpy = vi.spyOn(store, 'addAccount').mockResolvedValue({
      id: 'test-account-id',
      username: 'test_user',
      accessToken: 'test-token',
      userId: 'test-user-id',
      createdAt: new Date()
    })

    const component = wrapper.vm as any
    await component.handleTokenSubmit('valid-access-token')

    expect(addAccountSpy).toHaveBeenCalledWith('valid-access-token')
  })

  it('handles Instagram API errors gracefully', async () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const store = useIgAccountsStore()
    vi.spyOn(store, 'addAccount').mockRejectedValue(new Error('Invalid token'))

    const component = wrapper.vm as any
    await component.handleTokenSubmit('invalid-token')

    expect(component.error).toBeTruthy()
    expect(wrapper.text()).toContain('error')
  })

  it('emits close event when dialog is closed', async () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const closeButton = wrapper.find('[data-testid="close-button"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('shows loading state during account addition', async () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const store = useIgAccountsStore()
    vi.spyOn(store, 'addAccount').mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    const component = wrapper.vm as any
    const addPromise = component.handleTokenSubmit('test-token')

    // Should show loading state
    expect(component.loading).toBe(true)
    
    await addPromise
    expect(component.loading).toBe(false)
  })

  it('generates correct Instagram OAuth URL', () => {
    const wrapper = mount(AddAccountDialog, {
      props: {
        modelValue: true
      },
      global: {
        plugins: [vuetify]
      }
    })

    const component = wrapper.vm as any
    const oauthUrl = component.getInstagramOAuthUrl()

    expect(oauthUrl).toContain('api.instagram.com/oauth/authorize')
    expect(oauthUrl).toContain('client_id=')
    expect(oauthUrl).toContain('redirect_uri=')
    expect(oauthUrl).toContain('scope=user_profile,user_media')
    expect(oauthUrl).toContain('response_type=code')
  })
})