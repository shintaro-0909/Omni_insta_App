import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyAIXJTPl98s8pDEh0fWTBG-pI7zj9wzIU8",
  authDomain: "my-omniy.firebaseapp.com",
  projectId: "my-omniy",
  storageBucket: "my-omniy.firebasestorage.app",
  messagingSenderId: "374319673625",
  appId: "1:374319673625:web:3d5fc43595071b84101588",
  measurementId: "G-F19QLM5ZRE"
}

// Firebase初期化
const app = initializeApp(firebaseConfig)

// サービス初期化
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)

// 開発環境でエミュレータに接続 (一時的に無効化)
const ENABLE_EMULATOR = false // Set to true to enable Firebase emulators
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