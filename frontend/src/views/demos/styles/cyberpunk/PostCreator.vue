<template>
  <div class="cyberpunk-creator">
    <div class="scanlines"></div>
    <div class="hex-pattern"></div>
    
    <!-- Header -->
    <header class="creator-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="glitch-text" data-text="CONTENT">CONTENT</span>
          <span class="neon-text">SYNTHESIZER</span>
        </h1>
        <div class="header-status">
          <div class="ai-status">
            <div class="status-indicator active"></div>
            <span class="status-text">AI ENHANCEMENT ONLINE</span>
          </div>
          <div class="neural-link">
            <span class="link-strength">NEURAL LINK: 98%</span>
            <div class="signal-bars">
              <div class="bar active"></div>
              <div class="bar active"></div>
              <div class="bar active"></div>
              <div class="bar active"></div>
              <div class="bar"></div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Editor -->
    <div class="editor-layout">
      
      <!-- Left Panel - Upload Zone -->
      <div class="upload-panel">
        <div class="panel-header">
          <h3 class="panel-title neon-cyan">MEDIA UPLINK</h3>
          <div class="upload-stats">
            <span class="stat">{{ mediaFiles.length }}/10 FILES</span>
          </div>
        </div>
        
        <div class="upload-zone" 
             :class="{ 'drag-over': isDragOver, 'has-files': mediaFiles.length > 0 }"
             @dragover.prevent="isDragOver = true"
             @dragleave.prevent="isDragOver = false"
             @drop.prevent="handleFileDrop">
          
          <div v-if="mediaFiles.length === 0" class="upload-prompt">
            <div class="upload-icon">
              <div class="hologram-cube"></div>
            </div>
            <h4 class="upload-title">INITIATE MEDIA TRANSFER</h4>
            <p class="upload-description">
              Drag and drop files into the neural interface<br>
              or click to manually select media files
            </p>
            <button class="cyber-btn upload-btn" @click="triggerFileInput">
              <span class="btn-icon">⬆</span>
              SELECT FILES
            </button>
            <input 
              ref="fileInput" 
              type="file" 
              multiple 
              accept="image/*,video/*"
              @change="handleFileSelect"
              style="display: none;"
            >
          </div>
          
          <div v-else class="media-grid">
            <div 
              class="media-item"
              v-for="(file, index) in mediaFiles"
              :key="index"
              :class="{ selected: selectedMedia === index }"
              @click="selectMedia(index)"
            >
              <div class="media-preview">
                <img v-if="file.type.startsWith('image')" :src="file.preview" :alt="file.name">
                <video v-else-if="file.type.startsWith('video')" :src="file.preview" muted></video>
                <div class="media-overlay">
                  <div class="media-actions">
                    <button class="action-btn edit" @click.stop="editMedia(index)">
                      <span class="icon">✏️</span>
                    </button>
                    <button class="action-btn delete" @click.stop="removeMedia(index)">
                      <span class="icon">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="media-info">
                <span class="media-name">{{ file.name }}</span>
                <span class="media-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <div class="upload-progress" v-if="file.uploading">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: file.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ file.progress }}%</span>
              </div>
            </div>
            
            <div class="add-more-btn" @click="triggerFileInput">
              <div class="add-icon">+</div>
              <span class="add-text">ADD MORE</span>
            </div>
          </div>
        </div>
        
        <!-- AI Enhancement Tools -->
        <div class="ai-tools">
          <h4 class="tools-title">AI ENHANCEMENT PROTOCOLS</h4>
          <div class="enhancement-grid">
            <button class="enhancement-btn" @click="enhanceImage('auto')" :disabled="selectedMedia === null">
              <div class="enhancement-icon auto"></div>
              <span class="enhancement-name">AUTO ENHANCE</span>
            </button>
            <button class="enhancement-btn" @click="enhanceImage('color')" :disabled="selectedMedia === null">
              <div class="enhancement-icon color"></div>
              <span class="enhancement-name">COLOR BOOST</span>
            </button>
            <button class="enhancement-btn" @click="enhanceImage('sharpen')" :disabled="selectedMedia === null">
              <div class="enhancement-icon sharpen"></div>
              <span class="enhancement-name">NEURAL SHARPEN</span>
            </button>
            <button class="enhancement-btn" @click="enhanceImage('filter')" :disabled="selectedMedia === null">
              <div class="enhancement-icon filter"></div>
              <span class="enhancement-name">CYBER FILTER</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Center Panel - Content Editor -->
      <div class="content-panel">
        <div class="panel-header">
          <h3 class="panel-title neon-magenta">CONTENT MATRIX</h3>
          <div class="editor-mode">
            <button 
              class="mode-btn"
              :class="{ active: editorMode === 'visual' }"
              @click="editorMode = 'visual'"
            >
              VISUAL
            </button>
            <button 
              class="mode-btn"
              :class="{ active: editorMode === 'code' }"
              @click="editorMode = 'code'"
            >
              CODE
            </button>
          </div>
        </div>
        
        <div class="content-editor">
          <!-- Visual Editor -->
          <div v-if="editorMode === 'visual'" class="visual-editor">
            <div class="caption-editor">
              <label class="editor-label">NEURAL CAPTION</label>
              <textarea 
                class="caption-input"
                v-model="postContent.caption"
                placeholder="Enter your message to the matrix..."
                @input="updateCharacterCount"
              ></textarea>
              <div class="caption-stats">
                <span class="char-count" :class="{ warning: characterCount > 2000 }">
                  {{ characterCount }}/2200 CHARACTERS
                </span>
                <button class="ai-suggest-btn" @click="generateAICaption">
                  <span class="ai-icon">🤖</span>
                  AI SUGGEST
                </button>
              </div>
            </div>
            
            <div class="hashtag-editor">
              <label class="editor-label">HASHTAG MATRIX</label>
              <div class="hashtag-input-container">
                <input 
                  type="text"
                  class="hashtag-input"
                  v-model="currentHashtag"
                  placeholder="Enter hashtag..."
                  @keyup.enter="addHashtag"
                  @keyup.space="addHashtag"
                >
                <button class="add-hashtag-btn" @click="addHashtag">ADD</button>
              </div>
              <div class="hashtag-list">
                <div 
                  class="hashtag-tag"
                  v-for="(tag, index) in postContent.hashtags"
                  :key="index"
                >
                  <span class="tag-text">#{{ tag }}</span>
                  <button class="tag-remove" @click="removeHashtag(index)">×</button>
                </div>
              </div>
              <div class="hashtag-suggestions">
                <h5 class="suggestions-title">AI RECOMMENDATIONS</h5>
                <div class="suggestion-tags">
                  <button 
                    class="suggestion-tag"
                    v-for="suggestion in aiSuggestions"
                    :key="suggestion"
                    @click="addSuggestedHashtag(suggestion)"
                  >
                    #{{ suggestion }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Code Editor -->
          <div v-if="editorMode === 'code'" class="code-editor">
            <div class="code-header">
              <span class="file-name">post_content.json</span>
              <div class="code-actions">
                <button class="code-btn format" @click="formatCode">FORMAT</button>
                <button class="code-btn validate" @click="validateCode">VALIDATE</button>
              </div>
            </div>
            <textarea 
              class="code-input"
              v-model="codeContent"
              spellcheck="false"
              @input="updateCodeContent"
            ></textarea>
            <div class="code-footer">
              <span class="syntax-status" :class="{ error: syntaxError }">
                {{ syntaxError || 'SYNTAX: VALID' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Preview & Settings -->
      <div class="preview-panel">
        <div class="panel-header">
          <h3 class="panel-title neon-green">INSTAGRAM PREVIEW</h3>
          <div class="preview-controls">
            <button 
              class="preview-mode"
              :class="{ active: previewMode === 'feed' }"
              @click="previewMode = 'feed'"
            >
              FEED
            </button>
            <button 
              class="preview-mode"
              :class="{ active: previewMode === 'story' }"
              @click="previewMode = 'story'"
            >
              STORY
            </button>
          </div>
        </div>
        
        <!-- Instagram Feed Preview -->
        <div v-if="previewMode === 'feed'" class="instagram-preview">
          <div class="instagram-post">
            <div class="post-header">
              <div class="profile-info">
                <div class="profile-avatar">
                  <img src="https://picsum.photos/32/32?random=user" alt="Profile">
                </div>
                <div class="profile-details">
                  <span class="username">neural_creator</span>
                  <span class="location">The Matrix</span>
                </div>
              </div>
              <button class="more-options">⋯</button>
            </div>
            
            <div class="post-media" v-if="selectedMedia !== null && mediaFiles[selectedMedia]">
              <img 
                v-if="mediaFiles[selectedMedia].type.startsWith('image')"
                :src="mediaFiles[selectedMedia].preview" 
                alt="Post media"
              >
              <video 
                v-else-if="mediaFiles[selectedMedia].type.startsWith('video')"
                :src="mediaFiles[selectedMedia].preview"
                controls
                muted
              >
              </video>
            </div>
            <div v-else class="post-media placeholder">
              <div class="placeholder-content">
                <span class="placeholder-icon">📷</span>
                <span class="placeholder-text">Select media to preview</span>
              </div>
            </div>
            
            <div class="post-actions">
              <div class="action-buttons">
                <button class="action-btn like">♥</button>
                <button class="action-btn comment">💬</button>
                <button class="action-btn share">📤</button>
              </div>
              <button class="action-btn bookmark">🔖</button>
            </div>
            
            <div class="post-content">
              <div class="likes-count">1,337 likes</div>
              <div class="caption-preview">
                <span class="username">neural_creator</span>
                <span class="caption-text">{{ postContent.caption || 'Your caption will appear here...' }}</span>
              </div>
              <div class="hashtags-preview" v-if="postContent.hashtags.length > 0">
                <span 
                  class="hashtag"
                  v-for="tag in postContent.hashtags"
                  :key="tag"
                >
                  #{{ tag }}
                </span>
              </div>
              <div class="post-time">2 HOURS AGO</div>
            </div>
          </div>
        </div>
        
        <!-- Publishing Settings -->
        <div class="publishing-settings">
          <h4 class="settings-title">PUBLISHING PROTOCOL</h4>
          
          <div class="setting-group">
            <label class="setting-label">TARGET ACCOUNT</label>
            <select class="cyber-select" v-model="publishSettings.accountId">
              <option value="">Select Account</option>
              <option value="1">@neural_creator</option>
              <option value="2">@tech_ninja</option>
              <option value="3">@cyber_life</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label class="setting-label">SCHEDULING MODE</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" value="now" v-model="publishSettings.schedule">
                <span class="radio-label">PUBLISH NOW</span>
              </label>
              <label class="radio-option">
                <input type="radio" value="later" v-model="publishSettings.schedule">
                <span class="radio-label">SCHEDULE</span>
              </label>
              <label class="radio-option">
                <input type="radio" value="auto" v-model="publishSettings.schedule">
                <span class="radio-label">AI OPTIMAL</span>
              </label>
            </div>
          </div>
          
          <div v-if="publishSettings.schedule === 'later'" class="setting-group">
            <label class="setting-label">EXECUTION TIME</label>
            <div class="datetime-inputs">
              <input 
                type="date" 
                class="cyber-input small"
                v-model="publishSettings.date"
              >
              <input 
                type="time" 
                class="cyber-input small"
                v-model="publishSettings.time"
              >
            </div>
          </div>
          
          <div class="setting-group">
            <label class="setting-label">ADVANCED OPTIONS</label>
            <div class="checkbox-group">
              <label class="checkbox-option">
                <input type="checkbox" v-model="publishSettings.aiEnhance">
                <span class="checkbox-label">AI ENHANCEMENT</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="publishSettings.autoHashtags">
                <span class="checkbox-label">AUTO HASHTAGS</span>
              </label>
              <label class="checkbox-option">
                <input type="checkbox" v-model="publishSettings.analytics">
                <span class="checkbox-label">NEURAL ANALYTICS</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="action-buttons-panel">
          <button class="cyber-btn secondary" @click="saveDraft">
            <span class="btn-icon">💾</span>
            SAVE DRAFT
          </button>
          <button class="cyber-btn primary" @click="publishPost" :disabled="!canPublish">
            <span class="btn-icon">🚀</span>
            {{ publishSettings.schedule === 'now' ? 'PUBLISH NOW' : 'SCHEDULE POST' }}
          </button>
        </div>
      </div>
    </div>

    <!-- AI Processing Overlay -->
    <div v-if="aiProcessing" class="ai-overlay">
      <div class="processing-content">
        <div class="processing-animation">
          <div class="neural-network">
            <div class="node" v-for="i in 12" :key="i"></div>
          </div>
        </div>
        <h3 class="processing-title">AI NEURAL PROCESSING</h3>
        <p class="processing-text">{{ processingMessage }}</p>
        <div class="processing-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
          </div>
          <span class="progress-percentage">{{ processingProgress }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Reactive data
const isDragOver = ref(false)
const selectedMedia = ref<number | null>(null)
const editorMode = ref<'visual' | 'code'>('visual')
const previewMode = ref<'feed' | 'story'>('feed')
const characterCount = ref(0)
const currentHashtag = ref('')
const syntaxError = ref('')
const aiProcessing = ref(false)
const processingProgress = ref(0)
const processingMessage = ref('Initializing neural networks...')

const fileInput = ref<HTMLInputElement>()

const mediaFiles = ref<any[]>([])

const postContent = ref({
  caption: '',
  hashtags: [] as string[]
})

const publishSettings = ref({
  accountId: '',
  schedule: 'now',
  date: '',
  time: '',
  aiEnhance: true,
  autoHashtags: true,
  analytics: true
})

const aiSuggestions = ref([
  'cyberpunk', 'neural', 'ai', 'tech', 'future', 'matrix', 'digital', 'innovation'
])

// Computed properties
const codeContent = computed({
  get: () => JSON.stringify({
    caption: postContent.value.caption,
    hashtags: postContent.value.hashtags,
    settings: publishSettings.value
  }, null, 2),
  set: (value: string) => {
    try {
      const parsed = JSON.parse(value)
      postContent.value.caption = parsed.caption || ''
      postContent.value.hashtags = parsed.hashtags || []
      syntaxError.value = ''
    } catch (error) {
      syntaxError.value = 'SYNTAX ERROR: INVALID JSON'
    }
  }
})

const canPublish = computed(() => {
  return publishSettings.value.accountId && 
         (postContent.value.caption || mediaFiles.value.length > 0)
})

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(Array.from(target.files))
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    handleFiles(Array.from(event.dataTransfer.files))
  }
}

const handleFiles = (files: File[]) => {
  files.forEach(file => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        mediaFiles.value.push({
          name: file.name,
          size: file.size,
          type: file.type,
          preview: e.target?.result,
          uploading: false,
          progress: 0
        })
        
        // Simulate upload process
        const fileIndex = mediaFiles.value.length - 1
        simulateUpload(fileIndex)
      }
      reader.readAsDataURL(file)
    }
  })
}

const simulateUpload = (index: number) => {
  mediaFiles.value[index].uploading = true
  const interval = setInterval(() => {
    mediaFiles.value[index].progress += Math.random() * 20
    if (mediaFiles.value[index].progress >= 100) {
      mediaFiles.value[index].progress = 100
      mediaFiles.value[index].uploading = false
      clearInterval(interval)
    }
  }, 200)
}

const selectMedia = (index: number) => {
  selectedMedia.value = index
}

const removeMedia = (index: number) => {
  mediaFiles.value.splice(index, 1)
  if (selectedMedia.value === index) {
    selectedMedia.value = null
  } else if (selectedMedia.value !== null && selectedMedia.value > index) {
    selectedMedia.value--
  }
}

const editMedia = (index: number) => {
  // Open media editor
  console.log('Edit media:', index)
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const updateCharacterCount = () => {
  characterCount.value = postContent.value.caption.length
}

const addHashtag = () => {
  const tag = currentHashtag.value.trim().replace('#', '')
  if (tag && !postContent.value.hashtags.includes(tag)) {
    postContent.value.hashtags.push(tag)
    currentHashtag.value = ''
  }
}

const removeHashtag = (index: number) => {
  postContent.value.hashtags.splice(index, 1)
}

const addSuggestedHashtag = (tag: string) => {
  if (!postContent.value.hashtags.includes(tag)) {
    postContent.value.hashtags.push(tag)
  }
}

const generateAICaption = async () => {
  aiProcessing.value = true
  processingMessage.value = 'Analyzing neural patterns...'
  processingProgress.value = 0
  
  // Simulate AI processing
  const messages = [
    'Scanning visual data matrix...',
    'Processing semantic neural networks...',
    'Optimizing engagement algorithms...',
    'Generating caption synthesis...'
  ]
  
  for (let i = 0; i < messages.length; i++) {
    processingMessage.value = messages[i]
    processingProgress.value = ((i + 1) / messages.length) * 100
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Generated caption
  postContent.value.caption = 'Just dropped into the neural matrix 🤖✨ This AI-enhanced content is pushing the boundaries of digital creativity. The future is now, and we\'re coding it one post at a time! #DigitalRevolution'
  
  aiProcessing.value = false
  updateCharacterCount()
}

const enhanceImage = async (type: string) => {
  if (selectedMedia.value === null) return
  
  aiProcessing.value = true
  processingMessage.value = `Applying ${type.toUpperCase()} enhancement...`
  processingProgress.value = 0
  
  // Simulate enhancement process
  const interval = setInterval(() => {
    processingProgress.value += Math.random() * 15
    if (processingProgress.value >= 100) {
      processingProgress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        aiProcessing.value = false
      }, 500)
    }
  }, 200)
}

const formatCode = () => {
  // Format JSON code
  try {
    const parsed = JSON.parse(codeContent.value)
    codeContent.value = JSON.stringify(parsed, null, 2)
    syntaxError.value = ''
  } catch (error) {
    syntaxError.value = 'CANNOT FORMAT: SYNTAX ERROR'
  }
}

const validateCode = () => {
  try {
    JSON.parse(codeContent.value)
    syntaxError.value = 'VALIDATION: PASSED'
    setTimeout(() => {
      syntaxError.value = ''
    }, 3000)
  } catch (error) {
    syntaxError.value = 'VALIDATION: FAILED'
  }
}

const updateCodeContent = () => {
  // This is handled by the computed property
}

const saveDraft = () => {
  console.log('Saving draft...')
  // Save draft logic
}

const publishPost = async () => {
  aiProcessing.value = true
  processingMessage.value = 'Uploading to Instagram matrix...'
  processingProgress.value = 0
  
  // Simulate publishing process
  const interval = setInterval(() => {
    processingProgress.value += Math.random() * 10
    if (processingProgress.value >= 100) {
      processingProgress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        aiProcessing.value = false
        alert('Post published successfully!')
      }, 500)
    }
  }, 300)
}

onMounted(() => {
  // Initialize with current date/time
  const now = new Date()
  publishSettings.value.date = now.toISOString().split('T')[0]
  publishSettings.value.time = now.toTimeString().slice(0, 5)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

/* Base Styles */
.cyberpunk-creator {
  min-height: 100vh;
  background: #000;
  color: #00ffff;
  font-family: 'Orbitron', monospace;
  position: relative;
}

/* Effects */
.scanlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.02) 51%
  );
  background-size: 100% 3px;
  pointer-events: none;
  z-index: 1;
}

.hex-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    repeating-linear-gradient(30deg, transparent, transparent 10px, rgba(0, 255, 255, 0.05) 10px, rgba(0, 255, 255, 0.05) 20px),
    repeating-linear-gradient(-30deg, transparent, transparent 10px, rgba(255, 0, 255, 0.05) 10px, rgba(255, 0, 255, 0.05) 20px);
  pointer-events: none;
  z-index: 0;
}

/* Header */
.creator-header {
  position: relative;
  z-index: 2;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header-status {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff0040;
  animation: pulse 2s infinite;
}

.status-indicator.active {
  background: #00ff00;
}

.status-text {
  font-size: 0.9rem;
  color: rgba(0, 255, 255, 0.8);
}

.neural-link {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.link-strength {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

.signal-bars {
  display: flex;
  gap: 2px;
  align-items: end;
}

.bar {
  width: 4px;
  background: rgba(0, 255, 255, 0.3);
  border-radius: 2px;
}

.bar:nth-child(1) { height: 8px; }
.bar:nth-child(2) { height: 12px; }
.bar:nth-child(3) { height: 16px; }
.bar:nth-child(4) { height: 20px; }
.bar:nth-child(5) { height: 24px; }

.bar.active {
  background: #00ff00;
  box-shadow: 0 0 4px #00ff00;
}

/* Editor Layout */
.editor-layout {
  display: grid;
  grid-template-columns: 350px 1fr 400px;
  gap: 1rem;
  padding: 1rem;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* Panel Base */
.upload-panel,
.content-panel,
.preview-panel {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #00ffff;
  border-radius: 8px;
  overflow: hidden;
  height: fit-content;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

/* Upload Panel */
.upload-stats {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

.upload-zone {
  padding: 2rem;
  border: 2px dashed rgba(0, 255, 255, 0.3);
  margin: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-align: center;
}

.upload-zone.drag-over {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
}

.upload-zone.has-files {
  border-style: solid;
  border-color: #00ff00;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hologram-cube {
  width: 60px;
  height: 60px;
  border: 2px solid #00ffff;
  background: rgba(0, 255, 255, 0.1);
  animation: rotate3d 3s infinite linear;
  position: relative;
}

.hologram-cube::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  width: 60px;
  height: 60px;
  border: 2px solid rgba(0, 255, 255, 0.5);
  background: rgba(0, 255, 255, 0.05);
}

.upload-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #00ffff;
  margin: 0;
}

.upload-description {
  color: rgba(0, 255, 255, 0.7);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.cyber-btn {
  background: transparent;
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 0.75rem 1.5rem;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cyber-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.cyber-btn.primary {
  border-color: #ff00ff;
  color: #ff00ff;
}

.cyber-btn.primary:hover {
  background: rgba(255, 0, 255, 0.1);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
}

.cyber-btn.secondary {
  border-color: rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.7);
}

.cyber-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  margin-right: 0.5rem;
}

.upload-btn {
  margin-top: 1rem;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.media-item {
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.5);
}

.media-item:hover,
.media-item.selected {
  border-color: #ff00ff;
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
}

.media-preview {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.media-preview img,
.media-preview video {
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.media-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid #00ffff;
  color: #00ffff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(0, 255, 255, 0.3);
}

.action-btn.delete {
  border-color: #ff0040;
  color: #ff0040;
  background: rgba(255, 0, 64, 0.2);
}

.action-btn.delete:hover {
  background: rgba(255, 0, 64, 0.3);
}

.media-info {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.media-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #00ffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-size {
  font-size: 0.7rem;
  color: rgba(0, 255, 255, 0.6);
}

.upload-progress {
  padding: 0.5rem;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.7rem;
  color: rgba(0, 255, 255, 0.8);
}

.add-more-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: 2px dashed rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.3);
}

.add-more-btn:hover {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
}

.add-icon {
  font-size: 2rem;
  color: #00ffff;
  margin-bottom: 0.5rem;
}

.add-text {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  font-weight: 700;
}

/* AI Tools */
.ai-tools {
  padding: 1rem;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
}

.tools-title {
  font-size: 1rem;
  font-weight: 700;
  color: #00ffff;
  margin: 0 0 1rem 0;
}

.enhancement-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.enhancement-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: transparent;
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.enhancement-btn:hover:not(:disabled) {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
  color: #ff00ff;
}

.enhancement-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.enhancement-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: currentColor;
}

.enhancement-name {
  font-size: 0.7rem;
  font-weight: 700;
  text-align: center;
}

/* Content Panel */
.content-panel {
  min-height: 600px;
}

.editor-mode {
  display: flex;
  gap: 0.5rem;
}

.mode-btn {
  background: transparent;
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.7);
  padding: 0.25rem 0.75rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-btn.active {
  border-color: #ff00ff;
  color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
}

.content-editor {
  padding: 1rem;
}

/* Visual Editor */
.visual-editor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.caption-editor,
.hashtag-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.editor-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(0, 255, 255, 0.8);
}

.caption-input {
  width: 100%;
  min-height: 120px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 1rem;
  font-family: 'Orbitron', monospace;
  border-radius: 4px;
  resize: vertical;
  outline: none;
  transition: all 0.3s ease;
}

.caption-input:focus {
  border-color: #ff00ff;
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.3);
}

.caption-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

.char-count.warning {
  color: #ff0040;
}

.ai-suggest-btn {
  background: transparent;
  border: 1px solid #ff00ff;
  color: #ff00ff;
  padding: 0.5rem 1rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.ai-suggest-btn:hover {
  background: rgba(255, 0, 255, 0.1);
}

.ai-icon {
  margin-right: 0.5rem;
}

.hashtag-input-container {
  display: flex;
  gap: 0.5rem;
}

.hashtag-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.5rem;
  font-family: 'Orbitron', monospace;
  border-radius: 4px;
  outline: none;
}

.hashtag-input:focus {
  border-color: #ff00ff;
}

.add-hashtag-btn {
  background: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.5rem 1rem;
  font-family: 'Orbitron', monospace;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.add-hashtag-btn:hover {
  background: rgba(0, 255, 255, 0.1);
}

.hashtag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hashtag-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid #00ffff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.tag-text {
  color: #00ffff;
}

.tag-remove {
  background: transparent;
  border: none;
  color: rgba(0, 255, 255, 0.7);
  cursor: pointer;
  font-size: 1rem;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-remove:hover {
  color: #ff0040;
}

.hashtag-suggestions {
  margin-top: 1rem;
}

.suggestions-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(0, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.suggestion-tag {
  background: transparent;
  border: 1px solid rgba(255, 0, 255, 0.5);
  color: rgba(255, 0, 255, 0.8);
  padding: 0.25rem 0.5rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.suggestion-tag:hover {
  background: rgba(255, 0, 255, 0.1);
  color: #ff00ff;
}

/* Code Editor */
.code-editor {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.file-name {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  font-family: 'Courier New', monospace;
}

.code-actions {
  display: flex;
  gap: 0.5rem;
}

.code-btn {
  background: transparent;
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.7);
  padding: 0.25rem 0.5rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.code-btn:hover {
  border-color: #00ffff;
  color: #00ffff;
}

.code-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  color: #00ffff;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  outline: none;
  resize: none;
  line-height: 1.4;
}

.code-footer {
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(0, 255, 255, 0.3);
}

.syntax-status {
  font-size: 0.8rem;
  color: #00ff00;
}

.syntax-status.error {
  color: #ff0040;
}

/* Preview Panel */
.preview-controls {
  display: flex;
  gap: 0.5rem;
}

.preview-mode {
  background: transparent;
  border: 1px solid rgba(0, 255, 0, 0.5);
  color: rgba(0, 255, 0, 0.7);
  padding: 0.25rem 0.75rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-mode.active {
  border-color: #00ff00;
  color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
}

/* Instagram Preview */
.instagram-preview {
  padding: 1rem;
}

.instagram-post {
  background: #fff;
  color: #000;
  border-radius: 8px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.profile-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  font-size: 0.9rem;
}

.location {
  font-size: 0.8rem;
  color: #666;
}

.more-options {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.post-media {
  width: 100%;
  aspect-ratio: 1;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-media img,
.post-media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-media.placeholder {
  background: #f8f8f8;
  color: #999;
  flex-direction: column;
  gap: 0.5rem;
}

.placeholder-icon {
  font-size: 2rem;
}

.placeholder-text {
  font-size: 0.9rem;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.post-content {
  padding: 0 1rem 1rem;
}

.likes-count {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.caption-preview {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.caption-preview .username {
  font-weight: 600;
  margin-right: 0.5rem;
}

.caption-text {
  color: #000;
}

.hashtags-preview {
  color: #0095f6;
  margin-bottom: 0.5rem;
}

.hashtag {
  margin-right: 0.5rem;
}

.post-time {
  color: #8e8e8e;
  font-size: 0.8rem;
  text-transform: uppercase;
}

/* Publishing Settings */
.publishing-settings {
  padding: 1rem;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
}

.settings-title {
  font-size: 1rem;
  font-weight: 700;
  color: #00ffff;
  margin: 0 0 1rem 0;
}

.setting-group {
  margin-bottom: 1rem;
}

.setting-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.cyber-select {
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.5rem;
  font-family: 'Orbitron', monospace;
  border-radius: 4px;
  outline: none;
}

.cyber-select:focus {
  border-color: #ff00ff;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-option input,
.checkbox-option input {
  accent-color: #00ffff;
}

.radio-label,
.checkbox-label {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.8);
}

.datetime-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.cyber-input {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.5rem;
  font-family: 'Orbitron', monospace;
  border-radius: 4px;
  outline: none;
}

.cyber-input:focus {
  border-color: #ff00ff;
}

.cyber-input.small {
  padding: 0.4rem;
  font-size: 0.9rem;
}

/* Action Buttons Panel */
.action-buttons-panel {
  padding: 1rem;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

/* AI Processing Overlay */
.ai-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.processing-content {
  text-align: center;
  padding: 2rem;
  border: 1px solid #00ffff;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.95);
  max-width: 400px;
}

.processing-animation {
  margin-bottom: 2rem;
}

.neural-network {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.node {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #00ffff;
  border-radius: 50%;
  animation: neural-pulse 2s infinite;
}

.node:nth-child(1) { top: 50%; left: 50%; animation-delay: 0s; }
.node:nth-child(2) { top: 20%; left: 30%; animation-delay: 0.2s; }
.node:nth-child(3) { top: 20%; left: 70%; animation-delay: 0.4s; }
.node:nth-child(4) { top: 80%; left: 30%; animation-delay: 0.6s; }
.node:nth-child(5) { top: 80%; left: 70%; animation-delay: 0.8s; }
.node:nth-child(6) { top: 35%; left: 10%; animation-delay: 1s; }
.node:nth-child(7) { top: 35%; left: 90%; animation-delay: 1.2s; }
.node:nth-child(8) { top: 65%; left: 10%; animation-delay: 1.4s; }
.node:nth-child(9) { top: 65%; left: 90%; animation-delay: 1.6s; }
.node:nth-child(10) { top: 10%; left: 50%; animation-delay: 1.8s; }
.node:nth-child(11) { top: 90%; left: 50%; animation-delay: 2s; }
.node:nth-child(12) { top: 50%; left: 0%; animation-delay: 2.2s; }

.processing-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00ffff;
  margin: 0 0 1rem 0;
}

.processing-text {
  color: rgba(0, 255, 255, 0.8);
  margin: 0 0 1.5rem 0;
}

.processing-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.processing-progress .progress-bar {
  height: 8px;
  border-radius: 4px;
}

.progress-percentage {
  font-size: 0.9rem;
  color: #00ffff;
  font-weight: 700;
}

/* Neon Effects */
.neon-text {
  text-shadow: 
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 20px currentColor;
}

.neon-cyan {
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
}

.neon-magenta {
  color: #ff00ff;
  text-shadow: 0 0 10px #ff00ff;
}

.neon-green {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
}

/* Glitch Effect */
.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.glitch-text:hover::before {
  animation: glitch-1 0.2s infinite;
  color: #ff00ff;
  opacity: 0.8;
}

.glitch-text:hover::after {
  animation: glitch-2 0.2s infinite;
  color: #00ff00;
  opacity: 0.8;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes rotate3d {
  0% { transform: rotateY(0deg) rotateX(0deg); }
  50% { transform: rotateY(180deg) rotateX(90deg); }
  100% { transform: rotateY(360deg) rotateX(0deg); }
}

@keyframes neural-pulse {
  0%, 100% { 
    box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff; 
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff; 
    transform: scale(1.2);
  }
}

@keyframes glitch-1 {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes glitch-2 {
  0% { transform: translate(0); }
  20% { transform: translate(2px, -2px); }
  40% { transform: translate(2px, 2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(-2px, 2px); }
  100% { transform: translate(0); }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .editor-layout {
    grid-template-columns: 300px 1fr 350px;
  }
}

@media (max-width: 768px) {
  .editor-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .media-grid {
    grid-template-columns: 1fr;
  }
  
  .enhancement-grid {
    grid-template-columns: 1fr;
  }
  
  .datetime-inputs {
    grid-template-columns: 1fr;
  }
  
  .action-buttons-panel {
    flex-direction: column;
  }
}
</style>