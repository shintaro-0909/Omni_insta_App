import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Firebase設定 - 環境変数から読み込み
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// 環境変数の検証
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is missing. Please check your environment variables.')
}

// Firebase初期化
const app = initializeApp(firebaseConfig)

// サービス初期化
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)

// 開発環境でエミュレータに接続
const ENABLE_EMULATOR = import.meta.env.VITE_ENABLE_FIREBASE_EMULATOR === 'true'
if (import.meta.env.DEV && ENABLE_EMULATOR) {
  try {
    // Auth エミュレータ
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    
    // Firestore エミュレータ
    connectFirestoreEmulator(db, 'localhost', 8080)
    
    // Functions エミュレータ
    connectFunctionsEmulator(functions, 'localhost', 5001)

    // Storage エミュレータ
    connectStorageEmulator(storage, 'localhost', 9199)
    
    console.log('🔧 Firebase エミュレータに接続しました')
  } catch (error) {
    console.warn('⚠️ Firebase エミュレータ接続に失敗:', error)
  }
}

export default app 