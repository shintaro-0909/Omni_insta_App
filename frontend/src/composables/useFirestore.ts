import { ref, computed } from 'vue';
import type { Firestore } from 'firebase/firestore';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  type CollectionReference,
  type DocumentReference,
  type Query,
  type DocumentSnapshot,
  type QuerySnapshot
} from 'firebase/firestore';
import { db as defaultDb } from '@/services/firebase';

/**
 * Firestore操作の統合Composable
 * エミュレーター・本番環境の切り替え対応
 */
export const useFirestore = () => {
  // エミュレーター・本番DB切り替え
  const isEmulatorMode = computed(() => {
    return import.meta.env.VITE_FIRESTORE_EMULATE === 'true';
  });

  // DB接続状態
  const isConnected = ref(false);
  const isOffline = ref(false);
  const connectionStatus = ref<'online' | 'offline' | 'connecting'>('connecting');

  // DBインスタンス取得
  const getDbInstance = (): Firestore => {
    if (isEmulatorMode.value) {
      console.log('🔧 Using Firestore Emulator');
      return defaultDb; // firebase.ts で既にエミュレーター接続済み
    }
    
    console.log('🌐 Using Production Firestore');
    return defaultDb;
  };

  // コレクション参照の取得
  const getCollection = (path: string): CollectionReference => {
    const dbInstance = getDbInstance();
    return collection(dbInstance, path);
  };

  // ドキュメント参照の取得
  const getDocument = (path: string, docId: string): DocumentReference => {
    const dbInstance = getDbInstance();
    return doc(dbInstance, path, docId);
  };

  // ドキュメント作成
  const createDocument = async (path: string, data: any): Promise<string> => {
    try {
      const collectionRef = getCollection(path);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Document created: ${path}/${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error(`❌ Error creating document in ${path}:`, error);
      throw error;
    }
  };

  // ドキュメント更新
  const updateDocument = async (path: string, docId: string, data: any): Promise<void> => {
    try {
      const docRef = getDocument(path, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      
      console.log(`✅ Document updated: ${path}/${docId}`);
    } catch (error) {
      console.error(`❌ Error updating document ${path}/${docId}:`, error);
      throw error;
    }
  };

  // ドキュメント削除
  const deleteDocument = async (path: string, docId: string): Promise<void> => {
    try {
      const docRef = getDocument(path, docId);
      await deleteDoc(docRef);
      
      console.log(`✅ Document deleted: ${path}/${docId}`);
    } catch (error) {
      console.error(`❌ Error deleting document ${path}/${docId}:`, error);
      throw error;
    }
  };

  // ドキュメント取得
  const getDocumentData = async (path: string, docId: string): Promise<any | null> => {
    try {
      const docRef = getDocument(path, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error getting document ${path}/${docId}:`, error);
      throw error;
    }
  };

  // コレクション全取得
  const getCollectionData = async (path: string, queryOptions?: {
    where?: Array<{ field: string; operator: any; value: any }>;
    orderBy?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
    limit?: number;
  }): Promise<any[]> => {
    try {
      let queryRef: Query = getCollection(path);

      // クエリ条件適用
      if (queryOptions?.where) {
        queryOptions.where.forEach(condition => {
          queryRef = query(queryRef, where(condition.field, condition.operator, condition.value));
        });
      }

      if (queryOptions?.orderBy) {
        queryOptions.orderBy.forEach(order => {
          queryRef = query(queryRef, orderBy(order.field, order.direction || 'asc'));
        });
      }

      if (queryOptions?.limit) {
        queryRef = query(queryRef, limit(queryOptions.limit));
      }

      const querySnapshot = await getDocs(queryRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`❌ Error getting collection ${path}:`, error);
      throw error;
    }
  };

  // リアルタイムリスナー設定
  const subscribeToCollection = (
    path: string, 
    callback: (data: any[]) => void,
    queryOptions?: {
      where?: Array<{ field: string; operator: any; value: any }>;
      orderBy?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
      limit?: number;
    }
  ) => {
    let queryRef: Query = getCollection(path);

    // クエリ条件適用
    if (queryOptions?.where) {
      queryOptions.where.forEach(condition => {
        queryRef = query(queryRef, where(condition.field, condition.operator, condition.value));
      });
    }

    if (queryOptions?.orderBy) {
      queryOptions.orderBy.forEach(order => {
        queryRef = query(queryRef, orderBy(order.field, order.direction || 'asc'));
      });
    }

    if (queryOptions?.limit) {
      queryRef = query(queryRef, limit(queryOptions.limit));
    }

    return onSnapshot(queryRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    }, (error) => {
      console.error(`❌ Error in collection subscription ${path}:`, error);
    });
  };

  // ドキュメントリスナー設定
  const subscribeToDocument = (
    path: string, 
    docId: string, 
    callback: (data: any | null) => void
  ) => {
    const docRef = getDocument(path, docId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`❌ Error in document subscription ${path}/${docId}:`, error);
    });
  };

  // バッチ操作
  const executeBatch = async (operations: Array<{
    type: 'create' | 'update' | 'delete';
    path: string;
    docId?: string;
    data?: any;
  }>): Promise<void> => {
    try {
      const dbInstance = getDbInstance();
      const batch = writeBatch(dbInstance);

      operations.forEach(operation => {
        switch (operation.type) {
          case 'create':
            if (operation.docId) {
              const docRef = getDocument(operation.path, operation.docId);
              batch.set(docRef, {
                ...operation.data,
                createdAt: new Date(),
                updatedAt: new Date()
              });
            }
            break;
          
          case 'update':
            if (operation.docId) {
              const docRef = getDocument(operation.path, operation.docId);
              batch.update(docRef, {
                ...operation.data,
                updatedAt: new Date()
              });
            }
            break;
          
          case 'delete':
            if (operation.docId) {
              const docRef = getDocument(operation.path, operation.docId);
              batch.delete(docRef);
            }
            break;
        }
      });

      await batch.commit();
      console.log(`✅ Batch operation completed: ${operations.length} operations`);
    } catch (error) {
      console.error('❌ Error in batch operation:', error);
      throw error;
    }
  };

  // オフライン対応状態管理
  const updateConnectionStatus = (status: 'online' | 'offline' | 'connecting') => {
    connectionStatus.value = status;
    isConnected.value = status === 'online';
    isOffline.value = status === 'offline';
  };

  // エミュレーター情報
  const getEmulatorInfo = () => {
    if (isEmulatorMode.value) {
      return {
        host: 'localhost',
        port: 8080,
        url: 'http://localhost:4000'
      };
    }
    return null;
  };

  return {
    // 状態
    isEmulatorMode,
    isConnected,
    isOffline,
    connectionStatus,
    
    // DB操作
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentData,
    getCollectionData,
    
    // リアルタイム操作
    subscribeToCollection,
    subscribeToDocument,
    
    // バッチ操作
    executeBatch,
    
    // 接続管理
    updateConnectionStatus,
    getEmulatorInfo,
    
    // 低レベルAPI
    getDbInstance,
    getCollection,
    getDocument
  };
};