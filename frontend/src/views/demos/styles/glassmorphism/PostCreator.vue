<template>
  <div class="glassmorphism-post-creator">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="particle" v-for="i in 20" :key="i" :style="getParticleStyle(i)"></div>
    </div>

    <v-container fluid class="pa-6">
      <!-- Header -->
      <div class="creator-header mb-8">
        <h1 class="creator-title">Create Your Post</h1>
        <p class="creator-subtitle">Design stunning content for your Instagram audience</p>
      </div>

      <v-row>
        <!-- Media Upload Section -->
        <v-col cols="12" md="6">
          <div class="glass-card media-section">
            <h2 class="section-title mb-4">Media</h2>
            
            <!-- Upload Area -->
            <div 
              class="upload-area"
              :class="{ 'drag-over': isDragging }"
              @dragover.prevent
              @dragenter.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*,video/*"
                style="display: none"
                @change="handleFileSelect"
              >
              
              <div v-if="!uploadedMedia.length" class="upload-placeholder">
                <v-icon size="64" color="white">mdi-cloud-upload</v-icon>
                <h3 class="upload-title">Drop media here</h3>
                <p class="upload-subtitle">or click to browse</p>
                <div class="supported-formats">
                  <v-chip size="small" class="glass-chip">JPG</v-chip>
                  <v-chip size="small" class="glass-chip">PNG</v-chip>
                  <v-chip size="small" class="glass-chip">MP4</v-chip>
                  <v-chip size="small" class="glass-chip">MOV</v-chip>
                </div>
              </div>
              
              <!-- Media Preview Grid -->
              <div v-else class="media-grid">
                <div 
                  v-for="(media, index) in uploadedMedia" 
                  :key="index"
                  class="media-item"
                >
                  <img v-if="media.type === 'image'" :src="media.url" :alt="`Media ${index + 1}`">
                  <video v-else :src="media.url" muted></video>
                  <div class="media-overlay">
                    <v-btn icon size="small" class="glass-btn" @click.stop="removeMedia(index)">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </div>
                  <div class="media-number">{{ index + 1 }}</div>
                </div>
                <div class="add-more" @click.stop="$refs.fileInput.click()">
                  <v-icon size="40">mdi-plus</v-icon>
                </div>
              </div>
            </div>

            <!-- Media Tools -->
            <div v-if="uploadedMedia.length" class="media-tools mt-4">
              <v-btn class="glass-btn tool-btn" size="small">
                <v-icon start>mdi-crop</v-icon>
                Crop
              </v-btn>
              <v-btn class="glass-btn tool-btn" size="small">
                <v-icon start>mdi-palette</v-icon>
                Filter
              </v-btn>
              <v-btn class="glass-btn tool-btn" size="small">
                <v-icon start>mdi-format-text</v-icon>
                Text
              </v-btn>
              <v-btn class="glass-btn tool-btn" size="small">
                <v-icon start>mdi-sticker-emoji</v-icon>
                Sticker
              </v-btn>
            </div>
          </div>

          <!-- Post Settings -->
          <div class="glass-card settings-section mt-4">
            <h3 class="subsection-title mb-3">Post Settings</h3>
            <v-select
              v-model="postSettings.type"
              :items="postTypes"
              label="Post Type"
              variant="outlined"
              density="comfortable"
              class="glass-select mb-3"
            ></v-select>
            <v-switch
              v-model="postSettings.shareToStory"
              label="Also share to Story"
              color="primary"
              class="glass-switch"
            ></v-switch>
            <v-switch
              v-model="postSettings.disableComments"
              label="Turn off commenting"
              color="primary"
              class="glass-switch"
            ></v-switch>
          </div>
        </v-col>

        <!-- Content Section -->
        <v-col cols="12" md="6">
          <!-- Caption -->
          <div class="glass-card caption-section">
            <h2 class="section-title mb-4">Caption</h2>
            <v-textarea
              v-model="caption"
              placeholder="Write a caption..."
              variant="outlined"
              rows="6"
              class="glass-textarea"
              counter="2200"
              @input="updatePreview"
            ></v-textarea>
            
            <!-- Caption Tools -->
            <div class="caption-tools mt-3">
              <v-btn icon size="small" class="glass-btn" @click="insertEmoji">
                <v-icon>mdi-emoticon-happy-outline</v-icon>
              </v-btn>
              <v-btn icon size="small" class="glass-btn" @click="insertHashtag">
                <v-icon>mdi-pound</v-icon>
              </v-btn>
              <v-btn icon size="small" class="glass-btn" @click="insertMention">
                <v-icon>mdi-at</v-icon>
              </v-btn>
              <div class="ml-auto caption-stats">
                <span class="stat-item">
                  <v-icon size="16">mdi-pound</v-icon>
                  {{ hashtagCount }} hashtags
                </span>
                <span class="stat-item">
                  <v-icon size="16">mdi-at</v-icon>
                  {{ mentionCount }} mentions
                </span>
              </div>
            </div>

            <!-- Suggested Hashtags -->
            <div class="suggested-hashtags mt-4">
              <h4 class="subsection-title mb-2">Suggested Hashtags</h4>
              <div class="hashtag-chips">
                <v-chip 
                  v-for="tag in suggestedHashtags" 
                  :key="tag"
                  class="glass-chip hashtag-chip"
                  @click="addHashtag(tag)"
                >
                  #{{ tag }}
                </v-chip>
              </div>
            </div>
          </div>

          <!-- Scheduling -->
          <div class="glass-card schedule-section mt-4">
            <h3 class="subsection-title mb-3">Schedule</h3>
            <v-radio-group v-model="scheduleType" class="glass-radio">
              <v-radio label="Post now" value="now"></v-radio>
              <v-radio label="Schedule for later" value="later"></v-radio>
            </v-radio-group>
            
            <v-expand-transition>
              <div v-if="scheduleType === 'later'" class="schedule-inputs mt-3">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="scheduleDate"
                      label="Date"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      class="glass-input"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="scheduleTime"
                      label="Time"
                      type="time"
                      variant="outlined"
                      density="comfortable"
                      class="glass-input"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <div class="best-time-hint">
                  <v-icon size="16" color="success">mdi-lightbulb</v-icon>
                  Best time to post: Today at 6:00 PM
                </div>
              </div>
            </v-expand-transition>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons mt-6">
            <v-btn class="glass-btn" size="large">
              <v-icon start>mdi-content-save-outline</v-icon>
              Save Draft
            </v-btn>
            <v-btn class="glass-btn primary-btn" size="large">
              <v-icon start>mdi-send</v-icon>
              {{ scheduleType === 'now' ? 'Post Now' : 'Schedule Post' }}
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Preview Modal -->
      <v-dialog v-model="previewDialog" max-width="400">
        <div class="glass-card preview-modal">
          <div class="preview-header">
            <v-avatar size="32">
              <img src="https://i.pravatar.cc/150?img=1" alt="Profile">
            </v-avatar>
            <span class="preview-username">fashionbrand</span>
            <v-btn icon size="small" class="ml-auto glass-btn" @click="previewDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="preview-media">
            <img v-if="uploadedMedia.length" :src="uploadedMedia[0].url" alt="Preview">
            <div v-else class="preview-placeholder">
              <v-icon size="64">mdi-image</v-icon>
            </div>
          </div>
          <div class="preview-caption">
            <p>{{ caption || 'Your caption will appear here...' }}</p>
          </div>
        </div>
      </v-dialog>

      <!-- Progress Overlay -->
      <v-overlay v-model="isUploading" persistent class="glass-overlay">
        <div class="upload-progress">
          <v-progress-circular
            :model-value="uploadProgress"
            :size="100"
            :width="8"
            color="white"
          >
            {{ uploadProgress }}%
          </v-progress-circular>
          <p class="upload-status mt-4">{{ uploadStatus }}</p>
        </div>
      </v-overlay>
    </v-container>

    <!-- Floating Preview Button -->
    <v-btn
      class="glass-fab preview-fab"
      fab
      @click="previewDialog = true"
    >
      <v-icon>mdi-eye</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Data
const isDragging = ref(false)
const uploadedMedia = ref<Array<{ type: string; url: string }>>([])
const caption = ref('')
const scheduleType = ref('now')
const scheduleDate = ref('')
const scheduleTime = ref('')
const previewDialog = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('Uploading...')

const postTypes = ['Feed Post', 'Reel', 'IGTV', 'Story']
const postSettings = ref({
  type: 'Feed Post',
  shareToStory: false,
  disableComments: false
})

const suggestedHashtags = ref([
  'fashion', 'style', 'ootd', 'instafashion', 'fashionblogger',
  'streetstyle', 'fashionista', 'outfitoftheday', 'lookbook'
])

// Computed
const hashtagCount = computed(() => {
  return (caption.value.match(/#\w+/g) || []).length
})

const mentionCount = computed(() => {
  return (caption.value.match(/@\w+/g) || []).length
})

// Methods
const getParticleStyle = (index: number) => {
  const size = Math.random() * 4 + 2
  const x = Math.random() * 100
  const y = Math.random() * 100
  const duration = Math.random() * 20 + 10
  const delay = Math.random() * 5
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  processFiles(files)
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processFiles(files)
}

const processFiles = (files: File[]) => {
  files.forEach(file => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedMedia.value.push({
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: e.target?.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeMedia = (index: number) => {
  uploadedMedia.value.splice(index, 1)
}

const insertEmoji = () => {
  caption.value += ' 😊'
}

const insertHashtag = () => {
  caption.value += ' #'
}

const insertMention = () => {
  caption.value += ' @'
}

const addHashtag = (tag: string) => {
  caption.value += ` #${tag}`
}

const updatePreview = () => {
  // Preview update logic
}
</script>

<style scoped>
.glassmorphism-post-creator {
  min-height: 100vh;
  background: linear-gradient(135deg, #FC466B 0%, #3F5EFB 50%, #42EECF 100%);
  background-size: 400% 400%;
  animation: gradientShift 25s ease infinite;
  position: relative;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: float-particle linear infinite;
}

@keyframes float-particle {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

/* Glass Card Base */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* Header */
.creator-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}

.creator-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
}

.creator-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
}

/* Section Titles */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

/* Upload Area */
.upload-area {
  min-height: 400px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.upload-placeholder {
  text-align: center;
  padding: 2rem;
}

.upload-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 1rem 0 0.5rem;
}

.upload-subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
}

.supported-formats {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  width: 100%;
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: move;
}

.media-item img,
.media-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.media-number {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.7);
}

.add-more:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Media Tools */
.media-tools {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tool-btn {
  flex: 1;
  min-width: 100px;
}

/* Glass Controls */
.glass-select :deep(.v-field),
.glass-input :deep(.v-field),
.glass-textarea :deep(.v-field) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-select :deep(.v-field__input),
.glass-input :deep(.v-field__input),
.glass-textarea :deep(.v-field__input) {
  color: white;
}

.glass-select :deep(.v-label),
.glass-input :deep(.v-label),
.glass-textarea :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7);
}

.glass-textarea :deep(.v-counter) {
  color: rgba(255, 255, 255, 0.6);
}

.glass-switch :deep(.v-label) {
  color: rgba(255, 255, 255, 0.9);
}

.glass-radio :deep(.v-label) {
  color: rgba(255, 255, 255, 0.9);
}

/* Glass Button */
.glass-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-weight: 500;
  transition: all 0.3s ease;
  text-transform: none;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.glass-btn.primary-btn {
  background: rgba(102, 126, 234, 0.4) !important;
  border-color: rgba(102, 126, 234, 0.6) !important;
}

.glass-btn.primary-btn:hover {
  background: rgba(102, 126, 234, 0.6) !important;
}

/* Caption Tools */
.caption-tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.caption-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

/* Hashtag Chips */
.hashtag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.glass-chip {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.glass-chip:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.05);
}

/* Schedule Section */
.best-time-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Preview Modal */
.preview-modal {
  padding: 0;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-username {
  color: white;
  font-weight: 600;
}

.preview-media {
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.1);
}

.preview-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
}

.preview-caption {
  padding: 1rem;
  color: rgba(255, 255, 255, 0.9);
  max-height: 200px;
  overflow-y: auto;
}

/* Upload Progress Overlay */
.glass-overlay :deep(.v-overlay__content) {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-progress {
  text-align: center;
}

.upload-status {
  color: white;
  font-size: 1.125rem;
}

/* Floating Preview Button */
.preview-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(102, 126, 234, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.9) !important;
  color: white !important;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
}

.preview-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
}

/* Responsive */
@media (max-width: 960px) {
  .creator-title {
    font-size: 2.5rem;
  }
  
  .media-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .v-btn {
    width: 100%;
  }
}
</style>