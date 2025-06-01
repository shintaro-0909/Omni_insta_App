<template>
  <div class="stylish-creator">
    <!-- Header -->
    <header class="creator-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">Content Creator</h1>
          <p class="page-subtitle">Craft experiences that captivate</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="saveDraft">Save Draft</button>
          <button class="btn-primary" @click="publishPost">Publish Now</button>
        </div>
      </div>
    </header>

    <div class="creator-layout">
      <!-- Content Panel -->
      <div class="content-panel">
        <!-- Media Section -->
        <section class="media-section">
          <div class="section-header">
            <h2 class="section-title">Visual Content</h2>
            <div class="media-controls">
              <button
                class="control-btn"
                :class="{ active: mediaType === 'image' }"
                @click="mediaType = 'image'"
              >
                📸 Image
              </button>
              <button
                class="control-btn"
                :class="{ active: mediaType === 'video' }"
                @click="mediaType = 'video'"
              >
                🎬 Video
              </button>
              <button
                class="control-btn"
                :class="{ active: mediaType === 'carousel' }"
                @click="mediaType = 'carousel'"
              >
                🎠 Carousel
              </button>
            </div>
          </div>

          <div
            class="media-upload-area"
            @click="triggerUpload"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <div v-if="!uploadedMedia.length" class="upload-placeholder">
              <div class="upload-icon">📁</div>
              <h3 class="upload-title">Drop your media here</h3>
              <p class="upload-description">
                Support for JPG, PNG, MP4 up to 50MB
              </p>
              <button class="upload-button">Choose Files</button>
            </div>

            <div v-else class="media-grid">
              <div
                v-for="(media, index) in uploadedMedia"
                :key="index"
                class="media-item"
                :class="{ active: selectedMediaIndex === index }"
                @click="selectedMediaIndex = index"
              >
                <div class="media-preview">
                  <img
                    v-if="media.type === 'image'"
                    :src="media.url"
                    :alt="media.name"
                  />
                  <video
                    v-else-if="media.type === 'video'"
                    :src="media.url"
                    muted
                  ></video>
                  <div class="media-overlay">
                    <button
                      class="overlay-btn edit"
                      @click.stop="editMedia(index)"
                    >
                      ✏️
                    </button>
                    <button
                      class="overlay-btn delete"
                      @click.stop="removeMedia(index)"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div class="media-info">
                  <span class="media-name">{{ media.name }}</span>
                  <span class="media-size">{{
                    formatFileSize(media.size)
                  }}</span>
                </div>
              </div>

              <div class="add-media-item" @click="triggerUpload">
                <div class="add-icon">+</div>
                <span class="add-text">Add More</span>
              </div>
            </div>
          </div>

          <!-- Media Editor -->
          <div v-if="uploadedMedia[selectedMediaIndex]" class="media-editor">
            <div class="editor-header">
              <h3 class="editor-title">Edit Media</h3>
              <div class="editor-tools">
                <button
                  class="tool-btn"
                  :class="{ active: activeTool === 'crop' }"
                  @click="activeTool = 'crop'"
                >
                  🔲 Crop
                </button>
                <button
                  class="tool-btn"
                  :class="{ active: activeTool === 'filter' }"
                  @click="activeTool = 'filter'"
                >
                  🎨 Filter
                </button>
                <button
                  class="tool-btn"
                  :class="{ active: activeTool === 'text' }"
                  @click="activeTool = 'text'"
                >
                  📝 Text
                </button>
              </div>
            </div>

            <div class="editor-content">
              <div v-if="activeTool === 'filter'" class="filter-panel">
                <div class="filter-grid">
                  <div
                    v-for="filter in filters"
                    :key="filter.name"
                    class="filter-item"
                    :class="{ active: selectedFilter === filter.name }"
                    @click="selectedFilter = filter.name"
                  >
                    <div class="filter-preview" :style="{ filter: filter.css }">
                      <div class="filter-sample"></div>
                    </div>
                    <span class="filter-name">{{ filter.name }}</span>
                  </div>
                </div>
              </div>

              <div v-if="activeTool === 'crop'" class="crop-panel">
                <div class="aspect-ratios">
                  <button
                    v-for="ratio in aspectRatios"
                    :key="ratio.name"
                    class="ratio-btn"
                    :class="{ active: selectedRatio === ratio.name }"
                    @click="selectedRatio = ratio.name"
                  >
                    {{ ratio.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Caption Section -->
        <section class="caption-section">
          <div class="section-header">
            <h2 class="section-title">Caption & Details</h2>
            <div class="caption-stats">
              <span class="char-count">{{ captionText.length }}/2200</span>
              <span class="hashtag-count">{{ hashtagCount }} hashtags</span>
            </div>
          </div>

          <div class="caption-editor">
            <textarea
              v-model="captionText"
              class="caption-textarea"
              placeholder="Write your caption here... ✨"
              @input="updateCaptionStats"
            ></textarea>

            <div class="caption-tools">
              <div class="tool-group">
                <button class="tool-btn-small" @click="insertEmoji">😀</button>
                <button class="tool-btn-small" @click="insertHashtag">#</button>
                <button class="tool-btn-small" @click="insertMention">@</button>
              </div>
              <div class="ai-tools">
                <button class="ai-btn" @click="generateCaption">
                  ✨ AI Generate
                </button>
                <button class="ai-btn" @click="improveCaption">
                  🚀 Enhance
                </button>
              </div>
            </div>
          </div>

          <!-- Hashtag Suggestions -->
          <div class="hashtag-suggestions">
            <h3 class="suggestions-title">Trending Hashtags</h3>
            <div class="hashtag-grid">
              <button
                v-for="hashtag in trendingHashtags"
                :key="hashtag.tag"
                class="hashtag-suggestion"
                @click="addHashtag(hashtag.tag)"
              >
                <span class="hashtag-text">{{ hashtag.tag }}</span>
                <span class="hashtag-uses">{{ hashtag.uses }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Advanced Settings -->
        <section class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Publishing Options</h2>
          </div>

          <div class="settings-grid">
            <div class="setting-group">
              <label class="setting-label">Account</label>
              <select v-model="selectedAccount" class="setting-select">
                <option
                  v-for="account in accounts"
                  :key="account.id"
                  :value="account.id"
                >
                  {{ account.name }} ({{ account.followers }})
                </option>
              </select>
            </div>

            <div class="setting-group">
              <label class="setting-label">Post Type</label>
              <select v-model="postType" class="setting-select">
                <option value="feed">Feed Post</option>
                <option value="story">Story</option>
                <option value="reel">Reel</option>
                <option value="igtv">IGTV</option>
              </select>
            </div>

            <div class="setting-group">
              <label class="setting-label">Schedule</label>
              <div class="schedule-options">
                <label class="radio-option">
                  <input type="radio" v-model="scheduleType" value="now" />
                  <span class="radio-custom"></span>
                  Publish Now
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="scheduleType" value="later" />
                  <span class="radio-custom"></span>
                  Schedule for Later
                </label>
              </div>
            </div>

            <div v-if="scheduleType === 'later'" class="setting-group">
              <label class="setting-label">Date & Time</label>
              <div class="datetime-inputs">
                <input
                  type="date"
                  v-model="scheduleDate"
                  class="datetime-input"
                />
                <input
                  type="time"
                  v-model="scheduleTime"
                  class="datetime-input"
                />
              </div>
            </div>
          </div>

          <!-- Advanced Options -->
          <div class="advanced-options">
            <details class="options-details">
              <summary class="options-summary">Advanced Options</summary>
              <div class="options-content">
                <div class="option-row">
                  <label class="toggle-option">
                    <input type="checkbox" v-model="disableComments" />
                    <span class="toggle-slider"></span>
                    Disable Comments
                  </label>
                  <label class="toggle-option">
                    <input type="checkbox" v-model="hideLikes" />
                    <span class="toggle-slider"></span>
                    Hide Like Count
                  </label>
                </div>
                <div class="option-row">
                  <label class="toggle-option">
                    <input type="checkbox" v-model="brandedContent" />
                    <span class="toggle-slider"></span>
                    Branded Content
                  </label>
                  <label class="toggle-option">
                    <input type="checkbox" v-model="autoDeleteStory" />
                    <span class="toggle-slider"></span>
                    Auto-delete Story (24h)
                  </label>
                </div>
              </div>
            </details>
          </div>
        </section>
      </div>

      <!-- Preview Panel -->
      <div class="preview-panel">
        <div class="preview-header">
          <h2 class="preview-title">Live Preview</h2>
          <div class="device-switcher">
            <button
              v-for="device in devices"
              :key="device"
              class="device-btn"
              :class="{ active: selectedDevice === device }"
              @click="selectedDevice = device"
            >
              {{ device }}
            </button>
          </div>
        </div>

        <div class="preview-container" :class="`device-${selectedDevice}`">
          <div class="phone-frame">
            <div class="phone-screen">
              <!-- Instagram Post Preview -->
              <div class="instagram-preview">
                <div class="post-header">
                  <div class="account-info">
                    <div class="account-avatar">
                      <img
                        :src="selectedAccountData?.avatar"
                        :alt="selectedAccountData?.name"
                      />
                    </div>
                    <div class="account-details">
                      <span class="account-name">{{
                        selectedAccountData?.name
                      }}</span>
                      <span class="post-location">📍 Location</span>
                    </div>
                  </div>
                  <button class="post-menu">⋯</button>
                </div>

                <div class="post-media">
                  <div v-if="uploadedMedia.length" class="media-container">
                    <img
                      v-if="uploadedMedia[0]?.type === 'image'"
                      :src="uploadedMedia[0]?.url"
                      alt="Post media"
                    />
                    <video
                      v-else-if="uploadedMedia[0]?.type === 'video'"
                      :src="uploadedMedia[0]?.url"
                      muted
                      autoplay
                      loop
                    ></video>

                    <div
                      v-if="uploadedMedia.length > 1"
                      class="carousel-indicator"
                    >
                      <div
                        v-for="(_, index) in uploadedMedia"
                        :key="index"
                        class="indicator-dot"
                        :class="{ active: index === 0 }"
                      ></div>
                    </div>
                  </div>
                  <div v-else class="media-placeholder">
                    <div class="placeholder-icon">📷</div>
                    <span class="placeholder-text"
                      >Add media to see preview</span
                    >
                  </div>
                </div>

                <div class="post-actions">
                  <div class="action-left">
                    <button class="action-btn">❤️</button>
                    <button class="action-btn">💬</button>
                    <button class="action-btn">📤</button>
                  </div>
                  <button class="action-btn bookmark">🔖</button>
                </div>

                <div class="post-engagement">
                  <div class="likes-count">1,234 likes</div>
                </div>

                <div class="post-caption">
                  <span class="caption-username">{{
                    selectedAccountData?.username
                  }}</span>
                  <span class="caption-text">{{
                    captionText || 'Your caption will appear here...'
                  }}</span>
                </div>

                <div class="post-comments">
                  <div class="comments-summary">View all 89 comments</div>
                  <div class="post-time">2 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Prediction -->
        <div class="performance-prediction">
          <h3 class="prediction-title">Performance Prediction</h3>
          <div class="prediction-metrics">
            <div class="metric-item">
              <div class="metric-value">{{ predictedLikes }}</div>
              <div class="metric-label">Est. Likes</div>
              <div class="metric-trend positive">+12%</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">{{ predictedComments }}</div>
              <div class="metric-label">Est. Comments</div>
              <div class="metric-trend positive">+8%</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">{{ predictedShares }}</div>
              <div class="metric-label">Est. Shares</div>
              <div class="metric-trend neutral">±2%</div>
            </div>
          </div>
          <div class="best-time">
            <span class="best-time-label">Best time to post:</span>
            <span class="best-time-value">Today at 6:30 PM</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Modal -->
    <div v-if="showProgressModal" class="modal-overlay">
      <div class="progress-modal">
        <div class="progress-header">
          <h3 class="progress-title">Publishing Your Content</h3>
        </div>
        <div class="progress-content">
          <div class="progress-steps">
            <div
              v-for="(step, index) in publishSteps"
              :key="index"
              class="progress-step"
              :class="{
                active: currentStep === index,
                completed: currentStep > index,
              }"
            >
              <div class="step-icon">
                <span v-if="currentStep > index">✓</span>
                <span v-else-if="currentStep === index" class="spinner"
                  >⏳</span
                >
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="step-text">{{ step }}</div>
            </div>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: `${(currentStep / (publishSteps.length - 1)) * 100}%`,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*,video/*"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';

  // Reactive data
  const mediaType = ref('image');
  const uploadedMedia = ref<any[]>([]);
  const selectedMediaIndex = ref(0);
  const activeTool = ref('filter');
  const selectedFilter = ref('none');
  const selectedRatio = ref('1:1');
  const captionText = ref('');
  const hashtagCount = ref(0);
  const selectedAccount = ref('main');
  const postType = ref('feed');
  const scheduleType = ref('now');
  const scheduleDate = ref('');
  const scheduleTime = ref('');
  const disableComments = ref(false);
  const hideLikes = ref(false);
  const brandedContent = ref(false);
  const autoDeleteStory = ref(false);
  const selectedDevice = ref('mobile');
  const showProgressModal = ref(false);
  const currentStep = ref(0);
  const fileInput = ref<HTMLInputElement>();

  // Sample data
  const accounts = [
    {
      id: 'main',
      name: 'Company Official',
      username: 'company_official',
      followers: '1.2M',
      avatar:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM3ODc3QzYiLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPk08L3RleHQ+Cjwvc3ZnPgo=',
    },
    {
      id: 'creative',
      name: 'Creative Studio',
      username: 'creative_studio',
      followers: '856K',
      avatar:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNDNkE2RjciLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPkM8L3RleHQ+Cjwvc3ZnPgo=',
    },
  ];

  const filters = [
    { name: 'None', css: 'none' },
    { name: 'Vintage', css: 'sepia(0.5) contrast(1.2)' },
    { name: 'B&W', css: 'grayscale(1) contrast(1.1)' },
    { name: 'Bright', css: 'brightness(1.2) saturate(1.3)' },
    { name: 'Warm', css: 'hue-rotate(15deg) saturate(1.2)' },
    { name: 'Cool', css: 'hue-rotate(-15deg) saturate(1.1)' },
  ];

  const aspectRatios = [
    { name: '1:1', value: '1/1' },
    { name: '4:5', value: '4/5' },
    { name: '16:9', value: '16/9' },
    { name: '9:16', value: '9/16' },
  ];

  const trendingHashtags = [
    { tag: '#innovation', uses: '2.4M' },
    { tag: '#design', uses: '8.1M' },
    { tag: '#inspiration', uses: '15.2M' },
    { tag: '#creativity', uses: '6.8M' },
    { tag: '#business', uses: '12.5M' },
    { tag: '#lifestyle', uses: '22.1M' },
  ];

  const devices = ['mobile', 'tablet', 'desktop'];

  const publishSteps = [
    'Validating content',
    'Optimizing media',
    'Uploading to Instagram',
    'Publishing post',
    'Complete!',
  ];

  // Computed properties
  const selectedAccountData = computed(() => {
    return accounts.find(account => account.id === selectedAccount.value);
  });

  const predictedLikes = computed(() => {
    const base = 1200;
    const mediaBonus = uploadedMedia.value.length * 50;
    const captionBonus = Math.min(captionText.value.length * 0.5, 100);
    return Math.round(base + mediaBonus + captionBonus).toLocaleString();
  });

  const predictedComments = computed(() => {
    return Math.round(
      parseInt(predictedLikes.value.replace(/,/g, '')) * 0.08
    ).toLocaleString();
  });

  const predictedShares = computed(() => {
    return Math.round(
      parseInt(predictedLikes.value.replace(/,/g, '')) * 0.03
    ).toLocaleString();
  });

  // Methods
  const triggerUpload = () => {
    fileInput.value?.click();
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleDrop = (event: DragEvent) => {
    const files = event.dataTransfer?.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';

      uploadedMedia.value.push({
        name: file.name,
        size: file.size,
        type,
        url,
        file,
      });
    });
  };

  const editMedia = (index: number) => {
    selectedMediaIndex.value = index;
  };

  const removeMedia = (index: number) => {
    uploadedMedia.value.splice(index, 1);
    if (selectedMediaIndex.value >= uploadedMedia.value.length) {
      selectedMediaIndex.value = Math.max(0, uploadedMedia.value.length - 1);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const updateCaptionStats = () => {
    const matches = captionText.value.match(/#\w+/g);
    hashtagCount.value = matches ? matches.length : 0;
  };

  const insertEmoji = () => {
    captionText.value += '😊';
    updateCaptionStats();
  };

  const insertHashtag = () => {
    captionText.value += '#hashtag ';
    updateCaptionStats();
  };

  const insertMention = () => {
    captionText.value += '@username ';
    updateCaptionStats();
  };

  const addHashtag = (hashtag: string) => {
    if (!captionText.value.includes(hashtag)) {
      captionText.value += `${hashtag} `;
      updateCaptionStats();
    }
  };

  const generateCaption = () => {
    captionText.value =
      'Embracing the journey of innovation and creativity ✨ Every moment is an opportunity to create something extraordinary. What inspires you today? #inspiration #creativity #innovation';
    updateCaptionStats();
  };

  const improveCaption = () => {
    if (captionText.value) {
      captionText.value += ' 🚀 #trending #viral';
      updateCaptionStats();
    }
  };

  const saveDraft = () => {
    console.log('Saving draft...');
  };

  const publishPost = async () => {
    showProgressModal.value = true;
    currentStep.value = 0;

    for (let i = 0; i < publishSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      currentStep.value = i + 1;
    }

    setTimeout(() => {
      showProgressModal.value = false;
      currentStep.value = 0;
    }, 2000);
  };

  onMounted(() => {
    // Set default date and time
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    scheduleDate.value = tomorrow.toISOString().split('T')[0];
    scheduleTime.value = '18:00';
  });
</script>

<style scoped>
  .stylish-creator {
    background: #000;
    color: #fff;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    min-height: 100vh;
    padding: 2rem;
  }

  /* Header */
  .creator-header {
    margin-bottom: 3rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 2rem;
    border-bottom: 1px solid #222;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 200;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    color: #888;
    font-size: 1.125rem;
    font-weight: 300;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    letter-spacing: 0.025em;
  }

  .btn-primary {
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    border: none;
    color: #fff;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(120, 119, 198, 0.3);
  }

  .btn-secondary {
    background: transparent;
    border: 1px solid #333;
    color: #fff;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: #555;
  }

  /* Layout */
  .creator-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 3rem;
  }

  /* Content Panel */
  .content-panel {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: -0.01em;
  }

  /* Media Section */
  .media-controls {
    display: flex;
    gap: 1rem;
  }

  .control-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    color: #888;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .control-btn.active {
    background: rgba(120, 119, 198, 0.2);
    border-color: #7877c6;
    color: #c6a6f7;
  }

  .media-upload-area {
    background: rgba(255, 255, 255, 0.02);
    border: 2px dashed #333;
    border-radius: 8px;
    padding: 3rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 2rem;
  }

  .media-upload-area:hover {
    border-color: #555;
    background: rgba(255, 255, 255, 0.04);
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .upload-icon {
    font-size: 3rem;
    opacity: 0.5;
  }

  .upload-title {
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0;
  }

  .upload-description {
    color: #888;
    margin: 0;
  }

  .upload-button {
    background: rgba(120, 119, 198, 0.2);
    border: 1px solid #7877c6;
    color: #c6a6f7;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .upload-button:hover {
    background: rgba(120, 119, 198, 0.3);
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .media-item {
    position: relative;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .media-item.active {
    border-color: #7877c6;
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
    gap: 1rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .media-item:hover .media-overlay {
    opacity: 1;
  }

  .overlay-btn {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .overlay-btn:hover {
    background: #fff;
    transform: scale(1.1);
  }

  .media-info {
    padding: 0.75rem;
    background: #111;
    border-top: 1px solid #222;
  }

  .media-name {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .media-size {
    font-size: 0.75rem;
    color: #888;
  }

  .add-media-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.02);
    border: 2px dashed #333;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .add-media-item:hover {
    border-color: #555;
    background: rgba(255, 255, 255, 0.04);
  }

  .add-icon {
    font-size: 2rem;
    color: #888;
    margin-bottom: 0.5rem;
  }

  .add-text {
    font-size: 0.875rem;
    color: #888;
  }

  /* Media Editor */
  .media-editor {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .editor-title {
    font-size: 1.125rem;
    font-weight: 500;
  }

  .editor-tools {
    display: flex;
    gap: 0.5rem;
  }

  .tool-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    color: #888;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tool-btn.active {
    background: rgba(120, 119, 198, 0.2);
    border-color: #7877c6;
    color: #c6a6f7;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 1rem;
  }

  .filter-item {
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .filter-item.active .filter-preview {
    border-color: #7877c6;
  }

  .filter-preview {
    width: 60px;
    height: 60px;
    border: 2px solid #333;
    border-radius: 8px;
    margin: 0 auto 0.5rem;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .filter-sample {
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #7877c6, #c6a6f7);
  }

  .filter-name {
    font-size: 0.75rem;
    color: #888;
  }

  .aspect-ratios {
    display: flex;
    gap: 1rem;
  }

  .ratio-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    color: #888;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .ratio-btn.active {
    background: rgba(120, 119, 198, 0.2);
    border-color: #7877c6;
    color: #c6a6f7;
  }

  /* Caption Section */
  .caption-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #888;
  }

  .char-count {
    color: #7877c6;
  }

  .caption-editor {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .caption-textarea {
    width: 100%;
    background: transparent;
    border: none;
    color: #fff;
    padding: 1.5rem;
    font-size: 1rem;
    line-height: 1.6;
    resize: vertical;
    min-height: 120px;
    font-family: inherit;
  }

  .caption-textarea::placeholder {
    color: #888;
  }

  .caption-textarea:focus {
    outline: none;
  }

  .caption-tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-top: 1px solid #222;
  }

  .tool-group {
    display: flex;
    gap: 0.5rem;
  }

  .tool-btn-small {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    border-radius: 4px;
    color: #888;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .tool-btn-small:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .ai-tools {
    display: flex;
    gap: 0.5rem;
  }

  .ai-btn {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    border: none;
    color: #fff;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .ai-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(120, 119, 198, 0.3);
  }

  /* Hashtag Suggestions */
  .hashtag-suggestions {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .suggestions-title {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .hashtag-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .hashtag-suggestion {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    padding: 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .hashtag-suggestion:hover {
    background: rgba(120, 119, 198, 0.2);
    border-color: #7877c6;
  }

  .hashtag-text {
    color: #7877c6;
    font-weight: 500;
  }

  .hashtag-uses {
    font-size: 0.75rem;
    color: #888;
  }

  /* Settings Section */
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .setting-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #ccc;
  }

  .setting-select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    color: #fff;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .setting-select:focus {
    outline: none;
    border-color: #7877c6;
    box-shadow: 0 0 0 3px rgba(120, 119, 198, 0.1);
  }

  .schedule-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  .radio-option input[type='radio'] {
    display: none;
  }

  .radio-custom {
    width: 16px;
    height: 16px;
    border: 2px solid #333;
    border-radius: 50%;
    position: relative;
    transition: all 0.3s ease;
  }

  .radio-option input[type='radio']:checked + .radio-custom {
    border-color: #7877c6;
  }

  .radio-option input[type='radio']:checked + .radio-custom::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: #7877c6;
    border-radius: 50%;
  }

  .datetime-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .datetime-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    color: #fff;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
  }

  .datetime-input:focus {
    outline: none;
    border-color: #7877c6;
    box-shadow: 0 0 0 3px rgba(120, 119, 198, 0.1);
  }

  /* Advanced Options */
  .advanced-options {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    overflow: hidden;
  }

  .options-details {
    cursor: pointer;
  }

  .options-summary {
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid #222;
    font-weight: 500;
    list-style: none;
    transition: all 0.3s ease;
  }

  .options-summary:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .options-content {
    padding: 1.5rem;
  }

  .option-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .option-row:last-child {
    margin-bottom: 0;
  }

  .toggle-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }

  .toggle-option input[type='checkbox'] {
    display: none;
  }

  .toggle-slider {
    width: 40px;
    height: 20px;
    background: #333;
    border-radius: 10px;
    position: relative;
    transition: all 0.3s ease;
  }

  .toggle-slider::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: #888;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .toggle-option input[type='checkbox']:checked + .toggle-slider {
    background: #7877c6;
  }

  .toggle-option input[type='checkbox']:checked + .toggle-slider::after {
    transform: translateX(20px);
    background: #fff;
  }

  /* Preview Panel */
  .preview-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    padding: 2rem;
    height: fit-content;
    position: sticky;
    top: 2rem;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .preview-title {
    font-size: 1.25rem;
    font-weight: 500;
  }

  .device-switcher {
    display: flex;
    gap: 0.5rem;
  }

  .device-btn {
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    color: #888;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .device-btn.active {
    background: rgba(120, 119, 198, 0.2);
    border-color: #7877c6;
    color: #c6a6f7;
  }

  .preview-container {
    margin-bottom: 2rem;
  }

  .preview-container.device-mobile .phone-frame {
    max-width: 300px;
  }

  .preview-container.device-tablet .phone-frame {
    max-width: 400px;
  }

  .preview-container.device-desktop .phone-frame {
    max-width: 500px;
  }

  .phone-frame {
    background: #222;
    border-radius: 20px;
    padding: 20px 10px;
    margin: 0 auto;
  }

  .phone-screen {
    background: #000;
    border-radius: 15px;
    overflow: hidden;
  }

  /* Instagram Preview */
  .instagram-preview {
    font-size: 14px;
    line-height: 1.4;
  }

  .post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
  }

  .account-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .account-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
  }

  .account-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .account-details {
    display: flex;
    flex-direction: column;
  }

  .account-name {
    font-weight: 600;
    font-size: 14px;
  }

  .post-location {
    font-size: 12px;
    color: #888;
  }

  .post-menu {
    background: none;
    border: none;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
  }

  .post-media {
    position: relative;
    aspect-ratio: 1;
    background: #111;
  }

  .media-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .media-container img,
  .media-container video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .carousel-indicator {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 4px;
  }

  .indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
  }

  .indicator-dot.active {
    background: #fff;
  }

  .media-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
  }

  .placeholder-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .placeholder-text {
    font-size: 0.875rem;
  }

  .post-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
  }

  .action-left {
    display: flex;
    gap: 12px;
  }

  .action-btn {
    background: none;
    border: none;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
  }

  .post-engagement {
    padding: 0 16px;
    margin-bottom: 8px;
  }

  .likes-count {
    font-weight: 600;
    font-size: 14px;
  }

  .post-caption {
    padding: 0 16px;
    margin-bottom: 8px;
  }

  .caption-username {
    font-weight: 600;
    margin-right: 8px;
  }

  .caption-text {
    color: #fff;
  }

  .post-comments {
    padding: 0 16px 16px;
  }

  .comments-summary {
    color: #888;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .post-time {
    color: #888;
    font-size: 12px;
    text-transform: uppercase;
  }

  /* Performance Prediction */
  .performance-prediction {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .prediction-title {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
    color: #7877c6;
  }

  .prediction-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .metric-item {
    text-align: center;
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: 500;
    color: #fff;
    display: block;
    margin-bottom: 0.25rem;
  }

  .metric-label {
    font-size: 0.75rem;
    color: #888;
    display: block;
    margin-bottom: 0.25rem;
  }

  .metric-trend {
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .metric-trend.positive {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
  }

  .metric-trend.neutral {
    background: rgba(156, 163, 175, 0.2);
    color: #9ca3af;
  }

  .best-time {
    padding: 1rem;
    background: rgba(120, 119, 198, 0.1);
    border: 1px solid #7877c6;
    border-radius: 6px;
    text-align: center;
  }

  .best-time-label {
    color: #888;
    font-size: 0.875rem;
    margin-right: 0.5rem;
  }

  .best-time-value {
    color: #c6a6f7;
    font-weight: 500;
  }

  /* Progress Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .progress-modal {
    background: #111;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 2rem;
    min-width: 400px;
    animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .progress-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .progress-title {
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0;
  }

  .progress-steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .progress-step {
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
  }

  .progress-step.active {
    color: #7877c6;
  }

  .progress-step.completed {
    color: #4ade80;
  }

  .step-icon {
    width: 32px;
    height: 32px;
    border: 2px solid #333;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .progress-step.active .step-icon {
    border-color: #7877c6;
    background: rgba(120, 119, 198, 0.2);
  }

  .progress-step.completed .step-icon {
    border-color: #4ade80;
    background: rgba(74, 222, 128, 0.2);
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: #333;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #7877c6 0%, #c6a6f7 100%);
    transition: width 0.5s ease;
  }

  /* Animations */
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .creator-layout {
      grid-template-columns: 1fr;
    }

    .preview-panel {
      position: static;
    }
  }

  @media (max-width: 768px) {
    .stylish-creator {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .header-actions {
      justify-content: space-between;
    }

    .media-grid {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }

    .settings-grid {
      grid-template-columns: 1fr;
    }

    .option-row {
      grid-template-columns: 1fr;
    }

    .prediction-metrics {
      grid-template-columns: 1fr;
    }
  }
</style>
