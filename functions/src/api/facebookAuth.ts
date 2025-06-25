import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// エミュレーター環境での開発用モックデータ
const MOCK_INSTAGRAM_ACCOUNTS = [
  {
    id: 'mock_ig_account_1',
    username: 'demo_business',
    name: 'Demo Business Account',
    profile_picture_url: 'https://via.placeholder.com/150/1f77b4/ffffff?text=IG',
    followers_count: 15420,
    media_count: 145,
    biography: 'デモ用ビジネスアカウント',
    pageId: 'mock_page_1',
    pageName: 'Demo Business Page',
    accessToken: 'mock_long_lived_token_1_' + Date.now(),
    expiresIn: 5184000,
    tokenType: 'long_lived'
  },
  {
    id: 'mock_ig_account_2', 
    username: 'test_creator',
    name: 'Test Creator Account',
    profile_picture_url: 'https://via.placeholder.com/150/ff7f0e/ffffff?text=IG',
    followers_count: 8750,
    media_count: 89,
    biography: 'テスト用クリエイターアカウント',
    pageId: 'mock_page_2',
    pageName: 'Test Creator Page',
    accessToken: 'mock_long_lived_token_2_' + Date.now(),
    expiresIn: 5184000,
    tokenType: 'long_lived'
  }
];

// Facebook App設定（環境変数から取得）
const FACEBOOK_APP_ID = functions.config().facebook?.app_id;
const FACEBOOK_APP_SECRET = functions.config().facebook?.app_secret;
const FACEBOOK_API_VERSION = "v18.0";

// エミュレーター環境判定
function isEmulatorEnvironment(): boolean {
  return process.env.FUNCTIONS_EMULATOR === 'true';
}

// 短期トークンを長期トークンに交換
export const exchangeForLongLivedToken = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { shortLivedToken } = data;

  if (!shortLivedToken) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Short-lived token is required"
    );
  }

  // エミュレーター環境では設定チェックをスキップ
  if (!isEmulatorEnvironment() && (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET)) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Facebook app configuration is missing"
    );
  }

  // エミュレーター環境ではモックデータを返す
  if (isEmulatorEnvironment()) {
    console.log('🔄 Emulator: Using mock Instagram accounts for token exchange');
    
    // ランダムにアカウント数を決定（1-2個）
    const accountCount = Math.random() > 0.3 ? 2 : 1;
    const selectedAccounts = MOCK_INSTAGRAM_ACCOUNTS.slice(0, accountCount);
    
    return {
      success: true,
      accounts: selectedAccounts,
      facebookToken: 'mock_facebook_token_' + Date.now(),
      facebookExpiresIn: 5184000
    };
  }

  try {
    // ステップ1: Facebook短期トークンを長期トークンに交換
    const facebookLongLivedUrl = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token`;
    const facebookParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      fb_exchange_token: shortLivedToken
    });

    const facebookResponse = await fetch(`${facebookLongLivedUrl}?${facebookParams}`);
    const facebookData = await facebookResponse.json();

    if (facebookData.error) {
      throw new Error(`Facebook API error: ${facebookData.error.message}`);
    }

    const longLivedFacebookToken = facebookData.access_token;
    const facebookExpiresIn = facebookData.expires_in || 5184000; // デフォルト60日

    // ステップ2: FacebookページからInstagramビジネスアカウントを取得
    const pagesUrl = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/accounts`;
    const pagesParams = new URLSearchParams({
      access_token: longLivedFacebookToken,
      fields: 'id,name,access_token,instagram_business_account'
    });

    const pagesResponse = await fetch(`${pagesUrl}?${pagesParams}`);
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      throw new Error(`Facebook Pages API error: ${pagesData.error.message}`);
    }

    // ステップ3: 各ページのInstagramビジネスアカウントで長期トークンを生成
    const instagramAccounts = [];

    for (const page of pagesData.data || []) {
      if (page.instagram_business_account) {
        try {
          // Instagram長期トークンを取得
          const igLongLivedUrl = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token`;
          const igParams = new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: FACEBOOK_APP_ID,
            client_secret: FACEBOOK_APP_SECRET,
            fb_exchange_token: page.access_token
          });

          const igResponse = await fetch(`${igLongLivedUrl}?${igParams}`);
          const igData = await igResponse.json();

          if (igData.error) {
            console.warn(`Instagram token exchange failed for page ${page.id}:`, igData.error);
            continue;
          }

          // Instagram アカウント詳細を取得
          const igAccountUrl = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${page.instagram_business_account.id}`;
          const igAccountParams = new URLSearchParams({
            access_token: igData.access_token,
            fields: 'id,username,name,profile_picture_url,followers_count,media_count,biography'
          });

          const igAccountResponse = await fetch(`${igAccountUrl}?${igAccountParams}`);
          const igAccountData = await igAccountResponse.json();

          if (!igAccountData.error) {
            instagramAccounts.push({
              id: igAccountData.id,
              username: igAccountData.username,
              name: igAccountData.name,
              profilePictureUrl: igAccountData.profile_picture_url,
              followersCount: igAccountData.followers_count,
              mediaCount: igAccountData.media_count,
              biography: igAccountData.biography,
              pageId: page.id,
              pageName: page.name,
              accessToken: igData.access_token,
              expiresIn: igData.expires_in || facebookExpiresIn,
              tokenType: 'long_lived'
            });
          }
        } catch (error) {
          console.warn(`Failed to process Instagram account for page ${page.id}:`, error);
          // エラーが発生しても他のアカウントの処理は続行
        }
      }
    }

    if (instagramAccounts.length === 0) {
      throw new functions.https.HttpsError(
        "not-found",
        "No Instagram business accounts found"
      );
    }

    return {
      success: true,
      accounts: instagramAccounts,
      facebookToken: longLivedFacebookToken,
      facebookExpiresIn: facebookExpiresIn
    };

  } catch (error: any) {
    console.error("Error exchanging for long-lived token:", error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      "internal",
      `Failed to exchange token: ${error.message}`
    );
  }
});

// Instagram長期トークンの更新
export const refreshInstagramLongLivedToken = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { accountId } = data;

  if (!accountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Account ID is required"
    );
  }

  try {
    // アカウント情報を取得
    const accountRef = admin.firestore()
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .doc(accountId);

    const accountDoc = await accountRef.get();

    if (!accountDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Instagram account not found"
      );
    }

    const accountData = accountDoc.data()!;
    const currentToken = accountData.accessToken;

    // Instagram Graph API でトークンを更新
    const refreshUrl = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token`;
    const refreshParams = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: currentToken
    });

    const response = await fetch(`${refreshUrl}?${refreshParams}`);
    const data_response = await response.json();

    if (data_response.error) {
      // トークンが無効な場合は再認証が必要
      if (data_response.error.code === 190) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Token expired. Re-authentication required."
        );
      }
      throw new Error(`Instagram API error: ${data_response.error.message}`);
    }

    // 新しい有効期限を計算（通常60日）
    const expiresIn = data_response.expires_in || 5184000;
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    // Firestoreを更新
    await accountRef.update({
      accessToken: data_response.access_token,
      tokenExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: "Instagram token refreshed successfully",
      expiresAt: expiresAt.toISOString(),
      expiresIn: expiresIn
    };

  } catch (error: any) {
    console.error("Error refreshing Instagram token:", error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      "internal",
      `Failed to refresh token: ${error.message}`
    );
  }
});

// トークンの有効性を検証
export const validateInstagramToken = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { accessToken } = data;

  if (!accessToken) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Access token is required"
    );
  }

  try {
    // Instagram Graph API でトークン情報を取得
    const debugUrl = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/debug_token`;
    const debugParams = new URLSearchParams({
      input_token: accessToken,
      access_token: `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
    });

    const response = await fetch(`${debugUrl}?${debugParams}`);
    const data_response = await response.json();

    if (data_response.error) {
      throw new Error(`Facebook API error: ${data_response.error.message}`);
    }

    const tokenInfo = data_response.data;
    
    return {
      success: true,
      isValid: tokenInfo.is_valid,
      expiresAt: tokenInfo.expires_at ? new Date(tokenInfo.expires_at * 1000).toISOString() : null,
      scopes: tokenInfo.scopes || [],
      appId: tokenInfo.app_id,
      userId: tokenInfo.user_id
    };

  } catch (error: any) {
    console.error("Error validating token:", error);
    
    throw new functions.https.HttpsError(
      "internal",
      `Failed to validate token: ${error.message}`
    );
  }
});