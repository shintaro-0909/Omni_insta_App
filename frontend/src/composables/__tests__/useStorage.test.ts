import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStorage } from '../useStorage';

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({ type: 'storage-mock' })),
  connectStorageEmulator: vi.fn(),
  ref: vi.fn(() => ({ type: 'storage-ref-mock' })),
  uploadBytes: vi.fn(() => Promise.resolve({ 
    ref: { type: 'storage-ref-mock' } 
  })),
  uploadBytesResumable: vi.fn(() => ({
    on: vi.fn(),
    cancel: vi.fn()
  })),
  getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/test-image.jpg')),
  deleteObject: vi.fn(() => Promise.resolve()),
  listAll: vi.fn(() => Promise.resolve({
    items: [
      { type: 'storage-ref-mock' },
      { type: 'storage-ref-mock' }
    ]
  }))
}));

// Mock environment variables
vi.stubGlobal('import.meta', {
  env: {
    VITE_STORAGE_EMULATE: 'true'
  }
});

// Mock Canvas API for image optimization
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    drawImage: vi.fn(),
  }))
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: vi.fn((callback) => {
    callback(new Blob(['test'], { type: 'image/jpeg' }));
  })
});

describe('useStorage', () => {
  let storage: ReturnType<typeof useStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = useStorage();
  });

  describe('Environment Detection', () => {
    it('detects emulator mode correctly', () => {
      expect(storage.isEmulatorMode.value).toBe(true);
    });

    it('provides emulator info when in emulator mode', () => {
      const emulatorInfo = storage.getEmulatorInfo();
      expect(emulatorInfo).toEqual({
        host: 'localhost',
        port: 9199,
        url: 'http://localhost:9199'
      });
    });
  });

  describe('Connection Management', () => {
    it('initializes with connecting status', () => {
      expect(storage.connectionStatus.value).toBe('connecting');
      expect(storage.isConnected.value).toBe(false);
    });

    it('updates connection status correctly', () => {
      storage.updateConnectionStatus('online');
      expect(storage.connectionStatus.value).toBe('online');
      expect(storage.isConnected.value).toBe(true);

      storage.updateConnectionStatus('offline');
      expect(storage.connectionStatus.value).toBe('offline');
      expect(storage.isConnected.value).toBe(false);
    });
  });

  describe('Image Upload', () => {
    it('uploads image successfully', async () => {
      const { uploadBytes, getDownloadURL } = await import('firebase/storage');
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const downloadURL = await storage.uploadImage(mockFile, 'test/image.jpg');

      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();
      expect(downloadURL).toBe('https://example.com/test-image.jpg');
    });

    it('handles upload with progress tracking', async () => {
      const { uploadBytesResumable } = await import('firebase/storage');
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const progressCallback = vi.fn();

      const mockTask = {
        on: vi.fn((event, progress, error, complete) => {
          // Simulate progress
          progress({ bytesTransferred: 50, totalBytes: 100 });
          // Simulate completion
          complete();
        }),
        snapshot: { ref: { type: 'storage-ref-mock' } }
      };

      (uploadBytesResumable as any).mockReturnValue(mockTask);

      const promise = storage.uploadImage(mockFile, 'test/image.jpg', {
        onProgress: progressCallback
      });

      await promise;

      expect(progressCallback).toHaveBeenCalledWith(50);
      expect(uploadBytesResumable).toHaveBeenCalled();
    });

    it('optimizes images before upload', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock Image object
      global.Image = class {
        onload: (() => void) | null = null;
        src = '';
        width = 2000;
        height = 2000;
        
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as any;

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:test');

      const optimizedFile = await storage.optimizeImage(mockFile, 1080, 1080, 0.8);

      expect(optimizedFile).toBeInstanceOf(File);
      expect(optimizedFile.type).toBe('image/jpeg');
    });
  });

  describe('Image Management', () => {
    it('deletes images successfully', async () => {
      const { deleteObject } = await import('firebase/storage');

      await storage.deleteImage('test/image.jpg');

      expect(deleteObject).toHaveBeenCalled();
    });

    it('lists images in folder', async () => {
      const { listAll, getDownloadURL } = await import('firebase/storage');

      const urls = await storage.listImages('test/folder');

      expect(listAll).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalledTimes(2);
      expect(urls).toHaveLength(2);
    });

    it('cancels upload task', () => {
      const mockTask = { cancel: vi.fn() };
      storage.uploadTasks.value['test/path'] = mockTask as any;

      storage.cancelUpload('test/path');

      expect(mockTask.cancel).toHaveBeenCalled();
      expect(storage.uploadTasks.value['test/path']).toBeUndefined();
    });
  });

  describe('Batch Operations', () => {
    it('uploads multiple images', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];
      const progressCallback = vi.fn();

      const urls = await storage.uploadMultipleImages(files, 'test/batch', {
        onProgress: progressCallback,
        optimize: false
      });

      expect(urls).toHaveLength(2);
      expect(progressCallback).toHaveBeenCalled();
    });
  });

  describe('Offline Support', () => {
    // Mock Cache API
    beforeEach(() => {
      global.caches = {
        open: vi.fn(() => Promise.resolve({
          put: vi.fn(),
          match: vi.fn(() => Promise.resolve({
            blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' }))
          }))
        }))
      } as any;
    });

    it('caches images locally', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const url = 'https://example.com/image.jpg';

      await storage.cacheImageLocally(url, mockFile);

      expect(global.caches.open).toHaveBeenCalledWith('storage-cache-v1');
    });

    it('retrieves cached images', async () => {
      const url = 'https://example.com/image.jpg';

      const cachedFile = await storage.getCachedImage(url);

      expect(cachedFile).toBeInstanceOf(File);
      expect(global.caches.open).toHaveBeenCalledWith('storage-cache-v1');
    });
  });

  describe('Error Handling', () => {
    it('handles upload errors gracefully', async () => {
      const { uploadBytes } = await import('firebase/storage');
      (uploadBytes as any).mockRejectedValueOnce(new Error('Upload failed'));

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await expect(
        storage.uploadImage(mockFile, 'test/image.jpg')
      ).rejects.toThrow('Upload failed');
    });

    it('handles delete errors gracefully', async () => {
      const { deleteObject } = await import('firebase/storage');
      (deleteObject as any).mockRejectedValueOnce(new Error('Delete failed'));

      await expect(
        storage.deleteImage('test/image.jpg')
      ).rejects.toThrow('Delete failed');
    });
  });

  describe('Low-level API', () => {
    it('provides storage instance', () => {
      const storageInstance = storage.getStorageInstance();
      expect(storageInstance).toEqual({ type: 'storage-mock' });
    });

    it('provides storage reference', () => {
      const storageRef = storage.getStorageRef('test/path');
      expect(storageRef).toEqual({ type: 'storage-ref-mock' });
    });
  });
});