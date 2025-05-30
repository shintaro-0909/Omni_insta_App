<template>
  <div class="minimalist-post-creator">
    <!-- Header -->
    <header class="header">
      <h1 class="page-title">Create Post</h1>
      <button class="close-button">×</button>
    </header>

    <!-- Main Layout -->
    <div class="creator-layout">
      <!-- Media Preview -->
      <div class="preview-section">
        <div class="media-preview" v-if="!hasMedia">
          <div class="upload-area">
            <div class="upload-icon">□</div>
            <p class="upload-text">Drop image or video here</p>
            <button class="upload-button">Choose File</button>
          </div>
        </div>
        <div class="media-preview has-media" v-else>
          <img src="data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%23f8f9fa'/%3E%3C/svg%3E" alt="Preview">
          <button class="remove-media">×</button>
        </div>

        <!-- Instagram Preview -->
        <div class="instagram-preview">
          <div class="preview-header">
            <div class="preview-avatar">●</div>
            <div class="preview-username">@myaccount</div>
          </div>
          <div class="preview-content">
            <div class="preview-image">□</div>
            <div class="preview-caption">{{ caption || 'Your caption will appear here...' }}</div>
          </div>
        </div>
      </div>

      <!-- Content Form -->
      <div class="content-section">
        <!-- Caption -->
        <div class="form-section">
          <label class="form-label">Caption</label>
          <textarea 
            v-model="caption"
            class="caption-input" 
            placeholder="Write a caption..."
            rows="6"
          ></textarea>
          <div class="caption-footer">
            <span class="char-count">{{ caption.length }}/2200</span>
          </div>
        </div>

        <!-- Hashtags -->
        <div class="form-section">
          <label class="form-label">Hashtags</label>
          <div class="hashtag-input-container">
            <input 
              type="text" 
              class="hashtag-input" 
              placeholder="Add hashtags..."
              @keypress.enter="addHashtag"
            >
          </div>
          <div class="hashtag-list">
            <span class="hashtag" v-for="tag in hashtags" :key="tag">
              {{ tag }}
              <button class="hashtag-remove">×</button>
            </span>
          </div>
        </div>

        <!-- Account Selection -->
        <div class="form-section">
          <label class="form-label">Post to Accounts</label>
          <div class="account-list">
            <label class="account-option" v-for="account in accounts" :key="account.id">
              <input type="checkbox" class="account-checkbox">
              <span class="account-name">{{ account.name }}</span>
            </label>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button class="action-button secondary">Save as Draft</button>
          <button class="action-button primary">Schedule Post</button>
        </div>

        <!-- Progress -->
        <div class="upload-progress" v-if="uploading">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <span class="progress-text">Uploading... {{ uploadProgress }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const hasMedia = ref(true)
const caption = ref('')
const hashtags = ref(['#minimalist', '#design', '#instagram'])
const uploading = ref(false)
const uploadProgress = ref(0)

const accounts = [
  { id: 1, name: '@myaccount' },
  { id: 2, name: '@business' },
  { id: 3, name: '@personal' }
]

const addHashtag = (event) => {
  const value = event.target.value.trim()
  if (value) {
    hashtags.value.push(value.startsWith('#') ? value : `#${value}`)
    event.target.value = ''
  }
}
</script>

<style scoped>
/* Base */
.minimalist-post-creator {
  min-height: 100vh;
  background: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #000;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: -0.02em;
}

.close-button {
  width: 40px;
  height: 40px;
  border: 1px solid #e9ecef;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  border-color: #000;
}

/* Layout */
.creator-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 81px);
}

/* Preview Section */
.preview-section {
  padding: 4rem;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.media-preview {
  aspect-ratio: 1;
  border: 1px solid #e9ecef;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area {
  text-align: center;
  padding: 3rem;
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.upload-text {
  color: #666;
  margin-bottom: 2rem;
}

.upload-button {
  padding: 0.75rem 2rem;
  border: 1px solid #e9ecef;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-button:hover {
  border-color: #000;
}

.media-preview.has-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-media {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e9ecef;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-media:hover {
  background: #fff;
  border-color: #000;
}

/* Instagram Preview */
.instagram-preview {
  border: 1px solid #e9ecef;
  background: #f8f9fa;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background: #fff;
}

.preview-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-username {
  font-size: 0.875rem;
  font-weight: 500;
}

.preview-content {
  background: #fff;
}

.preview-image {
  aspect-ratio: 1;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #e9ecef;
}

.preview-caption {
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #666;
  min-height: 60px;
}

/* Content Section */
.content-section {
  padding: 4rem;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 3rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Caption Input */
.caption-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e9ecef;
  background: transparent;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: none;
  transition: border-color 0.2s ease;
}

.caption-input:focus {
  outline: none;
  border-color: #000;
}

.caption-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.char-count {
  font-size: 0.875rem;
  color: #666;
}

/* Hashtags */
.hashtag-input-container {
  margin-bottom: 1rem;
}

.hashtag-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  background: transparent;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.hashtag-input:focus {
  outline: none;
  border-color: #000;
}

.hashtag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hashtag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  font-size: 0.875rem;
}

.hashtag-remove {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.hashtag-remove:hover {
  opacity: 1;
}

/* Account Selection */
.account-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.account-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #000;
}

.account-name {
  font-size: 0.95rem;
}

/* Actions */
.actions {
  display: flex;
  gap: 1rem;
  margin-top: 4rem;
}

.action-button {
  flex: 1;
  padding: 1rem;
  border: 1px solid #e9ecef;
  background: transparent;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-button.primary {
  background: #000;
  color: #fff;
  border-color: #000;
}

.action-button.primary:hover {
  background: #222;
  border-color: #222;
}

/* Upload Progress */
.upload-progress {
  margin-top: 2rem;
}

.progress-bar {
  height: 2px;
  background: #e9ecef;
  margin-bottom: 0.5rem;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #000;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #666;
}

/* Responsive */
@media (max-width: 1024px) {
  .creator-layout {
    grid-template-columns: 1fr;
  }

  .preview-section {
    border-right: none;
    border-bottom: 1px solid #e9ecef;
    padding: 2rem;
  }

  .content-section {
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .instagram-preview {
    display: none;
  }
}
</style>