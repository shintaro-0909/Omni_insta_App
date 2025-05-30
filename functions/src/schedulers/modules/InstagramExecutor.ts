import * as admin from "firebase-admin";
import { proxyFetch, getAccountProxyConfig } from "../../utils/proxyFetch";

export interface InstagramPostData {
  caption: string;
  mediaUrls: string[];
  mediaType: 'photo' | 'video' | 'carousel';
}

export interface PostResult {
  success: boolean;
  instagramPostId?: string;
  error?: string;
  executionTime?: number;
  metadata?: {
    mediaCount: number;
    proxyUsed: boolean;
    userAgent: string;
  };
}

export class InstagramExecutor {
  private db: admin.firestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Instagram への投稿実行
   */
  async executePost(
    igAccountId: string,
    postData: InstagramPostData,
    userId: string
  ): Promise<PostResult> {
    const startTime = Date.now();

    try {
      // アカウント情報を取得
      const accountDoc = await this.db
        .collection("users")
        .doc(userId)
        .collection("igAccounts")
        .doc(igAccountId)
        .get();

      if (!accountDoc.exists) {
        throw new Error(`Instagram account ${igAccountId} not found`);
      }

      const accountData = accountDoc.data()!;
      
      // アクセストークンの有効性確認
      await this.validateAccessToken(accountData.accessToken);

      // プロキシ設定を取得
      const proxyConfig = await getAccountProxyConfig(userId, igAccountId);

      // メディアをアップロード
      const mediaIds = await this.uploadMedia(
        accountData.accessToken,
        postData.mediaUrls,
        proxyConfig
      );

      // 投稿を作成
      const instagramPostId = await this.createPost(
        accountData.accessToken,
        accountData.igUserId,
        {
          caption: postData.caption,
          mediaIds,
          mediaType: postData.mediaType
        },
        proxyConfig
      );

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        instagramPostId,
        executionTime,
        metadata: {
          mediaCount: postData.mediaUrls.length,
          proxyUsed: !!proxyConfig,
          userAgent: 'Omniy/1.0'
        }
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error.message || String(error),
        executionTime,
        metadata: {
          mediaCount: postData.mediaUrls.length,
          proxyUsed: false,
          userAgent: 'Omniy/1.0'
        }
      };
    }
  }

  /**
   * アクセストークンの有効性確認
   */
  private async validateAccessToken(accessToken: string): Promise<void> {
    const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Invalid access token: ${error.error?.message || 'Unknown error'}`);
    }
  }

  /**
   * メディアアップロード
   */
  private async uploadMedia(
    accessToken: string,
    mediaUrls: string[],
    proxyConfig?: any
  ): Promise<string[]> {
    const mediaIds: string[] = [];

    for (const mediaUrl of mediaUrls) {
      const mediaId = await this.uploadSingleMedia(accessToken, mediaUrl, proxyConfig);
      mediaIds.push(mediaId);
    }

    return mediaIds;
  }

  /**
   * 単一メディアのアップロード
   */
  private async uploadSingleMedia(
    accessToken: string,
    mediaUrl: string,
    proxyConfig?: any
  ): Promise<string> {
    const uploadUrl = `https://graph.instagram.com/me/media`;
    
    const params = new URLSearchParams({
      image_url: mediaUrl,
      access_token: accessToken
    });

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Omniy/1.0'
      },
      body: params.toString()
    };

    const response = proxyConfig 
      ? await proxyFetch(uploadUrl, fetchOptions as any, proxyConfig)
      : await fetch(uploadUrl, fetchOptions);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Media upload failed: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result.id;
  }

  /**
   * 投稿作成
   */
  private async createPost(
    accessToken: string,
    igUserId: string,
    postData: {
      caption: string;
      mediaIds: string[];
      mediaType: string;
    },
    proxyConfig?: any
  ): Promise<string> {
    const publishUrl = `https://graph.instagram.com/${igUserId}/media_publish`;
    
    const params = new URLSearchParams({
      creation_id: postData.mediaIds[0], // 単一メディアまたはカルーセルの最初のID
      access_token: accessToken
    });

    // カルーセルの場合は子メディアを追加
    if (postData.mediaType === 'carousel' && postData.mediaIds.length > 1) {
      params.set('children', postData.mediaIds.join(','));
    }

    // キャプションを追加
    if (postData.caption) {
      params.set('caption', postData.caption);
    }

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Omniy/1.0'
      },
      body: params.toString()
    };

    const response = proxyConfig 
      ? await proxyFetch(publishUrl, fetchOptions as any, proxyConfig)
      : await fetch(publishUrl, fetchOptions);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Post creation failed: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result.id;
  }

  /**
   * 投稿ステータス確認
   */
  async checkPostStatus(
    accessToken: string,
    mediaId: string,
    proxyConfig?: any
  ): Promise<{
    status: 'IN_PROGRESS' | 'FINISHED' | 'ERROR';
    statusCode?: string;
  }> {
    const statusUrl = `https://graph.instagram.com/${mediaId}?fields=status_code&access_token=${accessToken}`;
    
    const fetchOptions = {
      method: 'GET',
      headers: {
        'User-Agent': 'Omniy/1.0'
      }
    };

    const response = proxyConfig 
      ? await proxyFetch(statusUrl, fetchOptions as any, proxyConfig)
      : await fetch(statusUrl, fetchOptions);

    if (!response.ok) {
      return { status: 'ERROR' };
    }

    const result = await response.json();
    return {
      status: result.status_code === 'FINISHED' ? 'FINISHED' : 'IN_PROGRESS',
      statusCode: result.status_code
    };
  }

  /**
   * レート制限の確認
   */
  async checkRateLimit(
    accessToken: string,
    proxyConfig?: any
  ): Promise<{
    remaining: number;
    resetTime: Date;
  }> {
    // Instagram Graph API のレート制限情報を取得
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id&access_token=${accessToken}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Omniy/1.0'
        }
      }
    );

    // レスポンスヘッダーからレート制限情報を取得
    const remaining = parseInt(response.headers.get('x-app-usage') || '0');
    const resetTime = new Date(Date.now() + 60 * 60 * 1000); // 1時間後にリセット（推定）

    return {
      remaining,
      resetTime
    };
  }
}