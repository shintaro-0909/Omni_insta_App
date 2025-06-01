/**
 * Simplified Image Upload Composable for Release
 * Placeholder for advanced image handling functionality
 */

import { ref } from 'vue';

export interface ImageUploadOptions {
  maxFiles?: number;
  autoCompress?: boolean;
  compressionPreset?: string;
  enableThumbnails?: boolean;
}

export function useImageUpload(_options: ImageUploadOptions = {}) {
  const files = ref<File[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const stats = ref({
    totalFiles: 0,
    totalSize: 0,
    compressedSize: 0,
  });

  const addFiles = (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList);
    files.value.push(...newFiles);

    stats.value.totalFiles = files.value.length;
    stats.value.totalSize = files.value.reduce(
      (sum, file) => sum + file.size,
      0
    );
  };

  const removeFile = (index: number) => {
    files.value.splice(index, 1);
    stats.value.totalFiles = files.value.length;
    stats.value.totalSize = files.value.reduce(
      (sum, file) => sum + file.size,
      0
    );
  };

  const getFilesForUpload = () => {
    return files.value;
  };

  const clear = () => {
    files.value = [];
    error.value = null;
    stats.value = {
      totalFiles: 0,
      totalSize: 0,
      compressedSize: 0,
    };
  };

  return {
    files,
    loading,
    error,
    stats,
    addFiles,
    removeFile,
    getFilesForUpload,
    clear,
  };
}

export function useDragAndDrop(onFileDrop: (files: FileList) => void) {
  const isDragging = ref(false);

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = true;
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    if (!e.relatedTarget) {
      isDragging.value = false;
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = false;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      onFileDrop(files);
    }
  };

  return {
    isDragging,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  };
}
