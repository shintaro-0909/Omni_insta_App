import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    downloadsFolder: 'cypress/downloads',
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
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    experimentalStudio: true,
    experimentalInteractiveRunEvents: true,
    
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
          console.log('Seeding test database...')
          return null
        },
        
        // Custom task for cleanup
        cleanupDatabase() {
          // Implementation for cleanup
          console.log('Cleaning up test database...')
          return null
        },
        
        // File existence check for uploads
        fileExists(filename) {
          const fs = require('fs')
          const path = require('path')
          const fixturePath = path.join(__dirname, 'cypress/fixtures', filename)
          return fs.existsSync(fixturePath)
        }
      })
      
      // Environment-specific config
      if (config.env.environment === 'staging') {
        config.baseUrl = 'https://omniy-staging.web.app'
        config.env.API_BASE_URL = 'https://api-staging.omniy.app'
      } else if (config.env.environment === 'production') {
        config.baseUrl = 'https://omniy-prod.web.app'
        config.env.API_BASE_URL = 'https://api.omniy.app'
        // Disable experimental features in production
        config.experimentalStudio = false
        config.video = false
      }
      
      // Performance optimization
      if (config.env.CI) {
        config.video = false
        config.screenshot = false
      }
      
      // Browser configuration
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-gpu')
        }
        return launchOptions
      })
      
      // File preprocessing
      on('file:preprocessor', require('@cypress/webpack-preprocessor')({
        webpackOptions: {
          resolve: {
            extensions: ['.ts', '.tsx', '.js']
          },
          module: {
            rules: [
              {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: { transpileOnly: true }
              }
            ]
          }
        }
      }))
      
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
    ENABLE_API_MOCKING: true,
    
    // API endpoints
    API_BASE_URL: 'http://localhost:5001',
    FIREBASE_EMULATOR_URL: 'http://localhost:9099',
    FIRESTORE_EMULATOR_URL: 'http://localhost:8080',
    
    // Test data configuration
    TEST_DATA_CLEANUP: true,
    TEST_DATA_SEED: true,
    
    // Retry configuration
    RETRY_ATTEMPTS: 2,
    COMMAND_TIMEOUT: 10000,
    
    // Screenshot and video settings
    SCREENSHOT_ON_FAILURE: true,
    VIDEO_COMPRESSION: true
  }
})