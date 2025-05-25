// Global type definitions for testing and window extensions

declare global {
  interface Window {
    __CYPRESS_TESTING__?: boolean
    __CYPRESS_MOCK_USER__?: {
      uid: string
      email: string
      displayName: string
      photoURL: string | null
    }
  }
}

export {} // Make this a module