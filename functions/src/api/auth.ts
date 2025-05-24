import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// カスタムクレームの型定義
export interface CustomClaims {
  admin?: boolean;
  planId?: string;
  emailVerified?: boolean;
  accountStatus?: "active" | "suspended" | "pending";
}

// ユーザープロファイルの型定義
export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: admin.firestore.Timestamp;
  lastLoginAt?: admin.firestore.Timestamp;
  loginCount: number;
}

/**
 * カスタムクレームを設定
 */
export const setCustomClaims = functions.https.onCall(async (data, context) => {
  // 管理者権限チェック
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admin privileges required"
    );
  }

  const { uid, claims } = data;

  if (!uid || !claims) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "uid and claims are required"
    );
  }

  try {
    // カスタムクレームを設定
    await admin.auth().setCustomUserClaims(uid, claims);

    // ユーザードキュメントも更新
    await db.collection("users").doc(uid).update({
      customClaims: claims,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      message: "Custom claims updated successfully",
      uid: uid,
      claims: claims,
    };

  } catch (error: any) {
    console.error("Failed to set custom claims:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to set custom claims: ${error.message}`
    );
  }
});

/**
 * ユーザーのプラン情報に基づいてカスタムクレームを更新
 */
export const updateUserClaims = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const uid = context.auth.uid;

  try {
    // ユーザー情報を取得
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "User document not found"
      );
    }

    const userData = userDoc.data()!;
    const currentPlan = userData.currentPlan || {};

    // カスタムクレームを構築
    const claims: CustomClaims = {
      planId: currentPlan.planId || "free",
      emailVerified: userData.profile?.emailVerified || false,
      accountStatus: currentPlan.status || "active",
    };

    // 管理者権限は既存のクレームから継承
    const currentUser = await admin.auth().getUser(uid);
    if (currentUser.customClaims?.admin) {
      claims.admin = true;
    }

    // カスタムクレームを更新
    await admin.auth().setCustomUserClaims(uid, claims);

    // ユーザードキュメントも更新
    await db.collection("users").doc(uid).update({
      customClaims: claims,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      message: "User claims updated successfully",
      claims: claims,
    };

  } catch (error: any) {
    console.error("Failed to update user claims:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to update user claims: ${error.message}`
    );
  }
});

/**
 * メールアドレス確認の再送信
 */
export const resendEmailVerification = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const uid = context.auth.uid;

  try {
    // ユーザー情報を取得
    const user = await admin.auth().getUser(uid);

    if (user.emailVerified) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Email is already verified"
      );
    }

    // メール確認リンクを生成
    const actionCodeSettings = {
      url: `${process.env.FRONTEND_URL}/auth/verify-email`,
      handleCodeInApp: true,
    };

    const link = await admin.auth().generateEmailVerificationLink(
      user.email!,
      actionCodeSettings
    );

    // メール送信ログを記録（実際の送信は外部サービス）
    await db.collection("emailLogs").add({
      userId: uid,
      email: user.email,
      type: "email_verification",
      link: link,
      status: "pending",
      createdAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      message: "Email verification link sent",
      email: user.email,
    };

  } catch (error: any) {
    console.error("Failed to resend email verification:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to resend email verification: ${error.message}`
    );
  }
});

/**
 * パスワードリセットメール送信
 */
export const sendPasswordResetEmail = functions.https.onCall(async (data, context) => {
  const { email } = data;

  if (!email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email is required"
    );
  }

  try {
    // パスワードリセットリンクを生成
    const actionCodeSettings = {
      url: `${process.env.FRONTEND_URL}/auth/reset-password`,
      handleCodeInApp: true,
    };

    const link = await admin.auth().generatePasswordResetLink(
      email,
      actionCodeSettings
    );

    // メール送信ログを記録
    await db.collection("emailLogs").add({
      email: email,
      type: "password_reset",
      link: link,
      status: "pending",
      createdAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      message: "Password reset link sent",
      email: email,
    };

  } catch (error: any) {
    console.error("Failed to send password reset email:", error);

    // ユーザーが存在しない場合でも成功を返す（セキュリティ上の理由）
    if (error.code === "auth/user-not-found") {
      return {
        success: true,
        message: "If the email exists, a password reset link has been sent",
        email: email,
      };
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to send password reset email: ${error.message}`
    );
  }
});

/**
 * ユーザーアカウントの無効化
 */
export const disableUser = functions.https.onCall(async (data, context) => {
  // 管理者権限チェック
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admin privileges required"
    );
  }

  const { uid, reason } = data;

  if (!uid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "uid is required"
    );
  }

  try {
    // ユーザーを無効化
    await admin.auth().updateUser(uid, {
      disabled: true,
    });

    // カスタムクレームを更新
    await admin.auth().setCustomUserClaims(uid, {
      accountStatus: "suspended",
    });

    // ユーザードキュメントを更新
    await db.collection("users").doc(uid).update({
      accountStatus: "suspended",
      suspendedAt: admin.firestore.Timestamp.now(),
      suspensionReason: reason || "Administrative action",
      updatedAt: admin.firestore.Timestamp.now(),
    });

    // 管理ログを記録
    await db.collection("adminLogs").add({
      action: "disable_user",
      targetUserId: uid,
      adminUserId: context.auth.uid,
      reason: reason || "Administrative action",
      timestamp: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      message: "User account disabled successfully",
      uid: uid,
    };

  } catch (error: any) {
    console.error("Failed to disable user:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to disable user: ${error.message}`
    );
  }
});

/**
 * ユーザーアカウントの有効化
 */
export const enableUser = functions.https.onCall(async (data, context) => {
  // 管理者権限チェック
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admin privileges required"
    );
  }

  const { uid } = data;

  if (!uid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "uid is required"
    );
  }

  try {
    // ユーザーを有効化
    await admin.auth().updateUser(uid, {
      disabled: false,
    });

    // カスタムクレームを更新
    await admin.auth().setCustomUserClaims(uid, {
      accountStatus: "active",
    });

    // ユーザードキュメントを更新
    await db.collection("users").doc(uid).update({
      accountStatus: "active",
      suspendedAt: admin.firestore.FieldValue.delete(),
      suspensionReason: admin.firestore.FieldValue.delete(),
      reactivatedAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    // 管理ログを記録
    await db.collection("adminLogs").add({
      action: "enable_user",
      targetUserId: uid,
      adminUserId: context.auth.uid,
      timestamp: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      message: "User account enabled successfully",
      uid: uid,
    };

  } catch (error: any) {
    console.error("Failed to enable user:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to enable user: ${error.message}`
    );
  }
});

/**
 * ユーザーセッション情報の更新
 */
export const updateUserSession = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const uid = context.auth.uid;

  try {
    // ユーザードキュメントを更新
    await db.collection("users").doc(uid).update({
      lastLoginAt: admin.firestore.Timestamp.now(),
      loginCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    // セッション情報を記録
    await db.collection("users").doc(uid).collection("sessions").add({
      loginAt: admin.firestore.Timestamp.now(),
      userAgent: data.userAgent || "",
      ipAddress: data.ipAddress || "",
      platform: data.platform || "",
    });

    return {
      success: true,
      message: "User session updated successfully",
    };

  } catch (error: any) {
    console.error("Failed to update user session:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to update user session: ${error.message}`
    );
  }
});

/**
 * ユーザー情報の取得（管理者用）
 */
export const getUserInfo = functions.https.onCall(async (data, context) => {
  // 管理者権限チェック
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admin privileges required"
    );
  }

  const { uid } = data;

  if (!uid) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "uid is required"
    );
  }

  try {
    // Firebase Authからユーザー情報を取得
    const authUser = await admin.auth().getUser(uid);

    // Firestoreからユーザードキュメントを取得
    const userDoc = await db.collection("users").doc(uid).get();

    const userData = userDoc.exists ? userDoc.data() : null;

    return {
      success: true,
      authUser: {
        uid: authUser.uid,
        email: authUser.email,
        emailVerified: authUser.emailVerified,
        displayName: authUser.displayName,
        photoURL: authUser.photoURL,
        disabled: authUser.disabled,
        metadata: authUser.metadata,
        customClaims: authUser.customClaims,
      },
      userData: userData,
    };

  } catch (error: any) {
    console.error("Failed to get user info:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get user info: ${error.message}`
    );
  }
}); 