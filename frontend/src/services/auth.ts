import { 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup, 
  linkWithCredential,
  type User
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from './firebase';
import { 
  mockFacebookAuthentication, 
  mockValidateInstagramToken,
  mockRefreshInstagramToken,
  showEmulatorNotification,
  isRunningInEmulator
} from './mockAuth';


/**
 * Googleでサインイン
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('ログインがキャンセルされました');
    }
    throw error;
  }
}

/**
 * Facebookでサインイン（Instagram連携用）
 */
export async function signInWithFacebook() {
  const provider = new FacebookAuthProvider();
  
  // Instagram Graph APIに必要な権限を追加
  provider.addScope('email');
  provider.addScope('public_profile');
  provider.addScope('instagram_basic');
  provider.addScope('instagram_content_publish');
  provider.addScope('pages_show_list');
  provider.addScope('pages_read_engagement');
  provider.addScope('business_management');
  
  // ディスプレイ設定
  provider.setCustomParameters({
    display: 'popup',
    auth_type: 'rerequest' // 権限を再要求できるようにする
  });
  
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = FacebookAuthProvider.credentialFromResult(result);
    
    return {
      user: result.user,
      accessToken: credential?.accessToken || null
    };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('ログインがキャンセルされました');
    }
    if (error.code === 'auth/account-exists-with-different-credential') {
      // 既存のアカウントとリンク
      return handleAccountLink(error);
    }
    throw error;
  }
}

/**
 * Instagram アカウント連携用のFacebook認証
 * （既存ユーザーがInstagramアカウントを追加する場合）
 */
export async function authenticateInstagramAccount() {
  // エミュレーター環境ではモック認証を使用
  if (isRunningInEmulator()) {
    showEmulatorNotification('Facebook認証をシミュレート中...', 'info');
    const result = await mockFacebookAuthentication();
    return {
      accounts: result.accounts,
      facebookToken: result.facebookToken,
      user: auth.currentUser // エミュレーターでの現在ユーザー
    };
  }

  const provider = new FacebookAuthProvider();
  
  // Instagram専用の権限スコープ
  provider.addScope('instagram_basic');
  provider.addScope('instagram_content_publish');
  provider.addScope('instagram_manage_comments');
  provider.addScope('instagram_manage_insights');
  provider.addScope('pages_show_list');
  provider.addScope('pages_read_engagement');
  
  provider.setCustomParameters({
    display: 'popup',
    auth_type: 'rerequest'
  });
  
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = FacebookAuthProvider.credentialFromResult(result);
    const shortLivedToken = credential?.accessToken;
    
    if (!shortLivedToken) {
      throw new Error('アクセストークンの取得に失敗しました');
    }
    
    // 短期トークンを長期トークンに交換
    const exchangeTokenFn = httpsCallable(functions, 'exchangeForLongLivedToken');
    const exchangeResult = await exchangeTokenFn({ shortLivedToken });
    const exchangeData = exchangeResult.data as any;
    
    if (!exchangeData.success) {
      throw new Error('長期トークンの取得に失敗しました');
    }
    
    return {
      accounts: exchangeData.accounts,
      facebookToken: exchangeData.facebookToken,
      user: result.user
    };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('認証がキャンセルされました');
    }
    throw error;
  }
}

/**
 * 既存アカウントとFacebookアカウントをリンク
 */
async function handleAccountLink(error: any): Promise<{ user: User; accessToken: string | null }> {
  const pendingCredential = error.credential;
  
  // Note: fetchSignInMethodsForEmail is deprecated
  // 既存のプロバイダーでサインイン
  const providers = ['google.com']; // Simplified for now
  
  if (providers.includes('google.com')) {
    // Googleでサインイン
    const googleProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleProvider);
    
    // Facebookアカウントをリンク
    await linkWithCredential(result.user, pendingCredential);
    
    return {
      user: result.user,
      accessToken: pendingCredential.accessToken || null
    };
  }
  
  throw new Error('アカウントのリンクに失敗しました');
}


/**
 * トークンの有効性を検証
 */
export async function validateInstagramToken(accessToken: string): Promise<{
  isValid: boolean;
  expiresAt?: string;
  scopes?: string[];
}> {
  // エミュレーター環境ではモック検証を使用
  if (isRunningInEmulator()) {
    return await mockValidateInstagramToken(accessToken);
  }

  try {
    const validateTokenFn = httpsCallable(functions, 'validateInstagramToken');
    const result = await validateTokenFn({ accessToken });
    const data = result.data as any;
    
    return {
      isValid: data.isValid,
      expiresAt: data.expiresAt,
      scopes: data.scopes
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false };
  }
}

/**
 * Instagram アカウントのトークンを手動で更新
 */
export async function refreshInstagramAccountToken(accountId: string): Promise<{
  success: boolean;
  expiresAt?: string;
  message?: string;
}> {
  // エミュレーター環境ではモック更新を使用
  if (isRunningInEmulator()) {
    showEmulatorNotification('トークン更新をシミュレート中...', 'info');
    return await mockRefreshInstagramToken(accountId);
  }

  try {
    const refreshTokenFn = httpsCallable(functions, 'refreshInstagramLongLivedToken');
    const result = await refreshTokenFn({ accountId });
    const data = result.data as any;
    
    return {
      success: data.success,
      expiresAt: data.expiresAt,
      message: data.message
    };
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return {
      success: false,
      message: error.message || 'トークンの更新に失敗しました'
    };
  }
}

/**
 * サインアウト
 */
export async function signOut() {
  await auth.signOut();
}