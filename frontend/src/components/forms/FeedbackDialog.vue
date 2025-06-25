<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
    persistent
  >
    <v-card class="feedback-dialog">
      <v-card-title class="d-flex align-center pa-6">
        <div class="feedback-icon">
          <v-icon size="40" color="white">mdi-heart</v-icon>
        </div>
        <div class="ms-4">
          <h2 class="text-h5 text-white mb-1">フィードバックを送る</h2>
          <p class="text-white mb-0 opacity-80">ご意見・ご要望をお聞かせください</p>
        </div>
        <v-spacer />
        <v-btn 
          icon 
          variant="text" 
          color="white"
          @click="handleClose"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pb-6">
        <v-form ref="form" @submit.prevent="handleSubmit">
          <!-- Rating Section -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3 text-white">満足度を教えてください</h3>
            <div class="text-center mb-2">
              <span class="text-white opacity-60">満足</span>
            </div>
            <div class="d-flex justify-center align-center mb-2">
              <v-btn
                v-for="star in 5"
                :key="star"
                icon
                variant="text"
                size="large"
                @click="setRating(star)"
                class="star-button"
              >
                <v-icon 
                  size="32"
                  :color="star <= rating ? '#FFD700' : '#666'"
                >
                  {{ star <= rating ? 'mdi-star' : 'mdi-star-outline' }}
                </v-icon>
              </v-btn>
            </div>
          </div>

          <!-- Comment Section -->
          <div class="mb-6">
            <h3 class="text-h6 mb-3 text-white">詳細なご意見・ご要望</h3>
            <span class="text-caption text-white opacity-60">(任意)</span>
            <v-textarea
              v-model="comment"
              placeholder="ちょっと出力結果が一定でないです。"
              variant="outlined"
              rows="6"
              counter="500"
              maxlength="500"
              hide-details="auto"
              class="mt-2 feedback-textarea"
              bg-color="rgba(255,255,255,0.1)"
              color="white"
            />
            <div class="text-end mt-1">
              <span class="text-caption text-white opacity-60">
                {{ comment.length }} / 500
              </span>
            </div>
          </div>

          <!-- Submit Button -->
          <v-btn
            type="submit"
            block
            size="large"
            class="submit-button"
            :loading="loading"
            :disabled="rating === 0"
          >
            <v-icon start>mdi-send</v-icon>
            送信する
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFeedbackStore } from '@/stores/feedback'
import { useNotification } from '@/composables/useNotification'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const feedbackStore = useFeedbackStore()
const { showNotification } = useNotification()

const form = ref()
const rating = ref(0)
const comment = ref('')
const loading = ref(false)

const setRating = (value: number) => {
  rating.value = value
}

const handleSubmit = async () => {
  if (rating.value === 0) {
    showNotification('評価を選択してください', 'warning')
    return
  }

  loading.value = true
  
  try {
    await feedbackStore.submitFeedback({
      rating: rating.value,
      comment: comment.value,
      timestamp: new Date(),
      page: window.location.pathname
    })
    
    showNotification('フィードバックを送信しました。ありがとうございます！', 'success')
    handleClose()
  } catch (error) {
    console.error('フィードバック送信エラー:', error)
    showNotification('送信に失敗しました。再度お試しください。', 'error')
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  rating.value = 0
  comment.value = ''
  loading.value = false
}

// Reset form when dialog closes
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>

<style scoped>
.feedback-dialog {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  overflow: hidden;
}

.feedback-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.star-button {
  transition: transform 0.2s ease;
}

.star-button:hover {
  transform: scale(1.1);
}

.feedback-textarea :deep(.v-field) {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.feedback-textarea :deep(.v-field__field) {
  color: white;
}

.feedback-textarea :deep(.v-field__outline) {
  color: rgba(255, 255, 255, 0.3);
}

.feedback-textarea :deep(.v-field--focused .v-field__outline) {
  color: rgba(255, 255, 255, 0.6);
}

.feedback-textarea :deep(.v-field__input::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.submit-button {
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-weight: 600;
  border-radius: 12px;
  text-transform: none;
  box-shadow: 0 4px 20px rgba(79, 172, 254, 0.3);
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(79, 172, 254, 0.4);
}

.submit-button:disabled {
  background: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.5) !important;
  transform: none !important;
  box-shadow: none !important;
}
</style>