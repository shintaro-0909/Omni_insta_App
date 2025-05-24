import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import { canExecutePostForAccount, incrementPostUsageForAccount } from "../utils/planLimits";

const db = admin.firestore();

// Instagram Graph API のベースURL
const INSTAGRAM_API_BASE = "https://graph.facebook.com/v18.0";

// Instagram投稿タイプ
export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

// 投稿データの型定義
export interface InstagramPostData {
  igAccountId: string;
  mediaUrls: string[];
  caption: string;
  mediaType?: InstagramMediaType;
}

// Instagram Graph API レスポンスの型定義（将来の拡張用）
// interface InstagramMediaResponse {
//   id: string;
// }

// interface InstagramPostResponse {
//   id: string;
// }

// Instagram Graph API エラーの型定義
interface InstagramAPIError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

/**
 * Instagram Graph APIを使用してメディアをアップロード
 */
async function uploadMediaToInstagram(
  accessToken: string,
  instagramUserId: string,
  mediaUrl: string,
  caption?: string,
  isCarouselItem: boolean = false
): Promise<string> {
  try {
    const endpoint = `${INSTAGRAM_API_BASE}/${instagramUserId}/media`;
    
    const params: any = {
      image_url: mediaUrl,
      access_token: accessToken,
    };

    // カルーセルアイテムでない場合のみキャプションを追加
    if (!isCarouselItem && caption) {
      params.caption = caption;
    }

    const response = await axios.post(endpoint, null, { params });
    
    if (response.data.error) {
      throw new Error(`Instagram API Error: ${response.data.error.message}`);
    }

    return response.data.id;
  } catch (error: any) {
    console.error("Media upload error:", error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      const igError = error.response.data as InstagramAPIError;
      throw new Error(`Instagram API Error: ${igError.error.message} (Code: ${igError.error.code})`);
    }
    
    throw new Error(`Failed to upload media: ${error.message}`);
  }
}

/**
 * カルーセル投稿を作成
 */
async function createCarouselPost(
  accessToken: string,
  instagramUserId: string,
  mediaIds: string[],
  caption: string
): Promise<string> {
  try {
    const endpoint = `${INSTAGRAM_API_BASE}/${instagramUserId}/media`;
    
    const params = {
      media_type: "CAROUSEL",
      children: mediaIds.join(","),
      caption: caption,
      access_token: accessToken,
    };

    const response = await axios.post(endpoint, null, { params });
    
    if (response.data.error) {
      throw new Error(`Instagram API Error: ${response.data.error.message}`);
    }

    return response.data.id;
  } catch (error: any) {
    console.error("Carousel creation error:", error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      const igError = error.response.data as InstagramAPIError;
      throw new Error(`Instagram API Error: ${igError.error.message} (Code: ${igError.error.code})`);
    }
    
    throw new Error(`Failed to create carousel: ${error.message}`);
  }
}

/**
 * メディアを公開
 */
async function publishMedia(
  accessToken: string,
  instagramUserId: string,
  creationId: string
): Promise<string> {
  try {
    const endpoint = `${INSTAGRAM_API_BASE}/${instagramUserId}/media_publish`;
    
    const params = {
      creation_id: creationId,
      access_token: accessToken,
    };

    const response = await axios.post(endpoint, null, { params });
    
    if (response.data.error) {
      throw new Error(`Instagram API Error: ${response.data.error.message}`);
    }

    return response.data.id;
  } catch (error: any) {
    console.error("Media publish error:", error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      const igError = error.response.data as InstagramAPIError;
      throw new Error(`Instagram API Error: ${igError.error.message} (Code: ${igError.error.code})`);
    }
    
    throw new Error(`Failed to publish media: ${error.message}`);
  }
}

/**
 * Instagram投稿のメイン処理
 */
export const postToInstagram = functions.https.onCall(async (data: InstagramPostData, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { igAccountId, mediaUrls, caption } = data;

  // 入力値検証
  if (!igAccountId || !mediaUrls || mediaUrls.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "igAccountId and mediaUrls are required"
    );
  }

  if (mediaUrls.length > 10) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Maximum 10 media items allowed for carousel"
    );
  }

  try {
    // 日次制限チェック（アカウント別）
    const dailyLimitCheck = await canExecutePostForAccount(context.auth.uid, igAccountId);
    
    if (!dailyLimitCheck.allowed) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Post execution not allowed. ${dailyLimitCheck.reason} (${dailyLimitCheck.currentCount}/${dailyLimitCheck.limit})`
      );
    }
    // IGアカウント情報を取得
    const igAccountDoc = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .doc(igAccountId)
      .get();

    if (!igAccountDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Instagram account not found"
      );
    }

    const igAccountData = igAccountDoc.data()!;
    const accessToken = igAccountData.accessToken;
    const instagramUserId = igAccountData.instagramUserId;

    // アクセストークンの有効期限チェック
    const tokenExpiresAt = igAccountData.tokenExpiresAt.toDate();
    if (tokenExpiresAt <= new Date()) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Instagram access token has expired"
      );
    }

    let creationId: string;

    if (mediaUrls.length === 1) {
      // 単一メディア投稿
      creationId = await uploadMediaToInstagram(
        accessToken,
        instagramUserId,
        mediaUrls[0],
        caption,
        false
      );
    } else {
      // カルーセル投稿
      const mediaIds: string[] = [];
      
      // 各メディアをアップロード
      for (const mediaUrl of mediaUrls) {
        const mediaId = await uploadMediaToInstagram(
          accessToken,
          instagramUserId,
          mediaUrl,
          undefined,
          true
        );
        mediaIds.push(mediaId);
      }

      // カルーセルを作成
      creationId = await createCarouselPost(
        accessToken,
        instagramUserId,
        mediaIds,
        caption
      );
    }

    // メディアを公開
    const publishedId = await publishMedia(
      accessToken,
      instagramUserId,
      creationId
    );

    // 投稿成功をログに記録
    console.log(`Instagram post published successfully: ${publishedId}`);

    // 使用量を更新（アカウント別日次＋月次）
    await incrementPostUsageForAccount(context.auth.uid, igAccountId);

    return {
      success: true,
      postId: publishedId,
      creationId: creationId,
      mediaCount: mediaUrls.length,
      publishedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Instagram post error:", error);

    // Instagram API エラーの場合
    if (error.message.includes("Instagram API Error")) {
      throw new functions.https.HttpsError(
        "aborted",
        error.message
      );
    }

    // その他のエラー
    throw new functions.https.HttpsError(
      "internal",
      `Failed to post to Instagram: ${error.message}`
    );
  }
});

/**
 * Instagram投稿の状態を確認
 */
export const checkInstagramPostStatus = functions.https.onCall(async (data: { creationId: string; igAccountId: string }, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { creationId, igAccountId } = data;

  if (!creationId || !igAccountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "creationId and igAccountId are required"
    );
  }

  try {
    // IGアカウント情報を取得
    const igAccountDoc = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .doc(igAccountId)
      .get();

    if (!igAccountDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Instagram account not found"
      );
    }

    const igAccountData = igAccountDoc.data()!;
    const accessToken = igAccountData.accessToken;

    // 投稿状態を確認
    const endpoint = `${INSTAGRAM_API_BASE}/${creationId}`;
    const params = {
      fields: "status_code,status",
      access_token: accessToken,
    };

    const response = await axios.get(endpoint, { params });

    if (response.data.error) {
      throw new Error(`Instagram API Error: ${response.data.error.message}`);
    }

    return {
      success: true,
      status: response.data.status,
      statusCode: response.data.status_code,
      creationId: creationId,
    };

  } catch (error: any) {
    console.error("Instagram post status check error:", error);

    if (error.response?.data?.error) {
      const igError = error.response.data as InstagramAPIError;
      throw new functions.https.HttpsError(
        "aborted",
        `Instagram API Error: ${igError.error.message}`
      );
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to check post status: ${error.message}`
    );
  }
});

/**
 * Instagram投稿を削除
 */
export const deleteInstagramPost = functions.https.onCall(async (data: { postId: string; igAccountId: string }, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { postId, igAccountId } = data;

  if (!postId || !igAccountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "postId and igAccountId are required"
    );
  }

  try {
    // IGアカウント情報を取得
    const igAccountDoc = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .doc(igAccountId)
      .get();

    if (!igAccountDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Instagram account not found"
      );
    }

    const igAccountData = igAccountDoc.data()!;
    const accessToken = igAccountData.accessToken;

    // 投稿を削除
    const endpoint = `${INSTAGRAM_API_BASE}/${postId}`;
    const params = {
      access_token: accessToken,
    };

    const response = await axios.delete(endpoint, { params });

    if (response.data.error) {
      throw new Error(`Instagram API Error: ${response.data.error.message}`);
    }

    return {
      success: true,
      postId: postId,
      deletedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Instagram post deletion error:", error);

    if (error.response?.data?.error) {
      const igError = error.response.data as InstagramAPIError;
      throw new functions.https.HttpsError(
        "aborted",
        `Instagram API Error: ${igError.error.message}`
      );
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to delete Instagram post: ${error.message}`
    );
  }
}); 