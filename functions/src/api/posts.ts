import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {db} from "../index";

// 投稿コンテンツの型定義
interface PostData {
  ownerUid: string;
  mediaUrls: string[];
  caption: string;
  tags: string[];
  timesPosted?: number;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

// 投稿コンテンツ作成
export const createPost = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {mediaUrls, caption, tags} = data;

  // 入力値検証
  if (!mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Media URLs are required"
    );
  }

  if (!caption || typeof caption !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Caption is required"
    );
  }

  try {
    const postData: PostData = {
      ownerUid: context.auth.uid,
      mediaUrls: mediaUrls,
      caption: caption,
      tags: tags || [],
      timesPosted: 0,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    };

    const docRef = await db.collection("posts").add(postData);

    return {
      success: true,
      postId: docRef.id,
      message: "Post created successfully",
    };
  } catch (error) {
    console.error("Error creating post:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create post"
    );
  }
});

// 投稿コンテンツ一覧取得
export const getPosts = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {limit = 20, lastPostId, tags} = data;

  try {
    let query = db.collection("posts")
      .where("ownerUid", "==", context.auth.uid)
      .orderBy("createdAt", "desc");

    // タグフィルタ
    if (tags && Array.isArray(tags) && tags.length > 0) {
      query = query.where("tags", "array-contains-any", tags);
    }

    // ページネーション
    if (lastPostId) {
      const lastDoc = await db.collection("posts").doc(lastPostId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    query = query.limit(limit);

    const snapshot = await query.get();
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      posts: posts,
      hasMore: snapshot.docs.length === limit,
      lastPostId: snapshot.docs.length > 0 ?
        snapshot.docs[snapshot.docs.length - 1].id : null,
    };
  } catch (error) {
    console.error("Error getting posts:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get posts"
    );
  }
});

// 投稿コンテンツ詳細取得
export const getPost = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {postId} = data;

  if (!postId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Post ID is required"
    );
  }

  try {
    const doc = await db.collection("posts").doc(postId).get();

    if (!doc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Post not found"
      );
    }

    const postData = doc.data() as PostData;

    // 所有者チェック
    if (postData.ownerUid !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Access denied"
      );
    }

    return {
      success: true,
      post: {
        id: doc.id,
        ...postData,
      },
    };
  } catch (error) {
    console.error("Error getting post:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get post"
    );
  }
});

// 投稿コンテンツ更新
export const updatePost = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {postId, mediaUrls, caption, tags} = data;

  if (!postId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Post ID is required"
    );
  }

  try {
    const doc = await db.collection("posts").doc(postId).get();

    if (!doc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Post not found"
      );
    }

    const postData = doc.data() as PostData;

    // 所有者チェック
    if (postData.ownerUid !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Access denied"
      );
    }

    // 更新データの準備
    const updateData: Partial<PostData> = {
      updatedAt: new Date() as any,
    };

    if (mediaUrls !== undefined) {
      if (!Array.isArray(mediaUrls) || mediaUrls.length === 0) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Media URLs must be a non-empty array"
        );
      }
      updateData.mediaUrls = mediaUrls;
    }

    if (caption !== undefined) {
      if (typeof caption !== "string") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Caption must be a string"
        );
      }
      updateData.caption = caption;
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Tags must be an array"
        );
      }
      updateData.tags = tags;
    }

    await db.collection("posts").doc(postId).update(updateData);

    return {
      success: true,
      message: "Post updated successfully",
    };
  } catch (error) {
    console.error("Error updating post:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to update post"
    );
  }
});

// 投稿コンテンツ削除
export const deletePost = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {postId} = data;

  if (!postId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Post ID is required"
    );
  }

  try {
    const doc = await db.collection("posts").doc(postId).get();

    if (!doc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Post not found"
      );
    }

    const postData = doc.data() as PostData;

    // 所有者チェック
    if (postData.ownerUid !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Access denied"
      );
    }

    // 関連するスケジュールがあるかチェック
    const schedulesSnapshot = await db.collectionGroup("schedules")
      .where("contentRef", "==", db.collection("posts").doc(postId))
      .get();

    if (!schedulesSnapshot.empty) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Cannot delete post that is referenced by active schedules"
      );
    }

    await db.collection("posts").doc(postId).delete();

    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting post:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete post"
    );
  }
});

// 投稿回数を増加させる（内部使用）
export const incrementPostUsage = async (postId: string): Promise<void> => {
  try {
    // Firestore FieldValue.increment()を使用して原子的操作で最適化
    await db.collection("posts").doc(postId).update({
      timesPosted: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error incrementing post usage:", error);
    throw error;
  }
}; 