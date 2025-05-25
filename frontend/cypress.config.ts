import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshot: true,
    screenshotOnRunFailure: true,
    watchForFileChanges: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    setupNodeEvents(on, config) {
      // Task plugins
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        
        // Custom task for database seeding
        seedDatabase() {
          // Implementation for seeding test data
          return null
        },
        
        // Custom task for cleanup
        cleanupDatabase() {
          // Implementation for cleanup
          return null
        }
      })
      
      // Environment-specific config
      if (config.env.environment === 'staging') {
        config.baseUrl = 'https://omniy-staging.web.app'
      } else if (config.env.environment === 'production') {
        config.baseUrl = 'https://omniy-prod.web.app'
      }
      
      return config
    },
  },

  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  
  env: {
    // Test user credentials
    TEST_USER_EMAIL: 'test@omniy.app',
    TEST_USER_PASSWORD: 'testpassword123',
    
    // Feature flags for testing
    ENABLE_PERFORMANCE_TESTS: true,
    ENABLE_ACCESSIBILITY_TESTS: true,
    
    // API endpoints
    API_BASE_URL: 'http://localhost:5001',
  }
})