<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        Instagram アカウントを追加
      </v-card-title>

      <v-card-text>
        <v-stepper v-model="currentStep" alt-labels>
          <v-stepper-header>
            <v-stepper-item
              :complete="currentStep > 1"
              :value="1"
              title="アクセストークン"
            />
            <v-divider />
            <v-stepper-item
              :complete="currentStep > 2"
              :value="2"
              title="アカウント確認"
            />
            <v-divider />
            <v-stepper-item
              :value="3"
              title="完了"
            />
          </v-stepper-header>

          <v-stepper-window>
            <!-- ステップ1: アクセストークン入力 -->
            <v-stepper-window-item :value="1">
              <v-form ref="tokenFormRef" v-model="isTokenFormValid">
                <div class="mb-4">
                  <h3 class="text-h6 font-weight-bold mb-2">
                    Instagram アクセストークンを入力
                  </h3>
                  <p class="text-body-2 text-grey-darken-1 mb-4">
                    Instagram Graph API のアクセストークンが必要です。<br>
                    Meta for Developers で取得してください。
                  </p>
                </div>

                <v-textarea
                  v-model="form.accessToken"
                  label="アクセストークン *"
                  :rules="[rules.required]"
                  placeholder="IGQVJ..."
                  variant="outlined"
                  rows="3"
                  class="mb-4"
                />

                <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-4"
                >
                  <div class="text-body-2">
                    <strong>アクセストークンの取得方法:</strong><br>
                    1. Meta for Developers にアクセス<br>
                    2. アプリを作成し、Instagram Graph API を有効化<br>
                    3. 長期有効トークンを生成<br>
                    4. 上記のフィールドに貼り付け
                  </div>
                </v-alert>
              </v-form>
            </v-stepper-window-item>

            <!-- ステップ2: アカウント確認 -->
            <v-stepper-window-item :value="2">
              <div v-if="userInfo">
                <h3 class="text-h6 font-weight-bold mb-4">
                  アカウント情報を確認
                </h3>

                <v-card variant="outlined" class="mb-4">
                  <v-card-text>
                    <div class="d-flex align-center">
                      <v-icon size="48" color="pink" class="mr-4">
                        mdi-instagram
                      </v-icon>
                      <div>
                        <div class="text-h6 font-weight-bold">
                          @{{ userInfo.username }}
                        </div>
                        <div class="text-body-2 text-grey-darken-1">
                          ID: {{ userInfo.instagramUserId }}
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <v-alert
                  type="success"
                  variant="tonal"
                  class="mb-4"
                >
                  アカウント情報を正常に取得しました。<br>
                  このアカウントを追加してもよろしいですか？
                </v-alert>
              </div>

              <div v-else-if="loading">
                <div class="text-center py-8">
                  <v-progress-circular
                    indeterminate
                    size="64"
                    color="primary"
                    class="mb-4"
                  />
                  <div class="text-h6">
                    アカウント情報を取得中...
                  </div>
                </div>
              </div>
            </v-stepper-window-item>

            <!-- ステップ3: 完了 -->
            <v-stepper-window-item :value="3">
              <div class="text-center py-8">
                <v-icon
                  size="80"
                  color="success"
                  class="mb-4"
                >
                  mdi-check-circle
                </v-icon>
                <h3 class="text-h6 font-weight-bold mb-2">
                  アカウントを追加しました！
                </h3>
                <p class="text-body-1 text-grey-darken-1">
                  Instagram アカウント「@{{ userInfo?.username }}」が<br>
                  正常に追加されました。
                </p>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        
        <!-- ステップ1のボタン -->
        <template v-if="currentStep === 1">
          <v-btn
            variant="text"
            @click="handleCancel"
          >
            キャンセル
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="handleNext"
            :loading="loading"
            :disabled="!isTokenFormValid"
          >
            次へ
          </v-btn>
        </template>

        <!-- ステップ2のボタン -->
        <template v-if="currentStep === 2">
          <v-btn
            variant="text"
            @click="currentStep = 1"
            :disabled="loading"
          >
            戻る
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="handleAddAccount"
            :loading="loading"
          >
            アカウントを追加
          </v-btn>
        </template>

        <!-- ステップ3のボタン -->
        <template v-if="currentStep === 3">
          <v-btn
            color="primary"
            variant="flat"
            @click="handleComplete"
          >
            完了
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useIgAccountsStore } from '@/stores/igAccounts'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'added'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const igAccountsStore = useIgAccountsStore()

// State
const currentStep = ref(1)
const tokenFormRef = ref()
const isTokenFormValid = ref(false)
const loading = ref(false)
const userInfo = ref<any>(null)

// Form data
const form = ref({
  accessToken: ''
})

// Validation rules
const rules = {
  required: (value: string) => !!value || '必須項目です'
}

// Methods
const resetForm = () => {
  form.value = {
    accessToken: ''
  }
  currentStep.value = 1
  userInfo.value = null
  if (tokenFormRef.value) {
    tokenFormRef.value.resetValidation()
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
  nextTick(() => {
    resetForm()
  })
}

const handleNext = async () => {
  if (!isTokenFormValid.value) return

  try {
    loading.value = true
    
    // Instagram ユーザー情報を取得
    userInfo.value = await igAccountsStore.getInstagramUserInfo(form.value.accessToken)
    
    currentStep.value = 2
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error)
    // エラーはストアで管理されているため、ここでは何もしない
  } finally {
    loading.value = false
  }
}

const handleAddAccount = async () => {
  if (!userInfo.value) return

  try {
    loading.value = true

    await igAccountsStore.addAccount({
      accessToken: form.value.accessToken,
      instagramUserId: userInfo.value.instagramUserId,
      username: userInfo.value.username
    })

    currentStep.value = 3
  } catch (error) {
    console.error('アカウント追加エラー:', error)
    // エラーはストアで管理されているため、ここでは何もしない
  } finally {
    loading.value = false
  }
}

const handleComplete = () => {
  emit('added')
  emit('update:modelValue', false)
  nextTick(() => {
    resetForm()
  })
}

// Watch for dialog open/close
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    nextTick(() => {
      resetForm()
    })
  }
})
</script>

<style scoped>
.v-card {
  overflow-y: auto;
  max-height: 90vh;
}
</style> 