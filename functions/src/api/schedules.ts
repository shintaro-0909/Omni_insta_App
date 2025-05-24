import * as functions from "firebase-functions";
import {db} from "../index";
import * as admin from "firebase-admin";
import {
  ScheduleData,
  ScheduleType,
  ScheduleStatus,
  RepeatRule,
  calculateNextRunAt,
  updateNextRunAfterExecution,
  validateScheduleData,
  createTimestamp,
} from "../utils/scheduleUtils";

// スケジュール作成
export const createSchedule = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {
    igAccountId,
    contentId,
    type,
    title,
    description,
    scheduledTime,
    repeatRule,
  } = data;

  // 入力値検証
  if (!igAccountId || !contentId || !type || !title) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "IGAccount ID, Content ID, type, and title are required"
    );
  }

  try {
    // ユーザー情報とプラン制限を取得
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "User not found"
      );
    }

    const userData = userDoc.data();
    const timezone = userData?.settings?.timeZone || "Asia/Tokyo";

    // IGアカウントの存在確認
    const igAccountRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .doc(igAccountId);

    const igAccountDoc = await igAccountRef.get();
    if (!igAccountDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Instagram account not found"
      );
    }

    // コンテンツの存在確認
    const contentRef = db.collection("posts").doc(contentId);
    const contentDoc = await contentRef.get();
    
    if (!contentDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Content not found"
      );
    }

    const contentData = contentDoc.data();
    if (contentData?.ownerUid !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Access denied to content"
      );
    }

    // スケジュールデータの準備
    const scheduleData: Partial<ScheduleData> = {
      ownerUid: context.auth.uid,
      igAccountRef: igAccountRef,
      contentRef: contentRef,
      type: type as ScheduleType,
      title: title,
      description: description,
      status: "active" as ScheduleStatus,
      repeatRule: repeatRule as RepeatRule,
      runCount: 0,
      retryCount: 0,
    };

    // 入力値検証
    const validationErrors = validateScheduleData(scheduleData);
    if (validationErrors.length > 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Validation failed: ${validationErrors.join(", ")}`
      );
    }

    // 次回実行時刻を計算
    let nextRunAt: Date;
    
    if (type === "one_time") {
      if (!scheduledTime) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Scheduled time is required for one-time schedule"
        );
      }
      nextRunAt = calculateNextRunAt(
        type,
        new Date(scheduledTime),
        repeatRule,
        timezone
      );
    } else {
      nextRunAt = calculateNextRunAt(
        type,
        new Date(), // 現在時刻から計算
        repeatRule,
        timezone
      );
    }

    // 完全なスケジュールデータを作成
    const completeScheduleData: ScheduleData = {
      ...scheduleData,
      nextRunAt: createTimestamp(nextRunAt),
      createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    } as ScheduleData;

    // Firestoreに保存
    const docRef = await igAccountRef
      .collection("schedules")
      .add(completeScheduleData);

    return {
      success: true,
      scheduleId: docRef.id,
      nextRunAt: nextRunAt.toISOString(),
      message: "Schedule created successfully",
    };
  } catch (error) {
    console.error("Error creating schedule:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create schedule"
    );
  }
});

// スケジュール一覧取得
export const getSchedules = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {limit = 20, lastScheduleId, status, type, igAccountId} = data;

  try {
    let query = db.collectionGroup("schedules")
      .where("ownerUid", "==", context.auth.uid);

    // フィルター条件を追加
    if (status) {
      query = query.where("status", "==", status);
    }

    if (type) {
      query = query.where("type", "==", type);
    }

    if (igAccountId) {
      const igAccountRef = db
        .collection("users")
        .doc(context.auth.uid)
        .collection("igAccounts")
        .doc(igAccountId);
      
      query = query.where("igAccountRef", "==", igAccountRef);
    }

    // ソート
    query = query.orderBy("nextRunAt", "desc");

    // ページネーション
    if (lastScheduleId) {
      const lastDoc = await db.collectionGroup("schedules")
        .where("ownerUid", "==", context.auth.uid)
        .where("__name__", "==", lastScheduleId)
        .get();
      
      if (!lastDoc.empty) {
        query = query.startAfter(lastDoc.docs[0]);
      }
    }

    query = query.limit(limit);

    const snapshot = await query.get();
    const schedules = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // 関連データを取得
        const [igAccountDoc, contentDoc] = await Promise.all([
          data.igAccountRef.get(),
          data.contentRef.get(),
        ]);

        return {
          id: doc.id,
          ...data,
          igAccount: igAccountDoc.exists ? {
            id: igAccountDoc.id,
            username: igAccountDoc.data()?.username,
          } : null,
          content: contentDoc.exists ? {
            id: contentDoc.id,
            mediaUrls: contentDoc.data()?.mediaUrls,
            caption: contentDoc.data()?.caption,
          } : null,
        };
      })
    );

    return {
      success: true,
      schedules: schedules,
      hasMore: snapshot.docs.length === limit,
      lastScheduleId: snapshot.docs.length > 0 ?
        snapshot.docs[snapshot.docs.length - 1].id : null,
    };
  } catch (error) {
    console.error("Error getting schedules:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get schedules"
    );
  }
});

// スケジュール詳細取得
export const getSchedule = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {scheduleId, igAccountId} = data;

  if (!scheduleId || !igAccountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Schedule ID and IG Account ID are required"
    );
  }

  try {
    const scheduleRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .doc(igAccountId)
      .collection("schedules")
      .doc(scheduleId);

    const scheduleDoc = await scheduleRef.get();

    if (!scheduleDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Schedule not found"
      );
    }

    const scheduleData = scheduleDoc.data() as ScheduleData;

    // 所有者チェック
    if (scheduleData.ownerUid !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Access denied"
      );
    }

    // 関連データを取得
    const [igAccountDoc, contentDoc] = await Promise.all([
      scheduleData.igAccountRef.get(),
      scheduleData.contentRef.get(),
    ]);

    return {
      success: true,
      schedule: {
        id: scheduleDoc.id,
        ...scheduleData,
        igAccount: igAccountDoc.exists ? {
          id: igAccountDoc.id,
          username: igAccountDoc.data()?.username,
        } : null,
        content: contentDoc.exists ? {
          id: contentDoc.id,
          mediaUrls: contentDoc.data()?.mediaUrls,
          caption: contentDoc.data()?.caption,
          tags: contentDoc.data()?.tags,
        } : null,
      },
    };
  } catch (error) {
    console.error("Error getting schedule:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get schedule"
    );
  }
});

// スケジュール更新
export const updateSchedule = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {
    scheduleId,
    igAccountId,
    title,
    description,
    status,
    scheduledTime,
    repeatRule,
  } = data;

  if (!scheduleId || !igAccountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Schedule ID and IG Account ID are required"
    );
  }

  try {
    const scheduleRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .doc(igAccountId)
      .collection("schedules")
      .doc(scheduleId);

    const scheduleDoc = await scheduleRef.get();

    if (!scheduleDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Schedule not found"
      );
    }

    const currentData = scheduleDoc.data() as ScheduleData;

    // 所有者チェック
    if (currentData.ownerUid !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Access denied"
      );
    }

    // 更新データの準備
    const updateData: Partial<ScheduleData> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    };

    if (title !== undefined) {
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (status !== undefined) {
      updateData.status = status as ScheduleStatus;
    }

    if (repeatRule !== undefined) {
      updateData.repeatRule = repeatRule as RepeatRule;
    }

    // 時刻変更がある場合は次回実行時刻を再計算
    if (scheduledTime !== undefined || repeatRule !== undefined) {
      const userDoc = await db.collection("users").doc(context.auth.uid).get();
      const timezone = userDoc.data()?.settings?.timeZone || "Asia/Tokyo";

      let nextRunAt: Date;
      
      if (currentData.type === "one_time" && scheduledTime) {
        nextRunAt = calculateNextRunAt(
          currentData.type,
          new Date(scheduledTime),
          updateData.repeatRule || currentData.repeatRule,
          timezone
        );
      } else {
        nextRunAt = calculateNextRunAt(
          currentData.type,
          new Date(),
          updateData.repeatRule || currentData.repeatRule,
          timezone
        );
      }

      updateData.nextRunAt = createTimestamp(nextRunAt);
    }

    // 入力値検証
    const mergedData = {...currentData, ...updateData};
    const validationErrors = validateScheduleData(mergedData);
    if (validationErrors.length > 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Validation failed: ${validationErrors.join(", ")}`
      );
    }

    await scheduleRef.update(updateData);

    return {
      success: true,
      message: "Schedule updated successfully",
    };
  } catch (error) {
    console.error("Error updating schedule:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to update schedule"
    );
  }
});

// スケジュール削除
export const deleteSchedule = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const {scheduleId, igAccountId} = data;

  if (!scheduleId || !igAccountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Schedule ID and IG Account ID are required"
    );
  }

  try {
    const scheduleRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("igAccounts")
      .doc(igAccountId)
      .collection("schedules")
      .doc(scheduleId);

    const scheduleDoc = await scheduleRef.get();

    if (!scheduleDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Schedule not found"
      );
    }

    const scheduleData = scheduleDoc.data() as ScheduleData;

    // 所有者チェック
    if (scheduleData.ownerUid !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Access denied"
      );
    }

    await scheduleRef.delete();

    return {
      success: true,
      message: "Schedule deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete schedule"
    );
  }
});

// スケジュール実行後の更新（内部使用）
export const updateScheduleAfterExecution = async (
  scheduleRef: FirebaseFirestore.DocumentReference,
  success: boolean,
  errorMessage?: string
): Promise<void> => {
  try {
    const scheduleDoc = await scheduleRef.get();
    
    if (!scheduleDoc.exists) {
      throw new Error("Schedule not found");
    }

    const scheduleData = scheduleDoc.data() as ScheduleData;
    const userDoc = await db.collection("users").doc(scheduleData.ownerUid).get();
    const timezone = userDoc.data()?.settings?.timeZone || "Asia/Tokyo";

    const updateData: Partial<ScheduleData> = {
      lastRunAt: admin.firestore.FieldValue.serverTimestamp() as any,
      runCount: scheduleData.runCount + 1,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
    };

    if (success) {
      // 成功時は次回実行時刻を計算
      const nextRunAt = updateNextRunAfterExecution(scheduleData, timezone);
      
      if (nextRunAt) {
        updateData.nextRunAt = createTimestamp(nextRunAt);
        updateData.retryCount = 0; // リトライカウントをリセット
      } else {
        // 一回限りの場合は完了状態に
        updateData.status = "completed";
      }
    } else {
      // 失敗時はリトライカウントを増加
      updateData.retryCount = scheduleData.retryCount + 1;
      
      // 3回失敗でエラー状態に
      if (updateData.retryCount >= 3) {
        updateData.status = "error";
      }
    }

    await scheduleRef.update(updateData);
  } catch (error) {
    console.error("Error updating schedule after execution:", error);
    throw error;
  }
}; 