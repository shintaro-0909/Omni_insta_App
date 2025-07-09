import * as functions from "firebase-functions";
import {db} from "../index";
import * as admin from "firebase-admin";
import { canAddInstagramAccount } from "../utils/planLimits";

// IGアカウントの型定義
interface IGAccountData {
  ownerUid: string;
  instagramUserId: string;
  username: string;
  accessToken: string; // 暗号化して保存
  tokenExpiresAt: FirebaseFirestore.Timestamp;
  proxyId?: string;
  profilePictureUrl?: string;
  followersCount?: number;
  mediaCount?: number;
  pageId?: string;
  pageName?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Instagram Graph API基本情報取得
export const getInstagramUserInfo = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {accessToken} = data;

  if (!accessToken) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Access token is required"
    );
  }

  try {
    // Instagram Graph API: ユーザー情報取得
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const userInfo = await response.json();

    if (userInfo.error) {
      throw new Error(`Instagram API error: ${userInfo.error.message}`);
    }

    return {
      success: true,
      userInfo: {
        instagramUserId: userInfo.id,
        username: userInfo.username,
      },
    };
  } catch (error) {
    console.error("Error getting Instagram user info:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get Instagram user info"
    );
  }
});

// IGアカウント追加
export const addInstagramAccount = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {
    accessToken, 
    instagramUserId, 
    username,
    profilePictureUrl,
    followersCount,
    mediaCount,
    pageId,
    pageName
  } = data;

  // 入力値検証
  if (!accessToken || !instagramUserId || !username) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Access token, Instagram user ID, and username are required"
    );
  }

  try {
    // プラン制限チェック
    const limitCheck = await canAddInstagramAccount(context.auth.uid);
    
    if (!limitCheck.allowed) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Instagram account limit exceeded. ${limitCheck.reason} (${limitCheck.currentCount}/${limitCheck.limit})`
      );
    }

    // 既に同じアカウントが登録されていないかチェック
    const duplicateCheck = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .where("instagramUserId", "==", instagramUserId)
      .get();

    if (!duplicateCheck.empty) {
      throw new functions.https.HttpsError(
        "already-exists",
        "This Instagram account is already connected"
      );
    }

    // 長期有効トークンの取得（実際の実装では必要）
    // 今回は簡略化してそのまま保存
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60); // 60日後

    // IGアカウントデータの作成
    const igAccountData: IGAccountData = {
      ownerUid: context.auth.uid,
      instagramUserId: instagramUserId,
      username: username,
      accessToken: accessToken, // 実際の実装では暗号化が必要
      tokenExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      profilePictureUrl: profilePictureUrl,
      followersCount: followersCount,
      mediaCount: mediaCount,
      pageId: pageId,
      pageName: pageName,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    };

    // Firestoreに保存
    const docRef = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .add(igAccountData);


    return {
      success: true,
      accountId: docRef.id,
      message: "Instagram account added successfully",
    };
  } catch (error) {
    console.error("Error adding Instagram account:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to add Instagram account"
    );
  }
});

// IGアカウント一覧取得
export const getInstagramAccounts = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  try {
    const snapshot = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .orderBy("createdAt", "desc")
      .get();

    const accounts = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        instagramUserId: data.instagramUserId,
        username: data.username,
        tokenExpiresAt: data.tokenExpiresAt,
        proxyId: data.proxyId,
        profilePictureUrl: data.profilePictureUrl,
        followersCount: data.followersCount,
        mediaCount: data.mediaCount,
        pageId: data.pageId,
        pageName: data.pageName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        // アクセストークンは返さない（セキュリティ）
      };
    });

    return {
      success: true,
      accounts: accounts,
    };
  } catch (error) {
    console.error("Error getting Instagram accounts:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get Instagram accounts"
    );
  }
});

// IGアカウント削除
export const deleteInstagramAccount = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {accountId} = data;

  if (!accountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Account ID is required"
    );
  }

  try {
    const accountRef = db
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

    // 関連するスケジュールがあるかチェック
    const schedulesSnapshot = await accountRef
      .collection("schedules")
      .where("status", "==", "active")
      .get();

    if (!schedulesSnapshot.empty) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Cannot delete account with active schedules"
      );
    }

    // アカウントとサブコレクションを削除
    const batch = db.batch();
    
    // スケジュールサブコレクションの削除
    const allSchedulesSnapshot = await accountRef.collection("schedules").get();
    allSchedulesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // ログサブコレクションの削除
    const logsSnapshot = await accountRef.collection("logs").get();
    logsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // アカウント本体の削除
    batch.delete(accountRef);

    await batch.commit();

    return {
      success: true,
      message: "Instagram account deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting Instagram account:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete Instagram account"
    );
  }
});

// アクセストークン更新（長期有効トークン取得）
export const refreshInstagramToken = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {accountId} = data;

  if (!accountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Account ID is required"
    );
  }

  try {
    const accountRef = db
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

    const accountData = accountDoc.data() as IGAccountData;

    // Instagram Graph API: トークン更新
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accountData.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const tokenData = await response.json();

    if (tokenData.error) {
      throw new Error(`Instagram API error: ${tokenData.error.message}`);
    }

    // 新しい有効期限を計算
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

    // Firestoreを更新
    await accountRef.update({
      accessToken: tokenData.access_token,
      tokenExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "Access token refreshed successfully",
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error("Error refreshing Instagram token:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to refresh access token"
    );
  }
}); 