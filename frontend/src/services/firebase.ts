import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
// import { getAnalytics } from 'firebase/analytics'; // 開発環境では無効化

// Firebase設定 - 環境変数から読み込み
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// 環境変数の検証（エミュレーター環境では緩い検証）
const isEmulatorMode = import.meta.env.VITE_ENABLE_FIREBASE_EMULATOR === 'true';
if (!isEmulatorMode && (!firebaseConfig.apiKey || !firebaseConfig.projectId)) {
  throw new Error(
    'Firebase configuration is missing. Please check your environment variables.'
  );
}

// エミュレーター環境では固定のダミー設定を使用
if (isEmulatorMode) {
  firebaseConfig.projectId = 'demo-project';
  firebaseConfig.apiKey = 'demo-api-key';
  firebaseConfig.authDomain = 'demo-project.firebaseapp.com';
  firebaseConfig.storageBucket = 'demo-project.appspot.com';
  firebaseConfig.messagingSenderId = '123456789';
  firebaseConfig.appId = '1:123456789:web:demo';
}

// Firebase初期化
const app = initializeApp(firebaseConfig);

// サービス初期化
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
// export const analytics = getAnalytics(app); // 開発環境では無効化

// 開発環境でエミュレータに接続
const ENABLE_EMULATOR =
  import.meta.env.VITE_ENABLE_FIREBASE_EMULATOR === 'true';

console.log('🔧 Firebase設定確認:', {
  DEV: import.meta.env.DEV,
  ENABLE_EMULATOR,
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey
});

if (import.meta.env.DEV && ENABLE_EMULATOR) {
  try {
    // Auth エミュレータ（127.0.0.1を使用）
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
      disableWarnings: true,
    });

    console.log('🔧 Firebase Auth エミュレータに接続しました: http://127.0.0.1:9099');

    // Functions エミュレータ
    try {
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
      console.log('🔧 Firebase Functions エミュレータに接続しました: 127.0.0.1:5001');
    } catch (funcError) {
      console.warn('⚠️ Functions エミュレータ接続をスキップ:', funcError);
    }

    // Firestore エミュレータ（利用可能な場合のみ）
    try {
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
      console.log('🔧 Firebase Firestore エミュレータに接続しました: 127.0.0.1:8080');
    } catch (firestoreError) {
      console.warn('⚠️ Firestore エミュレータ接続をスキップ:', firestoreError);
    }

    // Storage エミュレータ（利用可能な場合のみ）
    try {
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      console.log('🔧 Firebase Storage エミュレータに接続しました: 127.0.0.1:9199');
    } catch (storageError) {
      console.warn('⚠️ Storage エミュレータ接続をスキップ:', storageError);
    }

  } catch (error) {
    console.error('❌ Firebase エミュレータ接続に失敗:', error);
  }
} else {
  console.log('🌐 Firebase 本番環境モードで動作中');
}

export default app;
