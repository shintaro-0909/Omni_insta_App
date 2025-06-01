<template>
  <div class="neumorphism-post-creator">
    <!-- Header -->
    <header class="creator-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Create Post</h1>
          <p class="page-subtitle">
            Design beautiful content for your Instagram
          </p>
        </div>
        <div class="header-actions">
          <button class="action-btn draft" @click="saveDraft">
            <i class="mdi mdi-content-save"></i>
            Save Draft
          </button>
          <button class="action-btn schedule" @click="schedulePost">
            <i class="mdi mdi-calendar"></i>
            Schedule
          </button>
          <button class="action-btn publish" @click="publishNow">
            <i class="mdi mdi-send"></i>
            Publish Now
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="creator-content">
      <!-- Left Column - Media & Preview -->
      <div class="left-column">
        <!-- Media Upload Section -->
        <div class="media-upload-section">
          <div class="section-header">
            <h3>Media</h3>
            <div class="media-type-selector">
              <button
                class="media-type-btn"
                :class="{ active: mediaType === 'image' }"
                @click="mediaType = 'image'"
              >
                <i class="mdi mdi-image"></i>
                Photo
              </button>
              <button
                class="media-type-btn"
                :class="{ active: mediaType === 'video' }"
                @click="mediaType = 'video'"
              >
                <i class="mdi mdi-video"></i>
                Video
              </button>
              <button
                class="media-type-btn"
                :class="{ active: mediaType === 'carousel' }"
                @click="mediaType = 'carousel'"
              >
                <i class="mdi mdi-view-carousel"></i>
                Carousel
              </button>
            </div>
          </div>

          <!-- Upload Area -->
          <div
            class="upload-area"
            @click="triggerFileUpload"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <div v-if="!uploadedMedia.length" class="upload-placeholder">
              <i class="mdi mdi-cloud-upload upload-icon"></i>
              <h4>Drop your files here</h4>
              <p>Or click to browse</p>
              <div class="supported-formats">
                <span v-if="mediaType === 'image'"
                  >JPG, PNG, GIF up to 10MB</span
                >
                <span v-if="mediaType === 'video'">MP4, MOV up to 100MB</span>
                <span v-if="mediaType === 'carousel'"
                  >Multiple photos up to 10 items</span
                >
              </div>
            </div>
            <div v-else class="uploaded-media">
              <div
                class="media-item"
                v-for="(media, index) in uploadedMedia"
                :key="index"
                :class="{ active: selectedMediaIndex === index }"
                @click.stop="selectedMediaIndex = index"
              >
                <img
                  v-if="media.type === 'image'"
                  :src="media.url"
                  :alt="`Media ${index + 1}`"
                />
                <video
                  v-if="media.type === 'video'"
                  :src="media.url"
                  muted
                ></video>
                <div class="media-overlay">
                  <button class="remove-media" @click.stop="removeMedia(index)">
                    <i class="mdi mdi-close"></i>
                  </button>
                </div>
              </div>
              <div
                v-if="mediaType === 'carousel' && uploadedMedia.length < 10"
                class="add-more-media"
                @click.stop="triggerFileUpload"
              >
                <i class="mdi mdi-plus"></i>
                <span>Add More</span>
              </div>
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            multiple
            hidden
            @change="handleFileUpload"
            accept="image/*,video/*"
          />
        </div>

        <!-- Preview Section -->
        <div class="preview-section">
          <div class="section-header">
            <h3>Preview</h3>
            <div class="preview-controls">
              <button
                class="preview-control"
                :class="{ active: previewMode === 'feed' }"
                @click="previewMode = 'feed'"
              >
                Feed
              </button>
              <button
                class="preview-control"
                :class="{ active: previewMode === 'story' }"
                @click="previewMode = 'story'"
              >
                Story
              </button>
            </div>
          </div>

          <div class="preview-container">
            <div class="instagram-preview" :class="previewMode">
              <!-- Instagram Feed Preview -->
              <div v-if="previewMode === 'feed'" class="feed-preview">
                <div class="post-header">
                  <div class="profile-info">
                    <div class="profile-avatar">
                      <img
                        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
                        alt="Profile"
                      />
                    </div>
                    <div class="profile-details">
                      <span class="username">{{
                        selectedAccount.username
                      }}</span>
                      <span class="location">{{ postData.location }}</span>
                    </div>
                  </div>
                  <button class="options-btn">
                    <i class="mdi mdi-dots-horizontal"></i>
                  </button>
                </div>

                <div class="post-media">
                  <img
                    v-if="selectedMedia && selectedMedia.type === 'image'"
                    :src="selectedMedia.url"
                    alt="Post media"
                  />
                  <video
                    v-if="selectedMedia && selectedMedia.type === 'video'"
                    :src="selectedMedia.url"
                    muted
                    controls
                  ></video>
                  <div v-if="!selectedMedia" class="no-media">
                    <i class="mdi mdi-image"></i>
                    <span>No media selected</span>
                  </div>
                </div>

                <div class="post-actions">
                  <div class="action-buttons">
                    <i class="mdi mdi-heart-outline"></i>
                    <i class="mdi mdi-comment-outline"></i>
                    <i class="mdi mdi-share-outline"></i>
                  </div>
                  <i class="mdi mdi-bookmark-outline"></i>
                </div>

                <div class="post-engagement">
                  <div class="likes">{{ randomLikes }} likes</div>
                </div>

                <div class="post-caption">
                  <span class="username">{{ selectedAccount.username }}</span>
                  <span class="caption-text">{{
                    postData.caption || 'Write your caption...'
                  }}</span>
                </div>
              </div>

              <!-- Instagram Story Preview -->
              <div v-if="previewMode === 'story'" class="story-preview">
                <div class="story-header">
                  <div class="profile-info">
                    <div class="profile-avatar">
                      <img
                        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
                        alt="Profile"
                      />
                    </div>
                    <span class="username">{{ selectedAccount.username }}</span>
                    <span class="time">now</span>
                  </div>
                  <div class="story-actions">
                    <i class="mdi mdi-pause"></i>
                    <i class="mdi mdi-volume-high"></i>
                    <i class="mdi mdi-close"></i>
                  </div>
                </div>

                <div class="story-media">
                  <img
                    v-if="selectedMedia && selectedMedia.type === 'image'"
                    :src="selectedMedia.url"
                    alt="Story media"
                  />
                  <video
                    v-if="selectedMedia && selectedMedia.type === 'video'"
                    :src="selectedMedia.url"
                    muted
                  ></video>
                  <div v-if="!selectedMedia" class="no-media">
                    <i class="mdi mdi-image"></i>
                    <span>No media selected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Content & Settings -->
      <div class="right-column">
        <!-- Account Selection -->
        <div class="account-section">
          <div class="section-header">
            <h3>Account</h3>
          </div>
          <div class="account-selector">
            <div
              class="account-option"
              v-for="account in accounts"
              :key="account.id"
              :class="{ active: selectedAccount.id === account.id }"
              @click="selectedAccount = account"
            >
              <div class="account-avatar">
                <img :src="account.avatar" :alt="account.username" />
              </div>
              <div class="account-info">
                <span class="account-username">{{ account.username }}</span>
                <span class="account-followers"
                  >{{ account.followers }} followers</span
                >
              </div>
              <div class="account-status" :class="account.status"></div>
            </div>
          </div>
        </div>

        <!-- Caption Section -->
        <div class="caption-section">
          <div class="section-header">
            <h3>Caption</h3>
            <div class="caption-stats">
              <span class="char-count">{{ postData.caption.length }}/2200</span>
            </div>
          </div>
          <div class="caption-editor">
            <textarea
              class="caption-textarea"
              v-model="postData.caption"
              placeholder="Write a caption..."
              @input="updateCaptionStats"
            ></textarea>
            <div class="caption-tools">
              <button class="caption-tool" @click="addHashtags">
                <i class="mdi mdi-pound"></i>
                Hashtags
              </button>
              <button class="caption-tool" @click="addMention">
                <i class="mdi mdi-at"></i>
                Mention
              </button>
              <button class="caption-tool" @click="addEmoji">
                <i class="mdi mdi-emoticon"></i>
                Emoji
              </button>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div class="settings-section">
          <div class="section-header">
            <h3>Settings</h3>
            <button
              class="toggle-advanced"
              @click="showAdvanced = !showAdvanced"
            >
              <i
                :class="
                  showAdvanced ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'
                "
              ></i>
            </button>
          </div>

          <div class="settings-grid" :class="{ expanded: showAdvanced }">
            <!-- Basic Settings -->
            <div class="setting-item">
              <label>Location</label>
              <input
                type="text"
                class="setting-input"
                v-model="postData.location"
                placeholder="Add location..."
              />
            </div>

            <div class="setting-item">
              <label>Alt Text</label>
              <input
                type="text"
                class="setting-input"
                v-model="postData.altText"
                placeholder="Describe your image..."
              />
            </div>

            <!-- Advanced Settings -->
            <template v-if="showAdvanced">
              <div class="setting-item">
                <label>Turn off commenting</label>
                <div class="setting-toggle">
                  <input
                    type="checkbox"
                    id="disable-comments"
                    v-model="postData.disableComments"
                  />
                  <label for="disable-comments" class="toggle-label"></label>
                </div>
              </div>

              <div class="setting-item">
                <label>Hide like count</label>
                <div class="setting-toggle">
                  <input
                    type="checkbox"
                    id="hide-likes"
                    v-model="postData.hideLikes"
                  />
                  <label for="hide-likes" class="toggle-label"></label>
                </div>
              </div>

              <div class="setting-item">
                <label>Mark as paid partnership</label>
                <div class="setting-toggle">
                  <input
                    type="checkbox"
                    id="paid-partnership"
                    v-model="postData.paidPartnership"
                  />
                  <label for="paid-partnership" class="toggle-label"></label>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- AI Content Suggestions -->
        <div class="ai-suggestions-section">
          <div class="section-header">
            <h3>AI Suggestions</h3>
            <button class="ai-generate-btn" @click="generateSuggestions">
              <i class="mdi mdi-sparkles"></i>
              Generate
            </button>
          </div>

          <div class="suggestions-content" v-if="aiSuggestions.length">
            <div class="suggestion-tabs">
              <button
                class="suggestion-tab"
                :class="{ active: activeTab === 'captions' }"
                @click="activeTab = 'captions'"
              >
                Captions
              </button>
              <button
                class="suggestion-tab"
                :class="{ active: activeTab === 'hashtags' }"
                @click="activeTab = 'hashtags'"
              >
                Hashtags
              </button>
            </div>

            <div class="suggestions-list">
              <div
                v-if="activeTab === 'captions'"
                class="suggestion-item"
                v-for="suggestion in aiSuggestions.captions"
                :key="suggestion.id"
                @click="applySuggestion('caption', suggestion.text)"
              >
                <div class="suggestion-text">{{ suggestion.text }}</div>
                <button class="use-suggestion">Use</button>
              </div>

              <div v-if="activeTab === 'hashtags'" class="hashtag-suggestions">
                <div class="hashtag-categories">
                  <div
                    class="hashtag-category"
                    v-for="category in aiSuggestions.hashtags"
                    :key="category.name"
                  >
                    <h4>{{ category.name }}</h4>
                    <div class="hashtag-list">
                      <span
                        class="hashtag-item"
                        v-for="hashtag in category.tags"
                        :key="hashtag"
                        @click="addHashtag(hashtag)"
                      >
                        #{{ hashtag }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-suggestions">
            <i class="mdi mdi-lightbulb-outline"></i>
            <p>Generate AI-powered content suggestions</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';

  const mediaType = ref('image');
  const previewMode = ref('feed');
  const showAdvanced = ref(false);
  const activeTab = ref('captions');
  const selectedMediaIndex = ref(0);
  const fileInput = ref(null);

  const uploadedMedia = ref([]);
  const selectedAccount = ref({
    id: 1,
    username: 'sarahlifestyle',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    followers: '45.2K',
    status: 'connected',
  });

  const accounts = ref([
    {
      id: 1,
      username: 'sarahlifestyle',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      followers: '45.2K',
      status: 'connected',
    },
    {
      id: 2,
      username: 'sarahfitness',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      followers: '32.1K',
      status: 'connected',
    },
    {
      id: 3,
      username: 'sarahtravel',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
      followers: '28.9K',
      status: 'connected',
    },
  ]);

  const postData = ref({
    caption: '',
    location: '',
    altText: '',
    disableComments: false,
    hideLikes: false,
    paidPartnership: false,
  });

  const aiSuggestions = ref([]);

  const selectedMedia = computed(() => {
    return uploadedMedia.value[selectedMediaIndex.value] || null;
  });

  const randomLikes = computed(() => {
    return Math.floor(Math.random() * 5000) + 500;
  });

  const triggerFileUpload = () => {
    fileInput.value?.click();
  };

  const handleFileUpload = event => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        uploadedMedia.value.push({
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: e.target.result,
          file: file,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = event => {
    const files = Array.from(event.dataTransfer.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        uploadedMedia.value.push({
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: e.target.result,
          file: file,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = index => {
    uploadedMedia.value.splice(index, 1);
    if (selectedMediaIndex.value >= uploadedMedia.value.length) {
      selectedMediaIndex.value = Math.max(0, uploadedMedia.value.length - 1);
    }
  };

  const updateCaptionStats = () => {
    // Caption stats are computed automatically via v-model
  };

  const addHashtags = () => {
    const hashtags = ' #lifestyle #inspiration #daily';
    postData.value.caption += hashtags;
  };

  const addMention = () => {
    const mention = ' @username';
    postData.value.caption += mention;
  };

  const addEmoji = () => {
    const emoji = ' ✨';
    postData.value.caption += emoji;
  };

  const addHashtag = hashtag => {
    postData.value.caption += ` #${hashtag}`;
  };

  const generateSuggestions = () => {
    // Simulate AI suggestions
    aiSuggestions.value = {
      captions: [
        {
          id: 1,
          text: "✨ Living my best life one day at a time. What's inspiring you today? #lifestyle #motivation",
        },
        {
          id: 2,
          text: 'Sometimes the smallest step in the right direction ends up being the biggest step of your life 💫',
        },
        {
          id: 3,
          text: 'Collecting moments, not things 📸 #memories #gratitude #blessed',
        },
      ],
      hashtags: [
        {
          name: 'Lifestyle',
          tags: [
            'lifestyle',
            'daily',
            'inspiration',
            'motivation',
            'blessed',
            'gratitude',
          ],
        },
        {
          name: 'Photography',
          tags: [
            'photography',
            'photooftheday',
            'instadaily',
            'picoftheday',
            'capture',
            'moment',
          ],
        },
        {
          name: 'Trending',
          tags: ['trending', 'viral', 'explore', 'fyp', 'mood', 'vibes'],
        },
      ],
    };
  };

  const applySuggestion = (type, text) => {
    if (type === 'caption') {
      postData.value.caption = text;
    }
  };

  const saveDraft = () => {
    console.log('Saving draft...');
  };

  const schedulePost = () => {
    console.log('Opening schedule modal...');
  };

  const publishNow = () => {
    console.log('Publishing now...');
  };

  onMounted(() => {
    // Add some sample media for demo
    uploadedMedia.value = [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
      },
    ];
  });
</script>

<style scoped>
  .neumorphism-post-creator {
    background: #e0e5ec;
    min-height: 100vh;
    padding: 20px;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
  }

  /* Header */
  .creator-header {
    margin-bottom: 30px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #4a5568;
    margin: 0;
    text-shadow:
      2px 2px 4px rgba(163, 177, 198, 0.3),
      -2px -2px 4px rgba(255, 255, 255, 0.7);
  }

  .page-subtitle {
    color: #718096;
    margin: 5px 0 0 0;
    font-size: 1.1rem;
  }

  .header-actions {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .action-btn {
    background: #e0e5ec;
    border: none;
    padding: 12px 20px;
    border-radius: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow:
      8px 8px 16px rgba(163, 177, 198, 0.6),
      -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .action-btn:hover {
    box-shadow:
      4px 4px 8px rgba(163, 177, 198, 0.6),
      -4px -4px 8px rgba(255, 255, 255, 0.7);
    transform: translateY(2px);
  }

  .action-btn.draft {
    color: #718096;
  }

  .action-btn.schedule {
    color: #4299e1;
  }

  .action-btn.publish {
    color: #48bb78;
  }

  /* Main Content */
  .creator-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 30px;
  }

  /* Section Headers */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .section-header h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0;
  }

  /* Card Base Styles */
  .media-upload-section,
  .preview-section,
  .account-section,
  .caption-section,
  .settings-section,
  .ai-suggestions-section {
    background: #e0e5ec;
    border-radius: 20px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow:
      12px 12px 24px rgba(163, 177, 198, 0.6),
      -12px -12px 24px rgba(255, 255, 255, 0.7);
  }

  /* Media Type Selector */
  .media-type-selector {
    display: flex;
    gap: 8px;
  }

  .media-type-btn {
    background: #e0e5ec;
    border: none;
    padding: 8px 12px;
    border-radius: 10px;
    color: #718096;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    box-shadow:
      inset 6px 6px 12px rgba(163, 177, 198, 0.6),
      inset -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .media-type-btn.active {
    color: #4299e1;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  /* Upload Area */
  .upload-area {
    background: #e0e5ec;
    border: 2px dashed #cbd5e0;
    border-radius: 20px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 12px 12px 24px rgba(163, 177, 198, 0.6),
      inset -12px -12px 24px rgba(255, 255, 255, 0.7);
  }

  .upload-area:hover {
    border-color: #4299e1;
  }

  .upload-placeholder {
    color: #718096;
  }

  .upload-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #4299e1;
  }

  .upload-placeholder h4 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #4a5568;
  }

  .upload-placeholder p {
    margin: 0 0 15px 0;
    color: #718096;
  }

  .supported-formats {
    font-size: 0.85rem;
    color: #a0aec0;
  }

  /* Uploaded Media */
  .uploaded-media {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    width: 100%;
  }

  .media-item {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 15px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      8px 8px 16px rgba(163, 177, 198, 0.6),
      -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .media-item.active {
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7),
      0 0 0 2px #4299e1;
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
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .media-item:hover .media-overlay {
    opacity: 1;
  }

  .remove-media {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    background: rgba(245, 101, 101, 0.9);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-more-media {
    width: 120px;
    height: 120px;
    border: 2px dashed #cbd5e0;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #718096;
    transition: all 0.3s ease;
    background: #e0e5ec;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .add-more-media:hover {
    border-color: #4299e1;
    color: #4299e1;
  }

  .add-more-media i {
    font-size: 1.5rem;
    margin-bottom: 5px;
  }

  /* Preview Controls */
  .preview-controls {
    display: flex;
    gap: 8px;
  }

  .preview-control {
    background: #e0e5ec;
    border: none;
    padding: 8px 15px;
    border-radius: 10px;
    color: #718096;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      inset 6px 6px 12px rgba(163, 177, 198, 0.6),
      inset -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .preview-control.active {
    color: #4299e1;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  /* Instagram Preview */
  .preview-container {
    display: flex;
    justify-content: center;
  }

  .instagram-preview {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow:
      12px 12px 24px rgba(163, 177, 198, 0.6),
      -12px -12px 24px rgba(255, 255, 255, 0.7);
  }

  .instagram-preview.feed {
    width: 300px;
  }

  .instagram-preview.story {
    width: 200px;
    height: 355px;
    position: relative;
  }

  /* Feed Preview */
  .feed-preview {
    background: white;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #e2e8f0;
  }

  .profile-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .profile-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
  }

  .profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-details {
    display: flex;
    flex-direction: column;
  }

  .username {
    font-weight: 600;
    font-size: 0.9rem;
    color: #262626;
  }

  .location {
    font-size: 0.8rem;
    color: #8e8e8e;
  }

  .options-btn {
    background: none;
    border: none;
    color: #262626;
    cursor: pointer;
    font-size: 1.2rem;
  }

  .post-media {
    width: 100%;
    height: 300px;
    background: #f7fafc;
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

  .no-media {
    color: #a0aec0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .no-media i {
    font-size: 2rem;
  }

  .post-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
  }

  .action-buttons {
    display: flex;
    gap: 15px;
  }

  .action-buttons i {
    font-size: 1.3rem;
    color: #262626;
    cursor: pointer;
  }

  .post-engagement {
    padding: 0 15px;
  }

  .likes {
    font-weight: 600;
    font-size: 0.9rem;
    color: #262626;
  }

  .post-caption {
    padding: 15px;
  }

  .post-caption .username {
    font-weight: 600;
    margin-right: 8px;
  }

  .caption-text {
    color: #262626;
  }

  /* Story Preview */
  .story-preview {
    background: linear-gradient(45deg, #f093fb 0%, #f5576c 50%, #4facfe 100%);
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .story-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    color: white;
  }

  .story-header .profile-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .story-header .username {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .time {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .story-actions {
    display: flex;
    gap: 15px;
  }

  .story-actions i {
    color: white;
    cursor: pointer;
  }

  .story-media {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px;
    border-radius: 10px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
  }

  .story-media img,
  .story-media video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .story-media .no-media {
    color: rgba(255, 255, 255, 0.8);
  }

  /* Account Selector */
  .account-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .account-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    background: #e0e5ec;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .account-option.active {
    box-shadow:
      8px 8px 16px rgba(163, 177, 198, 0.6),
      -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .account-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
  }

  .account-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .account-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .account-username {
    font-weight: 600;
    color: #4a5568;
    font-size: 0.95rem;
  }

  .account-followers {
    color: #718096;
    font-size: 0.85rem;
  }

  .account-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #48bb78;
  }

  /* Caption Editor */
  .caption-stats {
    color: #718096;
    font-size: 0.85rem;
  }

  .char-count {
    font-weight: 500;
  }

  .caption-editor {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .caption-textarea {
    background: #e0e5ec;
    border: none;
    padding: 15px;
    border-radius: 15px;
    resize: vertical;
    min-height: 120px;
    color: #4a5568;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.5;
    box-shadow:
      inset 10px 10px 20px rgba(163, 177, 198, 0.6),
      inset -10px -10px 20px rgba(255, 255, 255, 0.7);
  }

  .caption-textarea:focus {
    outline: none;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .caption-textarea::placeholder {
    color: #a0aec0;
  }

  .caption-tools {
    display: flex;
    gap: 10px;
  }

  .caption-tool {
    background: #e0e5ec;
    border: none;
    padding: 8px 12px;
    border-radius: 10px;
    color: #718096;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .caption-tool:hover {
    color: #4299e1;
    box-shadow:
      3px 3px 6px rgba(163, 177, 198, 0.6),
      -3px -3px 6px rgba(255, 255, 255, 0.7);
  }

  /* Settings */
  .toggle-advanced {
    background: #e0e5ec;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #718096;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 200px;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .settings-grid.expanded {
    max-height: 500px;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }

  .setting-item label {
    font-weight: 500;
    color: #4a5568;
    font-size: 0.9rem;
    flex: 1;
  }

  .setting-input {
    background: #e0e5ec;
    border: none;
    padding: 10px 12px;
    border-radius: 10px;
    color: #4a5568;
    font-size: 0.9rem;
    flex: 1;
    box-shadow:
      inset 6px 6px 12px rgba(163, 177, 198, 0.6),
      inset -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .setting-input:focus {
    outline: none;
  }

  .setting-input::placeholder {
    color: #a0aec0;
  }

  /* Toggle Switch */
  .setting-toggle {
    position: relative;
  }

  .setting-toggle input[type='checkbox'] {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-label {
    display: block;
    width: 44px;
    height: 24px;
    background: #e0e5ec;
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
    box-shadow:
      inset 6px 6px 12px rgba(163, 177, 198, 0.6),
      inset -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .toggle-label::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #e0e5ec;
    top: 3px;
    left: 3px;
    transition: all 0.3s ease;
    box-shadow:
      3px 3px 6px rgba(163, 177, 198, 0.6),
      -3px -3px 6px rgba(255, 255, 255, 0.7);
  }

  input[type='checkbox']:checked + .toggle-label {
    background: #4299e1;
  }

  input[type='checkbox']:checked + .toggle-label::after {
    transform: translateX(20px);
    background: white;
  }

  /* AI Suggestions */
  .ai-generate-btn {
    background: #e0e5ec;
    border: none;
    padding: 8px 15px;
    border-radius: 10px;
    color: #4299e1;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .ai-generate-btn:hover {
    box-shadow:
      3px 3px 6px rgba(163, 177, 198, 0.6),
      -3px -3px 6px rgba(255, 255, 255, 0.7);
  }

  .suggestion-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
  }

  .suggestion-tab {
    background: #e0e5ec;
    border: none;
    padding: 8px 15px;
    border-radius: 10px;
    color: #718096;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      inset 6px 6px 12px rgba(163, 177, 198, 0.6),
      inset -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .suggestion-tab.active {
    color: #4299e1;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .suggestions-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .suggestion-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    background: #e0e5ec;
    border-radius: 12px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      inset 6px 6px 12px rgba(163, 177, 198, 0.6),
      inset -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .suggestion-item:hover {
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .suggestion-text {
    flex: 1;
    font-size: 0.9rem;
    color: #4a5568;
    line-height: 1.4;
  }

  .use-suggestion {
    background: #e0e5ec;
    border: none;
    padding: 6px 12px;
    border-radius: 8px;
    color: #4299e1;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow:
      4px 4px 8px rgba(163, 177, 198, 0.6),
      -4px -4px 8px rgba(255, 255, 255, 0.7);
  }

  .hashtag-categories {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .hashtag-category h4 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 8px 0;
  }

  .hashtag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hashtag-item {
    background: #e0e5ec;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 0.8rem;
    color: #4299e1;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      4px 4px 8px rgba(163, 177, 198, 0.6),
      -4px -4px 8px rgba(255, 255, 255, 0.7);
  }

  .hashtag-item:hover {
    box-shadow:
      2px 2px 4px rgba(163, 177, 198, 0.6),
      -2px -2px 4px rgba(255, 255, 255, 0.7);
    transform: translateY(1px);
  }

  .no-suggestions {
    text-align: center;
    padding: 30px 20px;
    color: #718096;
  }

  .no-suggestions i {
    font-size: 2.5rem;
    margin-bottom: 10px;
    display: block;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .creator-content {
      grid-template-columns: 1fr;
    }

    .header-content {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .header-actions {
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .neumorphism-post-creator {
      padding: 15px;
    }

    .instagram-preview.feed {
      width: 250px;
    }

    .instagram-preview.story {
      width: 150px;
      height: 267px;
    }

    .uploaded-media {
      justify-content: center;
    }

    .media-item,
    .add-more-media {
      width: 100px;
      height: 100px;
    }

    .header-actions {
      flex-direction: column;
    }

    .action-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
