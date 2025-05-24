import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

// グループの型定義
export interface Group {
  id: string;
  name: string;
  description?: string;
  igAccountIds: string[];
  proxyId?: string;
  color?: string;
  isActive: boolean;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

/**
 * グループ一覧を取得
 */
export const getGroups = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  try {
    const groupsSnapshot = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("groups")
      .orderBy("createdAt", "desc")
      .get();

    const groups = groupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      groups: groups,
    };

  } catch (error: any) {
    console.error("Get groups error:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get groups: ${error.message}`
    );
  }
});

/**
 * グループを作成
 */
export const createGroup = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { name, description, igAccountIds, proxyId, color } = data;

  // 入力値検証
  if (!name || !Array.isArray(igAccountIds)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "name and igAccountIds are required"
    );
  }

  try {
    // IGアカウントIDの存在確認
    if (igAccountIds.length > 0) {
      const accountChecks = await Promise.all(
        igAccountIds.map(async (igAccountId) => {
          const accountDoc = await db
            .collection("users")
            .doc(context.auth!.uid)
            .collection("igAccounts")
            .doc(igAccountId)
            .get();
          return accountDoc.exists;
        })
      );

      if (accountChecks.some(exists => !exists)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "One or more Instagram accounts not found"
        );
      }
    }

    const now = admin.firestore.Timestamp.now();
    
    const groupData: Omit<Group, 'id'> = {
      name,
      description: description || "",
      igAccountIds,
      proxyId: proxyId || undefined,
      color: color || "#1976d2",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const groupRef = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("groups")
      .add(groupData);

    return {
      success: true,
      group: {
        id: groupRef.id,
        ...groupData,
      },
    };

  } catch (error: any) {
    console.error("Create group error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to create group: ${error.message}`
    );
  }
});

/**
 * グループを更新
 */
export const updateGroup = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { groupId, name, description, igAccountIds, proxyId, color, isActive } = data;

  if (!groupId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "groupId is required"
    );
  }

  try {
    const groupRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("groups")
      .doc(groupId);

    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Group not found"
      );
    }

    const updateData: any = {
      updatedAt: admin.firestore.Timestamp.now(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (proxyId !== undefined) {
      updateData.proxyId = proxyId || admin.firestore.FieldValue.delete();
    }

    // IGアカウントIDの更新と存在確認
    if (igAccountIds !== undefined) {
      if (!Array.isArray(igAccountIds)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "igAccountIds must be an array"
        );
      }

      if (igAccountIds.length > 0) {
        const accountChecks = await Promise.all(
          igAccountIds.map(async (igAccountId) => {
            const accountDoc = await db
              .collection("users")
              .doc(context.auth!.uid)
              .collection("igAccounts")
              .doc(igAccountId)
              .get();
            return accountDoc.exists;
          })
        );

        if (accountChecks.some(exists => !exists)) {
          throw new functions.https.HttpsError(
            "invalid-argument",
            "One or more Instagram accounts not found"
          );
        }
      }

      updateData.igAccountIds = igAccountIds;
    }

    await groupRef.update(updateData);

    const updatedDoc = await groupRef.get();
    const updatedGroup = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    return {
      success: true,
      group: updatedGroup,
    };

  } catch (error: any) {
    console.error("Update group error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to update group: ${error.message}`
    );
  }
});

/**
 * グループを削除
 */
export const deleteGroup = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { groupId } = data;

  if (!groupId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "groupId is required"
    );
  }

  try {
    const groupRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("groups")
      .doc(groupId);

    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Group not found"
      );
    }

    await groupRef.delete();

    return {
      success: true,
      groupId: groupId,
      deletedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Delete group error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to delete group: ${error.message}`
    );
  }
});

/**
 * グループにプロキシを割り当て
 */
export const assignProxyToGroup = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { groupId, proxyId } = data;

  if (!groupId || !proxyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "groupId and proxyId are required"
    );
  }

  try {
    // プロキシの存在確認
    const proxyDoc = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("proxies")
      .doc(proxyId)
      .get();

    if (!proxyDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Proxy not found"
      );
    }

    // グループの存在確認
    const groupRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("groups")
      .doc(groupId);

    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Group not found"
      );
    }

    // プロキシをグループに割り当て
    await groupRef.update({
      proxyId: proxyId,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      groupId: groupId,
      proxyId: proxyId,
      assignedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Assign proxy to group error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to assign proxy to group: ${error.message}`
    );
  }
});

/**
 * グループからプロキシを削除
 */
export const removeProxyFromGroup = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { groupId } = data;

  if (!groupId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "groupId is required"
    );
  }

  try {
    const groupRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("groups")
      .doc(groupId);

    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Group not found"
      );
    }

    // プロキシをグループから削除
    await groupRef.update({
      proxyId: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      groupId: groupId,
      removedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Remove proxy from group error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to remove proxy from group: ${error.message}`
    );
  }
});