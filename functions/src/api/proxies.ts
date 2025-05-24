import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { testProxyConnection } from "../utils/proxyFetch";

const db = admin.firestore();

// プロキシの型定義
export interface Proxy {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'socks5';
  username?: string;
  password?: string;
  isActive: boolean;
  responseTime?: number;
  lastTestedAt?: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

/**
 * プロキシ一覧を取得
 */
export const getProxies = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  try {
    const proxiesSnapshot = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("proxies")
      .orderBy("createdAt", "desc")
      .get();

    const proxies = proxiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      proxies: proxies,
    };

  } catch (error: any) {
    console.error("Get proxies error:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to get proxies: ${error.message}`
    );
  }
});

/**
 * プロキシを作成
 */
export const createProxy = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { name, host, port, protocol, username, password } = data;

  // 入力値検証
  if (!name || !host || !port || !protocol) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "name, host, port, and protocol are required"
    );
  }

  if (!['http', 'https', 'socks5'].includes(protocol)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "protocol must be http, https, or socks5"
    );
  }

  if (port < 1 || port > 65535) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "port must be between 1 and 65535"
    );
  }

  try {
    const now = admin.firestore.Timestamp.now();
    
    const proxyData: Omit<Proxy, 'id'> = {
      name,
      host,
      port,
      protocol,
      username: username || undefined,
      password: password || undefined,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const proxyRef = await db
      .collection("users")
      .doc(context.auth.uid)
      .collection("proxies")
      .add(proxyData);

    return {
      success: true,
      proxy: {
        id: proxyRef.id,
        ...proxyData,
      },
    };

  } catch (error: any) {
    console.error("Create proxy error:", error);

    throw new functions.https.HttpsError(
      "internal",
      `Failed to create proxy: ${error.message}`
    );
  }
});

/**
 * プロキシを更新
 */
export const updateProxy = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { proxyId, name, host, port, protocol, username, password, isActive } = data;

  if (!proxyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "proxyId is required"
    );
  }

  try {
    const proxyRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("proxies")
      .doc(proxyId);

    const proxyDoc = await proxyRef.get();

    if (!proxyDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Proxy not found"
      );
    }

    const updateData: any = {
      updatedAt: admin.firestore.Timestamp.now(),
    };

    if (name !== undefined) updateData.name = name;
    if (host !== undefined) updateData.host = host;
    if (port !== undefined) {
      if (port < 1 || port > 65535) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "port must be between 1 and 65535"
        );
      }
      updateData.port = port;
    }
    if (protocol !== undefined) {
      if (!['http', 'https', 'socks5'].includes(protocol)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "protocol must be http, https, or socks5"
        );
      }
      updateData.protocol = protocol;
    }
    if (username !== undefined) updateData.username = username || admin.firestore.FieldValue.delete();
    if (password !== undefined) updateData.password = password || admin.firestore.FieldValue.delete();
    if (isActive !== undefined) updateData.isActive = isActive;

    await proxyRef.update(updateData);

    const updatedDoc = await proxyRef.get();
    const updatedProxy = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    return {
      success: true,
      proxy: updatedProxy,
    };

  } catch (error: any) {
    console.error("Update proxy error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to update proxy: ${error.message}`
    );
  }
});

/**
 * プロキシを削除
 */
export const deleteProxy = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { proxyId } = data;

  if (!proxyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "proxyId is required"
    );
  }

  try {
    const proxyRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("proxies")
      .doc(proxyId);

    const proxyDoc = await proxyRef.get();

    if (!proxyDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Proxy not found"
      );
    }

    await proxyRef.delete();

    return {
      success: true,
      proxyId: proxyId,
      deletedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Delete proxy error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to delete proxy: ${error.message}`
    );
  }
});

/**
 * プロキシ接続をテスト
 */
export const testProxy = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { proxyId } = data;

  if (!proxyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "proxyId is required"
    );
  }

  try {
    const proxyRef = db
      .collection("users")
      .doc(context.auth.uid)
      .collection("proxies")
      .doc(proxyId);

    const proxyDoc = await proxyRef.get();

    if (!proxyDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Proxy not found"
      );
    }

    const proxyData = proxyDoc.data()!;
    
    // プロキシ接続をテスト
    const testResult = await testProxyConnection({
      id: proxyDoc.id,
      host: proxyData.host,
      port: proxyData.port,
      protocol: proxyData.protocol,
      username: proxyData.username,
      password: proxyData.password,
      isActive: proxyData.isActive,
    });

    // テスト結果をプロキシドキュメントに保存
    await proxyRef.update({
      responseTime: testResult.responseTime,
      lastTestedAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      responseTime: testResult.responseTime,
      status: testResult.success ? 'working' : 'failed',
      error: testResult.error,
      testedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Test proxy error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to test proxy: ${error.message}`
    );
  }
});

/**
 * アカウントにプロキシを割り当て
 */
export const assignProxyToAccount = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { igAccountId, proxyId } = data;

  if (!igAccountId || !proxyId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "igAccountId and proxyId are required"
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

    // プロキシをアカウントに割り当て
    await igAccountRef.update({
      proxyId: proxyId,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      igAccountId: igAccountId,
      proxyId: proxyId,
      assignedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Assign proxy to account error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to assign proxy to account: ${error.message}`
    );
  }
});

/**
 * アカウントからプロキシを削除
 */
export const removeProxyFromAccount = functions.https.onCall(async (data, context) => {
  // 認証チェック
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required"
    );
  }

  const { igAccountId } = data;

  if (!igAccountId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "igAccountId is required"
    );
  }

  try {
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

    // プロキシをアカウントから削除
    await igAccountRef.update({
      proxyId: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return {
      success: true,
      igAccountId: igAccountId,
      removedAt: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Remove proxy from account error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      `Failed to remove proxy from account: ${error.message}`
    );
  }
});