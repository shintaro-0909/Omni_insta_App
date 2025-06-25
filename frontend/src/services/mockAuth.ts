/**
 * Firebase Auth Emulator用のモック認証サービス
 * 開発環境でFacebook認証をシミュレートします
 */


// エミュレーター環境判定
const isEmulatorMode = import.meta.env.VITE_ENABLE_FIREBASE_EMULATOR === 'true';

/**
 * モック用のInstagramビジネスアカウントデータ
 */
const mockInstagramAccounts = [
  {
    id: 'mock_ig_account_1',
    username: 'demo_business',
    name: 'Demo Business Account',
    profilePictureUrl: 'https://via.placeholder.com/150/1f77b4/ffffff?text=IG',
    followersCount: 15420,
    mediaCount: 145,
    biography: 'デモ用ビジネスアカウント',
    pageId: 'mock_page_1',
    pageName: 'Demo Business Page',
    accessToken: 'mock_long_lived_token_1_' + Date.now(),
    expiresIn: 5184000, // 60日
    tokenType: 'long_lived'
  },
  {
    id: 'mock_ig_account_2',
    username: 'test_creator',
    name: 'Test Creator Account',
    profilePictureUrl: 'https://via.placeholder.com/150/ff7f0e/ffffff?text=IG',
    followersCount: 8750,
    mediaCount: 89,
    biography: 'テスト用クリエイターアカウント',
    pageId: 'mock_page_2',
    pageName: 'Test Creator Page',
    accessToken: 'mock_long_lived_token_2_' + Date.now(),
    expiresIn: 5184000, // 60日
    tokenType: 'long_lived'
  }
];

/**
 * エミュレーター環境でのモックFacebook認証
 */
export async function mockFacebookAuthentication() {
  if (!isEmulatorMode) {
    throw new Error('Mock authentication is only available in emulator mode');
  }

  // 認証処理をシミュレート（遅延を追加）
  await new Promise(resolve => setTimeout(resolve, 1500));

  // ランダムにアカウント数を決定（1-2個）
  const accountCount = Math.random() > 0.3 ? 2 : 1;
  const selectedAccounts = mockInstagramAccounts.slice(0, accountCount);

  return {
    success: true,
    accounts: selectedAccounts,
    facebookToken: 'mock_facebook_token_' + Date.now(),
    facebookExpiresIn: 5184000
  };
}

/**
 * エミュレーター環境での長期トークン交換をモック
 */
export async function mockExchangeForLongLivedToken(_shortLivedToken: string) {
  if (!isEmulatorMode) {
    throw new Error('Mock token exchange is only available in emulator mode');
  }

  console.log('🔄 Mock: Exchanging short-lived token for long-lived token...');
  
  // トークン交換処理をシミュレート
  await new Promise(resolve => setTimeout(resolve, 1000));

  return mockFacebookAuthentication();
}

/**
 * エミュレーター環境でのトークン検証をモック
 */
export async function mockValidateInstagramToken(accessToken: string) {
  if (!isEmulatorMode) {
    return { isValid: false };
  }

  console.log('🔍 Mock: Validating Instagram token...');

  // モックトークンの場合は常に有効
  if (accessToken.startsWith('mock_')) {
    return {
      isValid: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60日後
      scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list']
    };
  }

  return { isValid: false };
}

/**
 * エミュレーター環境でのトークン更新をモック
 */
export async function mockRefreshInstagramToken(accountId: string) {
  if (!isEmulatorMode) {
    throw new Error('Mock token refresh is only available in emulator mode');
  }

  console.log(`🔄 Mock: Refreshing token for account ${accountId}...`);
  
  // トークン更新処理をシミュレート
  await new Promise(resolve => setTimeout(resolve, 800));

  const newExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  return {
    success: true,
    message: 'Mock token refresh completed',
    expiresAt: newExpiresAt.toISOString(),
    expiresIn: 5184000
  };
}

/**
 * エミュレーター環境での通知表示
 */
export function showEmulatorNotification(message: string, type: 'info' | 'success' | 'warning' = 'info') {
  if (!isEmulatorMode) return;

  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: system-ui;
    font-size: 14px;
    max-width: 300px;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 16px;">🔧</span>
      <div>
        <div style="font-weight: bold; margin-bottom: 4px;">エミュレーターモード</div>
        <div>${message}</div>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // フェードイン
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 100);

  // 5秒後に自動削除
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}

/**
 * エミュレーター環境チェック
 */
export function isRunningInEmulator(): boolean {
  return isEmulatorMode;
}