import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Global test setup
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn()
}

// Create Vuetify instance for testing
const vuetify = createVuetify({
  components,
  directives,
})

// Vue Test Utils global configuration
config.global.plugins = [vuetify]
config.global.mocks = {
  $t: (key: string) => key,
  $i18n: {
    locale: 'ja'
  }
}

// Mock Firebase
vi.mock('@/services/firebase', () => ({
  auth: {
    currentUser: null
  },
  db: {},
  functions: {},
  storage: {},
  analytics: {}
}))

// Mock Vuetify
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})