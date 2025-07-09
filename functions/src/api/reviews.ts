import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { updateCustomerSatisfaction } from "./updateStats";

const db = admin.firestore();

// レビューの型定義
interface Review {
  userId: string;
  rating: number; // 1-5の評価
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

/**
 * レビューを投稿
 */
export const submitReview = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { rating, comment } = data;

  // 入力値検証
  if (!rating || rating < 1 || rating > 5) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Rating must be between 1 and 5"
    );
  }

  try {
    // 既存のレビューをチェック（1ユーザー1レビューまで）
    const existingReview = await db
      .collection("reviews")
      .where("userId", "==", context.auth.uid)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      // 既存レビューを更新
      const reviewDoc = existingReview.docs[0];
      await reviewDoc.ref.update({
        rating: rating,
        comment: comment || "",
        status: "pending", // 再審査
        updatedAt: admin.firestore.Timestamp.now(),
      });
      
      return {
        success: true,
        message: "レビューを更新しました。承認後に反映されます。",
        reviewId: reviewDoc.id,
      };
    } else {
      // 新規レビューを作成
      const reviewData: Review = {
        userId: context.auth.uid,
        rating: rating,
        comment: comment || "",
        status: "pending",
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      const docRef = await db.collection("reviews").add(reviewData);
      
      return {
        success: true,
        message: "レビューを投稿しました。承認後に反映されます。",
        reviewId: docRef.id,
      };
    }
  } catch (error) {
    console.error("Error submitting review:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to submit review"
    );
  }
});

/**
 * レビューを承認・却下（管理者のみ）
 */
export const moderateReview = functions.https.onCall(async (data, context) => {
  // 管理者チェック
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admin access required"
    );
  }

  const { reviewId, status } = data;

  if (!["approved", "rejected"].includes(status)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid status. Must be 'approved' or 'rejected'"
    );
  }

  try {
    await db.collection("reviews").doc(reviewId).update({
      status: status,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    // 承認された場合、満足度を再計算
    if (status === "approved") {
      await recalculateCustomerSatisfaction();
    }

    return {
      success: true,
      message: `レビューを${status === "approved" ? "承認" : "却下"}しました`,
    };
  } catch (error) {
    console.error("Error moderating review:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to moderate review"
    );
  }
});

/**
 * 顧客満足度を再計算
 */
export const recalculateCustomerSatisfaction = async (): Promise<void> => {
  try {
    const approvedReviews = await db
      .collection("reviews")
      .where("status", "==", "approved")
      .get();

    if (approvedReviews.empty) {
      // レビューがない場合は0に設定
      await updateCustomerSatisfaction(0);
      return;
    }

    let totalRating = 0;
    let reviewCount = 0;

    approvedReviews.forEach((doc) => {
      const review = doc.data() as Review;
      totalRating += review.rating;
      reviewCount++;
    });

    const averageRating = totalRating / reviewCount;
    await updateCustomerSatisfaction(averageRating);
    
    console.log(`Customer satisfaction updated: ${averageRating.toFixed(1)} (${reviewCount} reviews)`);
  } catch (error) {
    console.error("Error recalculating customer satisfaction:", error);
    throw error;
  }
};

/**
 * 承認済みレビュー一覧を取得
 */
export const getApprovedReviews = functions.https.onCall(async (data, context) => {
  try {
    const { limit = 10, offset = 0 } = data;

    const reviewsSnapshot = await db
      .collection("reviews")
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    const reviews = reviewsSnapshot.docs.map((doc) => {
      const review = doc.data() as Review;
      return {
        id: doc.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      };
    });

    return {
      success: true,
      reviews: reviews,
      total: reviewsSnapshot.size,
    };
  } catch (error) {
    console.error("Error getting approved reviews:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get reviews"
    );
  }
});

/**
 * レビュー統計を取得
 */
export const getReviewStats = functions.https.onCall(async (data, context) => {
  try {
    const approvedReviews = await db
      .collection("reviews")
      .where("status", "==", "approved")
      .get();

    if (approvedReviews.empty) {
      return {
        success: true,
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      };
    }

    let totalRating = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    approvedReviews.forEach((doc) => {
      const review = doc.data() as Review;
      totalRating += review.rating;
      ratingDistribution[review.rating]++;
    });

    const averageRating = totalRating / approvedReviews.size;

    return {
      success: true,
      stats: {
        totalReviews: approvedReviews.size,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution: ratingDistribution,
      },
    };
  } catch (error) {
    console.error("Error getting review stats:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get review stats"
    );
  }
});