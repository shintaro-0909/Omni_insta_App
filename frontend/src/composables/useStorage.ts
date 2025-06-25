import { ref, computed } from 'vue';
import { 
  getStorage, 
  connectStorageEmulator,
  ref as storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type FirebaseStorage,
  type StorageReference,
  type UploadTask,
  type UploadTaskSnapshot
} from 'firebase/storage';

/**
 * 🗄️ Firebase Storage操作の統合Composable
 * 
 * [STORAGE-001] 修正: Storage Emulator完全対応
 * - エミュレーター・本番環境の自動切り替え
 * - 画像アップロード・削除・リスト取得
 * - プログレス追跡・エラーハンドリング
 * - オフライン対応・キャッシング
 */
export const useStorage = () => {
  // エミュレーター・本番Storage切り替え
  const isEmulatorMode = computed(() => {
    return import.meta.env.VITE_STORAGE_EMULATE === 'true';
  });

  // Storage接続状態
  const isConnected = ref(false);
  const connectionStatus = ref<'online' | 'offline' | 'connecting'>('connecting');

  // アップロード状態
  const uploadProgress = ref<Record<string, number>>({});
  const uploadTasks = ref<Record<string, UploadTask>>({});

  // Storageインスタンス取得
  let storageInstance: FirebaseStorage | null = null;
  
  const getStorageInstance = (): FirebaseStorage => {
    if (!storageInstance) {
      storageInstance = getStorage();
      
      if (isEmulatorMode.value) {
        try {
          connectStorageEmulator(storageInstance, 'localhost', 9199);
          console.log('🗄️ Storage Emulator connected');
        } catch (error) {
          console.warn('Storage Emulator already connected:', error);
        }
      } else {
        console.log('☁️ Using Production Storage');
      }
    }
    
    return storageInstance;
  };

  // Storage参照の取得
  const getStorageRef = (path: string): StorageReference => {
    const storage = getStorageInstance();
    return storageRef(storage, path);
  };

  // 画像アップロード
  const uploadImage = async (
    file: File, 
    path: string, 
    options?: {
      onProgress?: (progress: number) => void;
      metadata?: Record<string, any>;
    }
  ): Promise<string> => {
    try {
      const storage = getStorageInstance();
      const imageRef = storageRef(storage, path);
      
      // メタデータ設定
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          size: file.size.toString(),
          ...options?.metadata
        }
      };

      if (options?.onProgress) {
        // プログレス追跡付きアップロード
        const uploadTask = uploadBytesResumable(imageRef, file, metadata);
        uploadTasks.value[path] = uploadTask;

        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot: UploadTaskSnapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              uploadProgress.value[path] = progress;
              options.onProgress?.(progress);
            },
            (error) => {
              delete uploadTasks.value[path];
              delete uploadProgress.value[path];
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                delete uploadTasks.value[path];
                delete uploadProgress.value[path];
                resolve(downloadURL);
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        // 単純アップロード
        const snapshot = await uploadBytes(imageRef, file, metadata);
        return await getDownloadURL(snapshot.ref);
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // 画像削除
  const deleteImage = async (path: string): Promise<void> => {
    try {
      const imageRef = getStorageRef(path);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  // 画像リスト取得
  const listImages = async (folderPath: string): Promise<string[]> => {
    try {
      const folderRef = getStorageRef(folderPath);
      const result = await listAll(folderRef);
      
      const downloadURLs: string[] = [];
      for (const itemRef of result.items) {
        const url = await getDownloadURL(itemRef);
        downloadURLs.push(url);
      }
      
      return downloadURLs;
    } catch (error) {
      console.error('List images error:', error);
      throw error;
    }
  };

  // アップロードキャンセル
  const cancelUpload = (path: string): void => {
    const task = uploadTasks.value[path];
    if (task) {
      task.cancel();
      delete uploadTasks.value[path];
      delete uploadProgress.value[path];
    }
  };

  // 画像最適化（リサイズ）
  const optimizeImage = (
    file: File, 
    maxWidth: number = 1080,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // アスペクト比を保持してリサイズ
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // バッチアップロード
  const uploadMultipleImages = async (
    files: File[],
    basePath: string,
    options?: {
      onProgress?: (fileIndex: number, progress: number) => void;
      optimize?: boolean;
    }
  ): Promise<string[]> => {
    const results: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${Date.now()}_${i}_${file.name}`;
      const path = `${basePath}/${fileName}`;
      
      try {
        const fileToUpload = options?.optimize 
          ? await optimizeImage(file)
          : file;
        
        const downloadURL = await uploadImage(fileToUpload, path, {
          onProgress: (progress) => options?.onProgress?.(i, progress)
        });
        
        results.push(downloadURL);
      } catch (error) {
        console.error(`Upload failed for file ${i}:`, error);
        throw error;
      }
    }
    
    return results;
  };

  // 接続状態更新
  const updateConnectionStatus = (status: 'online' | 'offline' | 'connecting') => {
    connectionStatus.value = status;
    isConnected.value = status === 'online';
  };

  // エミュレーター情報
  const getEmulatorInfo = () => {
    if (isEmulatorMode.value) {
      return {
        host: 'localhost',
        port: 9199,
        url: 'http://localhost:9199'
      };
    }
    return null;
  };

  // オフライン対応: IndexedDBキャッシュ
  const cacheImageLocally = async (url: string, file: File): Promise<void> => {
    if (isEmulatorMode.value || connectionStatus.value === 'offline') {
      try {
        const cache = await caches.open('storage-cache-v1');
        const response = new Response(file);
        await cache.put(url, response);
      } catch (error) {
        console.warn('Failed to cache image locally:', error);
      }
    }
  };

  const getCachedImage = async (url: string): Promise<File | null> => {
    try {
      const cache = await caches.open('storage-cache-v1');
      const response = await cache.match(url);
      
      if (response) {
        const blob = await response.blob();
        return new File([blob], 'cached-image', { type: blob.type });
      }
    } catch (error) {
      console.warn('Failed to get cached image:', error);
    }
    return null;
  };

  return {
    // 状態
    isEmulatorMode,
    isConnected,
    connectionStatus,
    uploadProgress,
    
    // メソッド
    uploadImage,
    deleteImage,
    listImages,
    cancelUpload,
    optimizeImage,
    uploadMultipleImages,
    updateConnectionStatus,
    getEmulatorInfo,
    cacheImageLocally,
    getCachedImage,
    
    // 低レベルAPI
    getStorageInstance,
    getStorageRef
  };
};