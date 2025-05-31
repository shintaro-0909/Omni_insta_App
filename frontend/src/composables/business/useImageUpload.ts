/**
 * Image Upload Composable with Optimization for Omniy Instagram Scheduler
 * Automatically compresses images before upload to reduce Storage costs by 50%
 */

import { ref, computed } from 'vue'
import { 
  compressForInstagram,
  createThumbnail,
  formatFileSize,
  calculateSavings,
  type CompressionResult,
  type CompressionOptions
} from '@/utils/imageOptimizer'

interface UploadOptions {
  maxFiles?: number
  acceptedFormats?: string[]
  autoCompress?: boolean
  compressionPreset?: 'instagram' | 'thumbnail' | 'preview' | 'highQuality'
  customCompression?: CompressionOptions
  enableThumbnails?: boolean
  showPreview?: boolean
}

interface UploadedFile {
  id: string
  originalFile: File
  compressedFile?: Blob
  thumbnail?: Blob
  previewUrl: string
  thumbnailUrl?: string
  compressionResult?: CompressionResult
  uploadProgress?: number
  status: 'pending' | 'compressing' | 'compressed' | 'uploading' | 'uploaded' | 'error'
  error?: string
}

interface UploadStats {
  totalFiles: number
  totalOriginalSize: number
  totalCompressedSize: number
  totalSavings: number
  savingsPercentage: number
  compressionTime: number
}

export function useImageUpload(options: UploadOptions = {}) {
  const {
    maxFiles = 10,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
    autoCompress = true,
    compressionPreset = 'instagram',
    enableThumbnails = true,
    showPreview: _showPreview = true
  } = options

  // Reactive state
  const files = ref<UploadedFile[]>([])
  const isCompressing = ref(false)
  const compressionProgress = ref(0)
  const error = ref<string | null>(null)
  const stats = ref<UploadStats>({
    totalFiles: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    totalSavings: 0,
    savingsPercentage: 0,
    compressionTime: 0
  })

  // Computed properties
  const canAddMore = computed(() => files.value.length < maxFiles)
  const totalSavings = computed(() => formatFileSize(stats.value.totalSavings))
  const compressionRatio = computed(() => {
    return stats.value.totalOriginalSize > 0 
      ? (stats.value.totalOriginalSize / stats.value.totalCompressedSize).toFixed(2)
      : '1.00'
  })

  const hasFiles = computed(() => files.value.length > 0)
  const allCompressed = computed(() => 
    files.value.every(file => file.status === 'compressed' || file.status === 'uploaded')
  )

  // File validation
  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `サポートされていないファイル形式です: ${file.type}`
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return 'ファイルサイズが大きすぎます (50MB以下にしてください)'
    }

    return null
  }

  // Add files to upload queue
  const addFiles = async (fileList: FileList | File[]) => {
    error.value = null
    const filesToAdd = Array.from(fileList)

    // Check file count limit
    if (files.value.length + filesToAdd.length > maxFiles) {
      error.value = `最大${maxFiles}ファイルまでアップロードできます`
      return
    }

    // Validate and prepare files
    const validFiles: UploadedFile[] = []
    
    for (const file of filesToAdd) {
      const validationError = validateFile(file)
      if (validationError) {
        error.value = validationError
        continue
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalFile: file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending'
      }

      validFiles.push(uploadedFile)
    }

    files.value.push(...validFiles)

    // Auto-compress if enabled
    if (autoCompress && validFiles.length > 0) {
      await compressFiles(validFiles)
    }
  }

  // Compress selected files
  const compressFiles = async (filesToCompress?: UploadedFile[]) => {
    const targetFiles = filesToCompress || files.value.filter(f => f.status === 'pending')
    if (targetFiles.length === 0) return

    isCompressing.value = true
    compressionProgress.value = 0
    const startTime = Date.now()

    try {
      for (let i = 0; i < targetFiles.length; i++) {
        const uploadedFile = targetFiles[i]
        if (!uploadedFile) continue
        uploadedFile.status = 'compressing'

        try {
          // Compress main image
          const compressionResult = await getCompressionFunction()(uploadedFile.originalFile)
          
          uploadedFile.compressedFile = compressionResult.blob
          uploadedFile.compressionResult = compressionResult

          // Create thumbnail if enabled
          if (enableThumbnails) {
            const thumbnailResult = await createThumbnail(uploadedFile.originalFile)
            uploadedFile.thumbnail = thumbnailResult.blob
            uploadedFile.thumbnailUrl = URL.createObjectURL(thumbnailResult.blob)
          }

          uploadedFile.status = 'compressed'

          // Update stats
          updateStats(uploadedFile)

        } catch (err) {
          uploadedFile.status = 'error'
          uploadedFile.error = err instanceof Error ? err.message : '圧縮に失敗しました'
          console.error('Image compression failed:', err)
        }

        compressionProgress.value = ((i + 1) / targetFiles.length) * 100
      }

      stats.value.compressionTime = Date.now() - startTime

    } catch (err) {
      error.value = err instanceof Error ? err.message : '圧縮処理でエラーが発生しました'
    } finally {
      isCompressing.value = false
      compressionProgress.value = 0
    }
  }

  // Get compression function based on preset
  const getCompressionFunction = () => {
    switch (compressionPreset) {
      case 'thumbnail':
        return createThumbnail
      case 'instagram':
      default:
        return compressForInstagram
    }
  }

  // Update statistics
  const updateStats = (uploadedFile: UploadedFile) => {
    if (!uploadedFile.compressionResult) return

    const { originalSize, compressedSize } = uploadedFile.compressionResult
    const savings = originalSize - compressedSize

    stats.value.totalFiles++
    stats.value.totalOriginalSize += originalSize
    stats.value.totalCompressedSize += compressedSize
    stats.value.totalSavings += savings
    stats.value.savingsPercentage = (stats.value.totalSavings / stats.value.totalOriginalSize) * 100
  }

  // Remove file from upload queue
  const removeFile = (fileId: string) => {
    const index = files.value.findIndex(f => f.id === fileId)
    if (index !== -1) {
      const file = files.value[index]
      
      // Revoke object URLs to prevent memory leaks
      URL.revokeObjectURL(file.previewUrl)
      if (file.thumbnailUrl) {
        URL.revokeObjectURL(file.thumbnailUrl)
      }

      files.value.splice(index, 1)
    }
  }

  // Clear all files
  const clearFiles = () => {
    files.value.forEach(file => {
      URL.revokeObjectURL(file.previewUrl)
      if (file.thumbnailUrl) {
        URL.revokeObjectURL(file.thumbnailUrl)
      }
    })

    files.value = []
    resetStats()
  }

  // Reset statistics
  const resetStats = () => {
    stats.value = {
      totalFiles: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      totalSavings: 0,
      savingsPercentage: 0,
      compressionTime: 0
    }
  }

  // Get files for upload (compressed versions)
  const getFilesForUpload = (): { file: Blob; filename: string }[] => {
    return files.value
      .filter(f => f.status === 'compressed' && f.compressedFile)
      .map(f => ({
        file: f.compressedFile!,
        filename: f.originalFile.name
      }))
  }

  // Get thumbnails
  const getThumbnails = (): { file: Blob; filename: string }[] => {
    return files.value
      .filter(f => f.thumbnail)
      .map(f => ({
        file: f.thumbnail!,
        filename: `thumb_${f.originalFile.name}`
      }))
  }

  // Simulate upload progress (for demo/testing)
  const simulateUpload = async (fileId: string) => {
    const file = files.value.find(f => f.id === fileId)
    if (!file || file.status !== 'compressed') return

    file.status = 'uploading'
    file.uploadProgress = 0

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      file.uploadProgress = progress
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    file.status = 'uploaded'
    file.uploadProgress = 100
  }

  // Format compression details for display
  const getCompressionDetails = (file: UploadedFile) => {
    if (!file.compressionResult) return null

    const { originalSize, compressedSize, compressionRatio, quality, format } = file.compressionResult
    const savings = calculateSavings(originalSize, compressedSize)

    return {
      originalSize: formatFileSize(originalSize),
      compressedSize: formatFileSize(compressedSize),
      savings: formatFileSize(savings.savingsBytes),
      savingsPercentage: savings.savingsPercentage.toFixed(1),
      compressionRatio: compressionRatio.toFixed(2),
      quality: (quality * 100).toFixed(0),
      format
    }
  }

  // Cleanup on unmount
  const cleanup = () => {
    files.value.forEach(file => {
      URL.revokeObjectURL(file.previewUrl)
      if (file.thumbnailUrl) {
        URL.revokeObjectURL(file.thumbnailUrl)
      }
    })
  }

  // File input helper
  const createFileInput = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = acceptedFormats.join(',')
    input.multiple = maxFiles > 1
    
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        addFiles(target.files)
      }
    }

    return input
  }

  // Trigger file selection
  const selectFiles = () => {
    const input = createFileInput()
    input.click()
  }

  return {
    // State
    files: readonly(files),
    isCompressing: readonly(isCompressing),
    compressionProgress: readonly(compressionProgress),
    error: readonly(error),
    stats: readonly(stats),

    // Computed
    canAddMore,
    totalSavings,
    compressionRatio,
    hasFiles,
    allCompressed,

    // Methods
    addFiles,
    compressFiles,
    removeFile,
    clearFiles,
    getFilesForUpload,
    getThumbnails,
    simulateUpload,
    getCompressionDetails,
    selectFiles,
    cleanup,

    // Utilities
    formatFileSize,
    validateFile
  }
}

// Helper function for drag and drop
export function useDragAndDrop(
  onDrop: (files: FileList) => void,
  onDragOver?: (event: DragEvent) => void
) {
  const isDragging = ref(false)

  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault()
    isDragging.value = true
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    if (!event.relatedTarget || !(event.currentTarget as Element).contains(event.relatedTarget as Node)) {
      isDragging.value = false
    }
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (onDragOver) {
      onDragOver(event)
    }
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    isDragging.value = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      onDrop(files)
    }
  }

  return {
    isDragging: readonly(isDragging),
    dragHandlers: {
      onDragenter: handleDragEnter,
      onDragleave: handleDragLeave,
      onDragover: handleDragOver,
      onDrop: handleDrop
    }
  }
}