import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {db} from "../index";

interface FeedbackData {
  ownerUid: string;
  rating: number;
  comment: string;
  page: string;
  timestamp: FirebaseFirestore.Timestamp;
  userAgent?: string;
  resolved?: boolean;
}

export const submitFeedback = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {rating, comment, page} = data;

  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Rating must be between 1 and 5"
    );
  }

  if (comment && typeof comment !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Comment must be a string"
    );
  }

  if (comment && comment.length > 500) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Comment must be less than 500 characters"
    );
  }

  try {
    const feedbackData: FeedbackData = {
      ownerUid: context.auth.uid,
      rating,
      comment: comment || "",
      page: page || "/",
      timestamp: admin.firestore.Timestamp.now(),
      userAgent: context.rawRequest.headers["user-agent"] || "",
      resolved: false
    };

    const docRef = await db.collection("feedback").add(feedbackData);

    const userRef = db.collection("users").doc(context.auth.uid);
    await userRef.update({
      lastFeedbackAt: admin.firestore.Timestamp.now(),
      feedbackCount: admin.firestore.FieldValue.increment(1)
    });

    return {
      success: true,
      feedbackId: docRef.id,
      message: "フィードバックを受け付けました"
    };
  } catch (error) {
    console.error("フィードバック送信エラー:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to submit feedback"
    );
  }
});

export const getFeedback = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  try {
    const feedbackQuery = await db
      .collection("feedback")
      .where("ownerUid", "==", context.auth.uid)
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const feedback = feedbackQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      feedback
    };
  } catch (error) {
    console.error("フィードバック取得エラー:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get feedback"
    );
  }
});

export const markFeedbackResolved = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {feedbackId} = data;

  if (!feedbackId || typeof feedbackId !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Valid feedback ID required"
    );
  }

  try {
    const feedbackRef = db.collection("feedback").doc(feedbackId);
    const feedbackDoc = await feedbackRef.get();

    if (!feedbackDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Feedback not found"
      );
    }

    const feedbackData = feedbackDoc.data() as FeedbackData;
    
    if (feedbackData.ownerUid !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Permission denied"
      );
    }

    await feedbackRef.update({
      resolved: true,
      resolvedAt: admin.firestore.Timestamp.now()
    });

    return {
      success: true,
      message: "フィードバックを解決済みにマークしました"
    };
  } catch (error) {
    console.error("フィードバック解決エラー:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to mark feedback as resolved"
    );
  }
});