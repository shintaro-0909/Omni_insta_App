<template>
  <div class="modern-post-creator">
    <!-- Header -->
    <div class="creator-header">
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col cols="auto">
            <div class="header-title-section">
              <h1 class="page-title">Create Post</h1>
              <p class="page-subtitle">Craft engaging content with AI-powered tools</p>
            </div>
          </v-col>
          <v-col cols="auto">
            <div class="header-actions">
              <v-btn
                color="secondary"
                variant="outlined"
                class="save-draft-btn me-3"
                @click="saveDraft"
              >
                <v-icon start>mdi-content-save</v-icon>
                Save Draft
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="publish-btn"
                @click="publishPost"
              >
                <v-icon start>mdi-send</v-icon>
                Publish Now
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-container>
      <v-row>
        <!-- Main Creation Area -->
        <v-col cols="12" lg="8">
          <!-- Media Upload Section -->
          <v-card class="media-upload-card mb-6" elevation="2" data-aos="fade-up">
            <v-card-title class="upload-header">
              <div>
                <h3>Media Upload</h3>
                <p class="upload-subtitle">Upload photos, videos, or create carousels</p>
              </div>
              <div class="upload-actions">
                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="openMediaLibrary"
                >
                  <v-icon start>mdi-folder-image</v-icon>
                  Media Library
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text>
              <div class="upload-area">
                <div
                  v-if="uploadedMedia.length === 0"
                  class="upload-dropzone"
                  @click="triggerFileUpload"
                  @dragover.prevent
                  @drop.prevent="handleFileDrop"
                >
                  <div class="dropzone-content">
                    <v-avatar size="80" class="upload-icon">
                      <v-icon icon="mdi-cloud-upload" size="40"></v-icon>
                    </v-avatar>
                    <h4 class="dropzone-title">Drop files here or click to upload</h4>
                    <p class="dropzone-subtitle">
                      Support for JPG, PNG, GIF, MP4 up to 100MB
                    </p>
                    <v-btn
                      color="primary"
                      variant="flat"
                      class="upload-btn"
                    >
                      Choose Files
                    </v-btn>
                  </div>
                </div>

                <!-- Uploaded Media Grid -->
                <div v-else class="media-grid">
                  <div
                    v-for="(media, index) in uploadedMedia"
                    :key="index"
                    class="media-item"
                    :class="{ active: selectedMediaIndex === index }"
                    @click="selectMedia(index)"
                  >
                    <div class="media-preview">
                      <v-img
                        v-if="media.type === 'image'"
                        :src="media.url"
                        class="media-thumbnail"
                        cover
                      ></v-img>
                      <div v-else class="video-preview">
                        <video :src="media.url" class="media-thumbnail"></video>
                        <v-icon class="video-play-icon">mdi-play-circle</v-icon>
                      </div>
                    </div>
                    <div class="media-overlay">
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        color="white"
                        @click.stop="editMedia(index)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="white"
                        @click.stop="removeMedia(index)"
                      ></v-btn>
                    </div>
                    <div v-if="index === 0" class="primary-badge">
                      Primary
                    </div>
                  </div>
                  
                  <!-- Add More Button -->
                  <div
                    class="add-media-item"
                    @click="triggerFileUpload"
                  >
                    <v-icon icon="mdi-plus" size="40"></v-icon>
                    <span>Add More</span>
                  </div>
                </div>
              </div>

              <!-- Media Enhancement Tools -->
              <div v-if="uploadedMedia.length > 0" class="media-tools">
                <v-tabs v-model="activeMediaTool" class="media-tools-tabs">
                  <v-tab value="filters">Filters</v-tab>
                  <v-tab value="crop">Crop & Resize</v-tab>
                  <v-tab value="enhance">AI Enhance</v-tab>
                </v-tabs>

                <v-tabs-window v-model="activeMediaTool" class="tools-content">
                  <!-- Filters Tab -->
                  <v-tabs-window-item value="filters">
                    <div class="filters-section">
                      <div class="filter-grid">
                        <div
                          v-for="filter in imageFilters"
                          :key="filter.name"
                          class="filter-option"
                          :class="{ active: selectedFilter === filter.name }"
                          @click="applyFilter(filter.name)"
                        >
                          <div class="filter-preview">
                            <v-img
                              :src="uploadedMedia[selectedMediaIndex]?.url"
                              class="filter-thumbnail"
                              :style="{ filter: filter.css }"
                            ></v-img>
                          </div>
                          <div class="filter-name">{{ filter.name }}</div>
                        </div>
                      </div>
                    </div>
                  </v-tabs-window-item>

                  <!-- Crop Tab -->
                  <v-tabs-window-item value="crop">
                    <div class="crop-section">
                      <div class="aspect-ratios">
                        <v-btn-toggle
                          v-model="selectedAspectRatio"
                          variant="outlined"
                          mandatory
                        >
                          <v-btn value="1:1">Square</v-btn>
                          <v-btn value="4:5">Portrait</v-btn>
                          <v-btn value="16:9">Landscape</v-btn>
                          <v-btn value="9:16">Stories</v-btn>
                        </v-btn-toggle>
                      </div>
                    </div>
                  </v-tabs-window-item>

                  <!-- AI Enhance Tab -->
                  <v-tabs-window-item value="enhance">
                    <div class="enhance-section">
                      <div class="enhance-options">
                        <v-btn
                          v-for="enhancement in aiEnhancements"
                          :key="enhancement.name"
                          :color="enhancement.active ? 'primary' : 'secondary'"
                          :variant="enhancement.active ? 'flat' : 'outlined'"
                          class="enhance-btn"
                          @click="toggleEnhancement(enhancement)"
                        >
                          <v-icon start>{{ enhancement.icon }}</v-icon>
                          {{ enhancement.name }}
                        </v-btn>
                      </div>
                    </div>
                  </v-tabs-window-item>
                </v-tabs-window>
              </div>
            </v-card-text>
          </v-card>

          <!-- Caption Section -->
          <v-card class="caption-card mb-6" elevation="2" data-aos="fade-up" data-aos-delay="200">
            <v-card-title class="caption-header">
              <div>
                <h3>Caption & Hashtags</h3>
                <p class="caption-subtitle">Craft engaging captions with AI assistance</p>
              </div>
              <div class="caption-tools">
                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="generateCaption"
                >
                  <v-icon start>mdi-robot</v-icon>
                  AI Generate
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="postCaption"
                label="Write your caption..."
                variant="outlined"
                rows="6"
                counter="2200"
                class="caption-textarea"
                :rules="[rules.maxLength]"
              >
                <template v-slot:append>
                  <div class="caption-stats">
                    <div class="char-count">{{ postCaption.length }}/2200</div>
                    <div class="hashtag-count">{{ hashtagCount }} hashtags</div>
                  </div>
                </template>
              </v-textarea>

              <!-- AI Suggestions -->
              <div v-if="captionSuggestions.length > 0" class="caption-suggestions">
                <h4 class="suggestions-title">AI Suggestions</h4>
                <div class="suggestions-grid">
                  <v-chip
                    v-for="(suggestion, index) in captionSuggestions"
                    :key="index"
                    class="suggestion-chip"
                    @click="addSuggestion(suggestion)"
                  >
                    {{ suggestion }}
                  </v-chip>
                </div>
              </div>

              <!-- Hashtag Generator -->
              <div class="hashtag-generator">
                <v-text-field
                  v-model="hashtagQuery"
                  label="Generate hashtags..."
                  variant="outlined"
                  density="compact"
                  append-inner-icon="mdi-magnify"
                  @click:append-inner="generateHashtags"
                  @keyup.enter="generateHashtags"
                ></v-text-field>
                
                <div v-if="recommendedHashtags.length > 0" class="hashtag-recommendations">
                  <h4 class="hashtags-title">Recommended Hashtags</h4>
                  <div class="hashtags-grid">
                    <v-chip
                      v-for="(hashtag, index) in recommendedHashtags"
                      :key="index"
                      class="hashtag-chip"
                      :color="hashtag.selected ? 'primary' : 'secondary'"
                      :variant="hashtag.selected ? 'flat' : 'outlined'"
                      @click="toggleHashtag(hashtag)"
                    >
                      #{{ hashtag.name }}
                      <v-icon end size="16">{{ hashtag.selected ? 'mdi-check' : 'mdi-plus' }}</v-icon>
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Scheduling Section -->
          <v-card class="scheduling-card" elevation="2" data-aos="fade-up" data-aos-delay="400">
            <v-card-title>
              <h3>Schedule Post</h3>
              <p class="scheduling-subtitle">Choose when to publish your content</p>
            </v-card-title>
            <v-card-text>
              <v-radio-group v-model="scheduleType" class="schedule-options">
                <v-radio
                  value="now"
                  label="Publish Now"
                  class="schedule-option"
                ></v-radio>
                <v-radio
                  value="scheduled"
                  label="Schedule for Later"
                  class="schedule-option"
                ></v-radio>
                <v-radio
                  value="optimal"
                  label="AI Optimal Time"
                  class="schedule-option"
                ></v-radio>
              </v-radio-group>

              <div v-if="scheduleType === 'scheduled'" class="schedule-details">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="scheduleDate"
                      label="Date"
                      type="date"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="scheduleTime"
                      label="Time"
                      type="time"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <div v-if="scheduleType === 'optimal'" class="optimal-time-info">
                <v-alert
                  type="info"
                  variant="tonal"
                  class="optimal-alert"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-lightbulb"></v-icon>
                  </template>
                  <div class="optimal-content">
                    <div class="optimal-title">AI Recommendation</div>
                    <div class="optimal-text">
                      Best time to post: <strong>Today at 6:30 PM</strong>
                      <br>
                      Based on your audience activity and engagement patterns
                    </div>
                  </div>
                </v-alert>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Preview & Settings Sidebar -->
        <v-col cols="12" lg="4">
          <!-- Instagram Preview -->
          <v-card class="preview-card mb-6" elevation="2" data-aos="fade-up" data-aos-delay="600">
            <v-card-title>
              <h3>Instagram Preview</h3>
              <p class="preview-subtitle">See how your post will look</p>
            </v-card-title>
            <v-card-text>
              <div class="instagram-preview">
                <div class="preview-header">
                  <div class="preview-account">
                    <v-avatar size="32">
                      <v-img :src="selectedAccount.avatar"></v-img>
                    </v-avatar>
                    <div class="account-info">
                      <div class="account-name">{{ selectedAccount.name }}</div>
                      <div class="account-location">{{ postLocation || 'Add location...' }}</div>
                    </div>
                  </div>
                  <v-btn icon="mdi-dots-horizontal" size="small" variant="text"></v-btn>
                </div>

                <div class="preview-media">
                  <v-img
                    v-if="uploadedMedia.length > 0"
                    :src="uploadedMedia[0].url"
                    class="preview-image"
                    aspect-ratio="1"
                  ></v-img>
                  <div v-else class="preview-placeholder">
                    <v-icon icon="mdi-image" size="60"></v-icon>
                    <span>No media uploaded</span>
                  </div>
                </div>

                <div class="preview-actions">
                  <div class="action-buttons">
                    <v-btn icon="mdi-heart-outline" variant="text"></v-btn>
                    <v-btn icon="mdi-comment-outline" variant="text"></v-btn>
                    <v-btn icon="mdi-share-outline" variant="text"></v-btn>
                  </div>
                  <v-btn icon="mdi-bookmark-outline" variant="text"></v-btn>
                </div>

                <div class="preview-caption">
                  <div class="caption-text">
                    <strong>{{ selectedAccount.name }}</strong>
                    {{ postCaption || 'Write your caption...' }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Account Selection -->
          <v-card class="account-card mb-6" elevation="2" data-aos="fade-up" data-aos-delay="800">
            <v-card-title>
              <h3>Select Account</h3>
            </v-card-title>
            <v-card-text>
              <div class="account-options">
                <div
                  v-for="account in accounts"
                  :key="account.id"
                  class="account-option"
                  :class="{ active: selectedAccount.id === account.id }"
                  @click="selectAccount(account)"
                >
                  <v-avatar size="40">
                    <v-img :src="account.avatar"></v-img>
                  </v-avatar>
                  <div class="account-details">
                    <div class="account-username">@{{ account.username }}</div>
                    <div class="account-followers">{{ account.followers }} followers</div>
                  </div>
                  <v-icon
                    v-if="selectedAccount.id === account.id"
                    icon="mdi-check-circle"
                    color="primary"
                  ></v-icon>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Advanced Settings -->
          <v-card class="settings-card" elevation="2" data-aos="fade-up" data-aos-delay="1000">
            <v-card-title>
              <h3>Advanced Settings</h3>
            </v-card-title>
            <v-card-text>
              <div class="settings-options">
                <v-text-field
                  v-model="postLocation"
                  label="Location"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-map-marker"
                  class="mb-4"
                ></v-text-field>

                <v-switch
                  v-model="allowComments"
                  label="Allow Comments"
                  color="primary"
                  class="mb-2"
                ></v-switch>

                <v-switch
                  v-model="allowSharing"
                  label="Allow Sharing"
                  color="primary"
                  class="mb-2"
                ></v-switch>

                <v-switch
                  v-model="hideLikeCount"
                  label="Hide Like Count"
                  color="primary"
                  class="mb-4"
                ></v-switch>

                <v-select
                  v-model="postAudience"
                  :items="audienceOptions"
                  label="Audience"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Hidden File Input -->
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
import { ref, computed, onMounted } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Reactive data
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedMedia = ref<any[]>([])
const selectedMediaIndex = ref(0)
const activeMediaTool = ref('filters')
const selectedFilter = ref('none')
const selectedAspectRatio = ref('1:1')
const postCaption = ref('')
const hashtagQuery = ref('')
const scheduleType = ref('now')
const scheduleDate = ref('')
const scheduleTime = ref('')
const postLocation = ref('')
const allowComments = ref(true)
const allowSharing = ref(true)
const hideLikeCount = ref(false)
const postAudience = ref('public')

// Form validation rules
const rules = {
  maxLength: (value: string) => value.length <= 2200 || 'Caption must be less than 2200 characters'
}

// Image filters
const imageFilters = ref([
  { name: 'None', css: 'none' },
  { name: 'Vintage', css: 'sepia(0.8) contrast(1.2) brightness(0.9)' },
  { name: 'Dramatic', css: 'contrast(1.5) brightness(0.8) saturate(1.2)' },
  { name: 'Warm', css: 'sepia(0.3) saturate(1.3) hue-rotate(15deg)' },
  { name: 'Cool', css: 'hue-rotate(200deg) saturate(1.2) brightness(1.1)' },
  { name: 'B&W', css: 'grayscale(1) contrast(1.2)' }
])

// AI enhancements
const aiEnhancements = ref([
  { name: 'Auto Enhance', icon: 'mdi-auto-fix', active: false },
  { name: 'Noise Reduction', icon: 'mdi-blur-off', active: false },
  { name: 'Sharpen', icon: 'mdi-image-filter-center-focus', active: false },
  { name: 'Color Boost', icon: 'mdi-palette', active: false }
])

// Caption suggestions
const captionSuggestions = ref([
  'Living my best life ✨',
  'Adventure awaits 🌟',
  'Grateful for this moment 🙏',
  'Sunshine and good vibes ☀️',
  'Making memories 📸'
])

// Recommended hashtags
const recommendedHashtags = ref([
  { name: 'instagram', selected: false },
  { name: 'photography', selected: false },
  { name: 'lifestyle', selected: false },
  { name: 'travel', selected: false },
  { name: 'inspiration', selected: false },
  { name: 'beautiful', selected: false },
  { name: 'amazing', selected: false },
  { name: 'photooftheday', selected: false }
])

// Accounts
const accounts = ref([
  {
    id: 1,
    username: 'sarah_travels',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    followers: '25.8K'
  },
  {
    id: 2,
    username: 'sarah_fitness',
    name: 'Sarah Fitness',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    followers: '18.3K'
  },
  {
    id: 3,
    username: 'sarah_food',
    name: 'Sarah Eats',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    followers: '12.1K'
  }
])

const selectedAccount = ref(accounts.value[0])

// Options
const audienceOptions = ref([
  { title: 'Public', value: 'public' },
  { title: 'Followers Only', value: 'followers' },
  { title: 'Close Friends', value: 'close_friends' }
])

// Computed properties
const hashtagCount = computed(() => {
  const matches = postCaption.value.match(/#\w+/g)
  return matches ? matches.length : 0
})

// Methods
const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    handleFiles(Array.from(files))
  }
}

const handleFileDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files) {
    handleFiles(Array.from(files))
  }
}

const handleFiles = (files: File[]) => {
  files.forEach(file => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      uploadedMedia.value.push({
        file,
        url,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      })
    }
  })
}

const selectMedia = (index: number) => {
  selectedMediaIndex.value = index
}

const editMedia = (index: number) => {
  console.log('Edit media:', index)
}

const removeMedia = (index: number) => {
  uploadedMedia.value.splice(index, 1)
  if (selectedMediaIndex.value >= uploadedMedia.value.length) {
    selectedMediaIndex.value = Math.max(0, uploadedMedia.value.length - 1)
  }
}

const openMediaLibrary = () => {
  console.log('Open media library')
}

const applyFilter = (filterName: string) => {
  selectedFilter.value = filterName
  console.log('Apply filter:', filterName)
}

const toggleEnhancement = (enhancement: any) => {
  enhancement.active = !enhancement.active
  console.log('Toggle enhancement:', enhancement.name, enhancement.active)
}

const generateCaption = () => {
  console.log('Generate caption with AI')
  // Simulate AI generation
  const suggestions = [
    'Captured this amazing moment today! ✨ #photooftheday #inspiration',
    'Living life to the fullest! 🌟 What makes you smile today?',
    'Grateful for beautiful days like this 🙏 #blessed #lifestyle'
  ]
  postCaption.value = suggestions[Math.floor(Math.random() * suggestions.length)]
}

const addSuggestion = (suggestion: string) => {
  postCaption.value += (postCaption.value ? ' ' : '') + suggestion
}

const generateHashtags = () => {
  console.log('Generate hashtags for:', hashtagQuery.value)
  // Simulate hashtag generation based on query
  const newHashtags = [
    { name: hashtagQuery.value.toLowerCase(), selected: false },
    { name: `${hashtagQuery.value}life`, selected: false },
    { name: `${hashtagQuery.value}vibes`, selected: false }
  ]
  recommendedHashtags.value.unshift(...newHashtags)
  hashtagQuery.value = ''
}

const toggleHashtag = (hashtag: any) => {
  hashtag.selected = !hashtag.selected
  if (hashtag.selected) {
    postCaption.value += ` #${hashtag.name}`
  } else {
    postCaption.value = postCaption.value.replace(` #${hashtag.name}`, '')
  }
}

const selectAccount = (account: any) => {
  selectedAccount.value = account
}

const saveDraft = () => {
  console.log('Save draft')
}

const publishPost = () => {
  console.log('Publish post')
  console.log({
    media: uploadedMedia.value,
    caption: postCaption.value,
    account: selectedAccount.value,
    schedule: scheduleType.value,
    settings: {
      location: postLocation.value,
      allowComments: allowComments.value,
      allowSharing: allowSharing.value,
      hideLikeCount: hideLikeCount.value,
      audience: postAudience.value
    }
  })
}

// Lifecycle
onMounted(() => {
  AOS.init({
    duration: 600,
    easing: 'ease-out-cubic',
    once: true
  })
})
</script>

<style scoped>
.modern-post-creator {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* Header */
.creator-header {
  background: white;
  padding: 2rem 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.page-subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0.5rem 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.save-draft-btn, .publish-btn {
  font-weight: 600;
  border-radius: 25px;
  padding: 12px 24px;
}

.publish-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.publish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
}

/* Media Upload Card */
.media-upload-card {
  background: white;
  border-radius: 20px;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.upload-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.upload-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.upload-dropzone {
  border: 2px dashed #e0e0e0;
  border-radius: 15px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.upload-dropzone:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  margin-bottom: 1rem;
}

.dropzone-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.dropzone-subtitle {
  color: #7f8c8d;
  margin: 0;
}

.upload-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px;
  padding: 12px 24px;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
}

.media-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.media-item:hover {
  transform: scale(1.05);
}

.media-item.active {
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.media-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.media-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-play-icon {
  position: absolute;
  color: white;
  font-size: 3rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  padding: 0.5rem;
}

.media-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.primary-badge {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.add-media-item {
  aspect-ratio: 1;
  border: 2px dashed #e0e0e0;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #7f8c8d;
}

.add-media-item:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f0f4ff;
}

/* Media Tools */
.media-tools {
  margin-top: 2rem;
  border-top: 1px solid #f0f0f0;
  padding-top: 2rem;
}

.media-tools-tabs {
  margin-bottom: 1rem;
}

.tools-content {
  min-height: 200px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
}

.filter-option {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 10px;
}

.filter-option:hover {
  background: #f0f0f0;
}

.filter-option.active {
  background: #e3f2fd;
  color: #1976d2;
}

.filter-preview {
  margin-bottom: 0.5rem;
}

.filter-thumbnail {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.filter-name {
  font-size: 0.85rem;
  font-weight: 500;
}

.aspect-ratios {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.enhance-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.enhance-btn {
  border-radius: 25px;
  font-weight: 600;
}

/* Caption Card */
.caption-card {
  background: white;
  border-radius: 20px;
}

.caption-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.caption-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.caption-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.caption-textarea {
  font-size: 1.1rem;
}

.caption-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #7f8c8d;
}

.caption-suggestions {
  margin-top: 1rem;
}

.suggestions-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-chip {
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-chip:hover {
  transform: translateY(-2px);
}

.hashtag-generator {
  margin-top: 1.5rem;
}

.hashtags-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 1rem 0 0.75rem;
}

.hashtags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hashtag-chip {
  cursor: pointer;
  transition: all 0.3s ease;
}

.hashtag-chip:hover {
  transform: translateY(-2px);
}

/* Scheduling Card */
.scheduling-card {
  background: white;
  border-radius: 20px;
}

.scheduling-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.scheduling-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.schedule-options {
  margin: 1rem 0;
}

.schedule-option {
  margin-bottom: 0.5rem;
}

.schedule-details {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.optimal-time-info {
  margin-top: 1rem;
}

.optimal-alert {
  border-radius: 15px;
}

.optimal-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Preview Card */
.preview-card {
  background: white;
  border-radius: 20px;
  position: sticky;
  top: 2rem;
}

.preview-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.preview-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.instagram-preview {
  background: #fafafa;
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
}

.preview-account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.account-info {
  display: flex;
  flex-direction: column;
}

.account-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #2c3e50;
}

.account-location {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.preview-media {
  position: relative;
  aspect-ratio: 1;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #bbb;
  background: #f0f0f0;
}

.preview-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: white;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.preview-caption {
  padding: 0 1rem 1rem;
  background: white;
}

.caption-text {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #2c3e50;
}

/* Account Card */
.account-card {
  background: white;
  border-radius: 20px;
  position: sticky;
  top: calc(2rem + 400px);
}

.account-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.account-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 15px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.account-option:hover {
  background: #e9ecef;
}

.account-option.active {
  background: #e3f2fd;
  border: 2px solid #1976d2;
}

.account-details {
  flex: 1;
}

.account-username {
  font-weight: 600;
  color: #2c3e50;
}

.account-followers {
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* Settings Card */
.settings-card {
  background: white;
  border-radius: 20px;
  position: sticky;
  top: calc(2rem + 600px);
}

.settings-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.settings-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .creator-header {
    padding: 1rem 0;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .filter-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  
  .enhance-options {
    justify-content: flex-start;
  }
  
  .preview-card,
  .account-card,
  .settings-card {
    position: relative;
    top: auto;
  }
  
  .caption-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>