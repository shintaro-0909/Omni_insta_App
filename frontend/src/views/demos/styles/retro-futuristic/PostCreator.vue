<template>
  <div class="retro-creator">
    <!-- Background -->
    <div class="synthwave-bg">
      <div class="sun-grid"></div>
      <div class="horizon-glow"></div>
      <div class="vhs-static"></div>
    </div>

    <!-- Header -->
    <header class="creator-header">
      <h1 class="page-title">
        <span class="glitch-text" data-text="CONTENT">CONTENT</span>
        <span class="divider">://</span>
        <span class="glitch-text" data-text="SYNTHESIZER">SYNTHESIZER</span>
      </h1>
    </header>

    <!-- Main Content -->
    <main class="creator-main">
      <!-- Media Upload Section -->
      <section class="upload-section">
        <div class="section-header">
          <h2>MEDIA UPLINK</h2>
          <div class="status-indicator">
            <span class="status-text">READY</span>
            <span class="status-light"></span>
          </div>
        </div>

        <div class="upload-zone" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
          <div class="upload-content" v-if="!uploadedMedia">
            <div class="upload-icon">⬆</div>
            <p class="upload-text">DROP FILES TO UPLOAD</p>
            <p class="upload-subtext">OR CLICK TO BROWSE</p>
            <input type="file" class="file-input" @change="handleFileSelect" multiple accept="image/*,video/*">
          </div>

          <div class="media-preview" v-else>
            <div class="preview-container" v-for="(media, index) in uploadedMedia" :key="index">
              <img v-if="media.type === 'image'" :src="media.url" alt="Preview">
              <video v-else :src="media.url" controls></video>
              <button class="remove-media" @click="removeMedia(index)">✕</button>
              <div class="preview-scanlines"></div>
            </div>
          </div>
        </div>

        <!-- VHS Progress Bar -->
        <div class="vhs-progress" v-if="uploadProgress > 0">
          <div class="progress-label">UPLOADING... {{ uploadProgress }}%</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="`width: ${uploadProgress}%`"></div>
            <div class="progress-glow"></div>
          </div>
        </div>
      </section>

      <!-- Content Editor -->
      <section class="editor-section">
        <div class="editor-container">
          <div class="editor-toolbar">
            <button 
              class="tool-btn" 
              v-for="tool in editorTools" 
              :key="tool.id"
              @click="applyTool(tool.action)"
              :title="tool.name"
            >
              {{ tool.icon }}
            </button>
          </div>

          <div class="content-editor">
            <textarea 
              v-model="postContent" 
              placeholder="ENTER YOUR MESSAGE TO THE DIGITAL REALM..."
              class="retro-editor"
              @input="updateCharCount"
            ></textarea>
            <div class="char-counter" :class="{ warning: charCount > 2000 }">
              {{ charCount }}/2200
            </div>
          </div>

          <!-- Hashtag Suggestions -->
          <div class="hashtag-section">
            <h3>NEURAL HASHTAGS</h3>
            <div class="hashtag-grid">
              <button 
                class="hashtag-chip" 
                v-for="tag in suggestedTags" 
                :key="tag"
                @click="addHashtag(tag)"
              >
                #{{ tag }}
                <span class="tag-glow"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Preview Panel -->
        <div class="preview-panel">
          <h3>HOLOGRAPHIC PREVIEW</h3>
          <div class="phone-mockup">
            <div class="phone-screen">
              <div class="instagram-post">
                <div class="post-header">
                  <div class="user-avatar"></div>
                  <span class="username">cyber_user</span>
                </div>
                <div class="post-media" v-if="uploadedMedia && uploadedMedia.length > 0">
                  <img v-if="uploadedMedia[0].type === 'image'" :src="uploadedMedia[0].url" alt="Post preview">
                  <video v-else :src="uploadedMedia[0].url"></video>
                </div>
                <div class="post-content">
                  <p>{{ postContent || 'Your content will appear here...' }}</p>
                </div>
              </div>
              <div class="phone-glitch"></div>
            </div>
            <div class="phone-reflection"></div>
          </div>
        </div>
      </section>

      <!-- Publishing Options -->
      <section class="publish-section">
        <h2>TRANSMISSION PARAMETERS</h2>
        
        <div class="publish-grid">
          <div class="option-card">
            <h3>TARGET ACCOUNTS</h3>
            <div class="account-list">
              <label class="account-item" v-for="account in accounts" :key="account.id">
                <input type="checkbox" v-model="selectedAccounts" :value="account.id">
                <span class="account-name">@{{ account.username }}</span>
                <span class="account-status">ONLINE</span>
              </label>
            </div>
          </div>

          <div class="option-card">
            <h3>POST TIMING</h3>
            <div class="timing-options">
              <button 
                class="timing-btn" 
                :class="{ active: postTiming === 'now' }"
                @click="postTiming = 'now'"
              >
                <span class="btn-icon">⚡</span>
                POST NOW
              </button>
              <button 
                class="timing-btn" 
                :class="{ active: postTiming === 'schedule' }"
                @click="postTiming = 'schedule'"
              >
                <span class="btn-icon">🕐</span>
                SCHEDULE
              </button>
            </div>
            
            <div class="schedule-input" v-if="postTiming === 'schedule'">
              <input type="datetime-local" v-model="scheduleTime" class="retro-input">
            </div>
          </div>

          <div class="option-card">
            <h3>ADVANCED OPTIONS</h3>
            <div class="advanced-options">
              <label class="option-toggle">
                <input type="checkbox" v-model="options.firstComment">
                <span>Add First Comment</span>
              </label>
              <label class="option-toggle">
                <input type="checkbox" v-model="options.location">
                <span>Tag Location</span>
              </label>
              <label class="option-toggle">
                <input type="checkbox" v-model="options.altText">
                <span>Alt Text</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="action-btn draft">
            <span>SAVE DRAFT</span>
            <div class="btn-line"></div>
          </button>
          <button class="action-btn publish" @click="publishPost">
            <span>INITIALIZE TRANSMISSION</span>
            <div class="btn-pulse"></div>
            <div class="btn-glow"></div>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Data
const uploadedMedia = ref<any[]>([])
const uploadProgress = ref(0)
const postContent = ref('')
const charCount = ref(0)
const selectedAccounts = ref<string[]>([])
const postTiming = ref('now')
const scheduleTime = ref('')

const options = ref({
  firstComment: false,
  location: false,
  altText: false
})

// Editor Tools
const editorTools = ref([
  { id: 1, name: 'Bold', icon: 'B', action: 'bold' },
  { id: 2, name: 'Italic', icon: 'I', action: 'italic' },
  { id: 3, name: 'Emoji', icon: '😎', action: 'emoji' },
  { id: 4, name: 'Link', icon: '🔗', action: 'link' },
  { id: 5, name: 'Magic', icon: '✨', action: 'magic' }
])

// Suggested Hashtags
const suggestedTags = ref([
  'cyberpunk', 'retrowave', 'synthwave', 'aesthetic',
  'vaporwave', 'neon', 'futuretech', 'digitalnomad'
])

// Mock Accounts
const accounts = ref([
  { id: '1', username: 'cyber_main' },
  { id: '2', username: 'tech_vibes' },
  { id: '3', username: 'retro_daily' }
])

// Methods
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer?.files || [])
  processFiles(files)
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processFiles(files)
}

const processFiles = (files: File[]) => {
  // Simulate upload with progress
  uploadProgress.value = 0
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      uploadProgress.value = 0
      
      // Add files to media array
      files.forEach(file => {
        const url = URL.createObjectURL(file)
        const type = file.type.startsWith('image/') ? 'image' : 'video'
        uploadedMedia.value.push({ url, type, file })
      })
    }
  }, 100)
}

const removeMedia = (index: number) => {
  uploadedMedia.value.splice(index, 1)
}

const updateCharCount = () => {
  charCount.value = postContent.value.length
}

const applyTool = (action: string) => {
  // Tool actions implementation
  console.log('Applying tool:', action)
}

const addHashtag = (tag: string) => {
  postContent.value += ` #${tag}`
  updateCharCount()
}

const publishPost = () => {
  // Publish post logic
  console.log('Publishing post...')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

/* Base */
.retro-creator {
  position: relative;
  min-height: 100vh;
  background: #0a0a0f;
  color: #fff;
  font-family: 'Share Tech Mono', monospace;
  overflow-x: hidden;
}

/* Synthwave Background */
.synthwave-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.sun-grid {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: 
    linear-gradient(180deg, #0a0a0f 0%, #1a0033 50%, #ff006e 100%);
}

.sun-grid::before {
  content: '';
  position: absolute;
  bottom: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #ffbe0b, #ff4500);
  border-radius: 50%;
  filter: blur(0);
  animation: sun-pulse 4s ease-in-out infinite;
}

.sun-grid::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background-image: 
    linear-gradient(rgba(255, 0, 110, 0.3) 2px, transparent 2px),
    linear-gradient(90deg, rgba(255, 0, 110, 0.3) 2px, transparent 2px);
  background-size: 100px 50px;
  transform: perspective(400px) rotateX(60deg);
  transform-origin: center bottom;
}

.horizon-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(0deg, rgba(255, 0, 110, 0.4), transparent);
  filter: blur(20px);
}

.vhs-static {
  position: absolute;
  inset: 0;
  opacity: 0.02;
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.03) 2px,
      rgba(255, 255, 255, 0.03) 4px
    );
  animation: static-move 0.5s steps(10) infinite;
}

/* Header */
.creator-header {
  position: relative;
  padding: 3rem 2rem;
  text-align: center;
  z-index: 10;
}

.page-title {
  font-family: 'Orbitron', monospace;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.glitch-text {
  position: relative;
  color: #ff006e;
  text-shadow: 
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 40px currentColor;
  animation: text-flicker 3s linear infinite;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.8;
}

.glitch-text::before {
  color: #3a86ff;
  animation: glitch-1 2s infinite;
  z-index: -1;
}

.glitch-text::after {
  color: #ffbe0b;
  animation: glitch-2 2s infinite;
  z-index: -2;
}

.divider {
  color: #8338ec;
  font-size: 0.8em;
}

/* Main Content */
.creator-main {
  position: relative;
  padding: 2rem;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
}

/* Upload Section */
.upload-section {
  margin-bottom: 4rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  color: #8338ec;
  text-shadow: 0 0 20px currentColor;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-text {
  color: #3a86ff;
  font-size: 0.9rem;
}

.status-light {
  width: 10px;
  height: 10px;
  background: #3a86ff;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
  animation: pulse-light 2s ease-in-out infinite;
}

.upload-zone {
  position: relative;
  min-height: 300px;
  background: rgba(26, 0, 51, 0.6);
  border: 2px dashed rgba(255, 0, 110, 0.5);
  transition: all 0.3s ease;
  overflow: hidden;
}

.upload-zone:hover {
  border-color: #ff006e;
  background: rgba(26, 0, 51, 0.8);
  box-shadow: 0 0 30px rgba(255, 0, 110, 0.3);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  cursor: pointer;
}

.upload-icon {
  font-size: 4rem;
  color: #ff006e;
  animation: float-up 3s ease-in-out infinite;
}

.upload-text {
  font-family: 'Orbitron', monospace;
  font-size: 1.2rem;
  color: #3a86ff;
  margin-top: 1rem;
}

.upload-subtext {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.media-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.preview-container {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(138, 43, 226, 0.5);
}

.preview-container img,
.preview-container video {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.remove-media {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 30px;
  height: 30px;
  background: rgba(255, 0, 110, 0.9);
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-media:hover {
  background: #ff006e;
  transform: rotate(90deg);
}

.preview-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
}

/* VHS Progress */
.vhs-progress {
  margin-top: 2rem;
}

.progress-label {
  font-family: 'Orbitron', monospace;
  color: #ffbe0b;
  margin-bottom: 0.5rem;
}

.progress-bar {
  position: relative;
  height: 20px;
  background: rgba(26, 0, 51, 0.8);
  border: 1px solid rgba(138, 43, 226, 0.5);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff006e, #8338ec, #3a86ff);
  transition: width 0.3s ease;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s linear infinite;
}

/* Editor Section */
.editor-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(26, 0, 51, 0.6);
  border: 1px solid rgba(138, 43, 226, 0.5);
}

.tool-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(255, 0, 110, 0.5);
  color: #ff006e;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-btn:hover {
  background: rgba(255, 0, 110, 0.2);
  border-color: #ff006e;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.5);
}

.content-editor {
  position: relative;
}

.retro-editor {
  width: 100%;
  min-height: 200px;
  padding: 1.5rem;
  background: rgba(26, 0, 51, 0.4);
  border: 1px solid rgba(138, 43, 226, 0.5);
  color: #fff;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;
}

.retro-editor:focus {
  outline: none;
  border-color: #ff006e;
  background: rgba(26, 0, 51, 0.6);
  box-shadow: 0 0 30px rgba(255, 0, 110, 0.3);
}

.char-counter {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  color: #3a86ff;
  font-size: 0.9rem;
}

.char-counter.warning {
  color: #ff006e;
  animation: blink-warning 1s ease-in-out infinite;
}

/* Hashtag Section */
.hashtag-section {
  margin-top: 1.5rem;
}

.hashtag-section h3 {
  font-family: 'Orbitron', monospace;
  color: #8338ec;
  margin-bottom: 1rem;
}

.hashtag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hashtag-chip {
  position: relative;
  padding: 0.5rem 1rem;
  background: rgba(138, 43, 226, 0.2);
  border: 1px solid rgba(138, 43, 226, 0.5);
  color: #8338ec;
  font-size: 0.9rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.hashtag-chip:hover {
  background: rgba(138, 43, 226, 0.4);
  border-color: #8338ec;
  color: #fff;
  transform: scale(1.05);
}

.tag-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(138, 43, 226, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hashtag-chip:hover .tag-glow {
  opacity: 1;
}

/* Preview Panel */
.preview-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-panel h3 {
  font-family: 'Orbitron', monospace;
  color: #ff006e;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px currentColor;
}

.phone-mockup {
  position: relative;
  width: 300px;
  height: 600px;
  background: #1a1a2e;
  border: 3px solid #ff006e;
  border-radius: 30px;
  padding: 1rem;
  box-shadow: 
    0 0 50px rgba(255, 0, 110, 0.5),
    inset 0 0 30px rgba(138, 43, 226, 0.2);
}

.phone-screen {
  position: relative;
  height: 100%;
  background: #0a0a0f;
  border-radius: 20px;
  overflow: hidden;
}

.instagram-post {
  padding: 1rem;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #ff006e, #8338ec);
  border-radius: 50%;
}

.username {
  font-weight: 700;
  color: #3a86ff;
}

.post-media {
  margin-bottom: 1rem;
}

.post-media img,
.post-media video {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 10px;
}

.post-content {
  font-size: 0.9rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
}

.phone-glitch {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 0, 110, 0.03) 2px,
    rgba(255, 0, 110, 0.03) 4px
  );
  pointer-events: none;
  animation: glitch-lines 5s linear infinite;
}

.phone-reflection {
  position: absolute;
  bottom: -50px;
  left: 0;
  right: 0;
  height: 50px;
  background: inherit;
  filter: blur(20px);
  opacity: 0.3;
  transform: scaleY(-1);
}

/* Publishing Options */
.publish-section {
  margin-bottom: 4rem;
}

.publish-section h2 {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  color: #ff006e;
  text-shadow: 0 0 20px currentColor;
  margin-bottom: 2rem;
}

.publish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.option-card {
  background: rgba(26, 0, 51, 0.6);
  border: 1px solid rgba(138, 43, 226, 0.5);
  padding: 2rem;
}

.option-card h3 {
  font-family: 'Orbitron', monospace;
  color: #8338ec;
  margin-bottom: 1.5rem;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.account-item input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #3a86ff;
  background: transparent;
  cursor: pointer;
  position: relative;
}

.account-item input[type="checkbox"]:checked {
  background: #3a86ff;
  box-shadow: 0 0 10px #3a86ff;
}

.account-item input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
}

.account-name {
  flex: 1;
  color: #fff;
}

.account-status {
  color: #3a86ff;
  font-size: 0.8rem;
}

.timing-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.timing-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: rgba(26, 0, 51, 0.4);
  border: 1px solid rgba(255, 0, 110, 0.3);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.timing-btn:hover,
.timing-btn.active {
  background: rgba(255, 0, 110, 0.2);
  border-color: #ff006e;
  color: #ff006e;
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.3);
}

.btn-icon {
  font-size: 1.5rem;
}

.schedule-input {
  margin-top: 1rem;
}

.retro-input {
  width: 100%;
  padding: 1rem;
  background: rgba(26, 0, 51, 0.4);
  border: 1px solid rgba(138, 43, 226, 0.5);
  color: #fff;
  font-family: 'Share Tech Mono', monospace;
}

.retro-input:focus {
  outline: none;
  border-color: #ff006e;
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.3);
}

.advanced-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-toggle {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.option-toggle input[type="checkbox"] {
  appearance: none;
  width: 40px;
  height: 20px;
  background: rgba(26, 0, 51, 0.8);
  border: 1px solid rgba(138, 43, 226, 0.5);
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-toggle input[type="checkbox"]::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: #8338ec;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.option-toggle input[type="checkbox"]:checked {
  background: rgba(255, 0, 110, 0.2);
  border-color: #ff006e;
}

.option-toggle input[type="checkbox"]:checked::after {
  left: 22px;
  background: #ff006e;
  box-shadow: 0 0 10px #ff006e;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.action-btn {
  position: relative;
  padding: 1.5rem 3rem;
  font-family: 'Orbitron', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  background: transparent;
  border: 2px solid;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.action-btn.draft {
  border-color: #8338ec;
  color: #8338ec;
}

.action-btn.publish {
  border-color: #ff006e;
  color: #ff006e;
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 40px currentColor;
}

.btn-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}

.action-btn:hover .btn-line {
  width: 100%;
}

.btn-pulse {
  position: absolute;
  inset: -2px;
  border: 2px solid currentColor;
  opacity: 0;
  animation: pulse-border 2s ease-out infinite;
}

.btn-glow {
  position: absolute;
  inset: -50%;
  background: radial-gradient(circle, currentColor, transparent);
  opacity: 0;
  filter: blur(20px);
  transition: opacity 0.3s ease;
}

.action-btn:hover .btn-glow {
  opacity: 0.3;
}

/* Animations */
@keyframes sun-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.1); }
}

@keyframes static-move {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

@keyframes text-flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.8; }
  94% { opacity: 1; }
}

@keyframes glitch-1 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}

@keyframes glitch-2 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(2px, -2px); }
  40% { transform: translate(2px, 2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(-2px, 2px); }
}

@keyframes pulse-light {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes float-up {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes blink-warning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glitch-lines {
  0%, 100% { transform: translateY(0); }
  20% { transform: translateY(-2px); }
  40% { transform: translateY(2px); }
  60% { transform: translateY(-1px); }
  80% { transform: translateY(1px); }
}

@keyframes pulse-border {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .editor-section {
    grid-template-columns: 1fr;
  }
  
  .preview-panel {
    order: -1;
    margin-bottom: 3rem;
  }
}

@media (max-width: 768px) {
  .page-title {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .publish-grid {
    grid-template-columns: 1fr;
  }
  
  .timing-options {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>