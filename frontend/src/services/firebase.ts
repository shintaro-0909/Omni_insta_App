import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

// Firebase設定（環境変数から取得）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef'
}

// Firebase初期化
const app = initializeApp(firebaseConfig)

// サービス初期化
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

// 開発環境でエミュレータに接続
if (import.meta.env.DEV) {
  try {
    // Auth エミュレータ
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    
    // Firestore エミュレータ
    connectFirestoreEmulator(db, 'localhost', 8080)
    
    // Functions エミュレータ
    connectFunctionsEmulator(functions, 'localhost', 5001)
    
    console.log('🔧 Firebase エミュレータに接続しました')
  } catch (error) {
    console.warn('⚠️ Firebase エミュレータ接続に失敗:', error)
  }
}

export default app 