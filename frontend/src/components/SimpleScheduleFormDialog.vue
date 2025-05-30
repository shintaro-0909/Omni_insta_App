<!--
  1人運営向け簡略化スケジュールフォーム
  70%機能削減・シンプルUI設計
-->
<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card class="simple-schedule-form">
      <!-- 📅 シンプルヘッダー -->
      <v-card-title class="text-h5 pa-4 text-center">
        <v-icon icon="mdi-calendar-plus" size="28" color="primary" class="mr-3" />
        投稿を予約する
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="form" v-model="valid">
          <!-- 📝 投稿内容 (必須) -->
          <div class="form-section">
            <div class="section-header">
              <v-icon icon="mdi-text" class="mr-2" />
              <span class="text-subtitle-1 font-weight-bold">投稿内容</span>
            </div>
            
            <v-textarea
              v-model="formData.caption"
              label="投稿内容"
              placeholder="投稿したい内容を入力してください..."
              rows="3"
              variant="outlined"
              :rules="captionRules"
              required
              counter="2200"
              class="mt-3"
            />
          </div>

          <!-- 📷 画像アップロード (必須) -->
          <div class="form-section mt-4">
            <div class="section-header">
              <v-icon icon="mdi-image" class="mr-2" />
              <span class="text-subtitle-1 font-weight-bold">画像</span>
            </div>
            
            <v-file-input
              v-model="formData.images"
              label="画像を選択 (最大10枚)"
              variant="outlined"
              multiple
              accept="image/*"
              :rules="imageRules"
              required
              prepend-icon=""
              prepend-inner-icon="mdi-camera"
              class="mt-3"
            >
              <template #selection="{ fileNames }">
                <v-chip
                  v-for="name in fileNames.slice(0, 3)"
                  :key="name"
                  color="primary"
                  size="small"
                  class="mr-2"
                >
                  {{ name }}
                </v-chip>
                <span
                  v-if="fileNames.length > 3"
                  class="text-grey darken-1"
                >
                  +{{ fileNames.length - 3 }} ファイル
                </span>
              </template>
            </v-file-input>
          </div>

          <!-- 📱 アカウント選択 (必須) -->
          <div class="form-section mt-4">
            <div class="section-header">
              <v-icon icon="mdi-instagram" class="mr-2" />
              <span class="text-subtitle-1 font-weight-bold">Instagramアカウント</span>
            </div>
            
            <v-select
              v-model="formData.accountId"
              :items="accountOptions"
              label="投稿するアカウントを選択"
              variant="outlined"
              :rules="accountRules"
              required
              class="mt-3"
            >
              <template #selection="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="24" class="mr-2">
                    <v-img :src="item.value.profilePicture" />
                  </v-avatar>
                  <span>{{ item.value.username }}</span>
                </div>
              </template>
              <template #item="{ item, props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-avatar size="32">
                      <v-img :src="item.value.profilePicture" />
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ item.value.username }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.value.name }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </div>

          <!-- ⏰ 投稿日時設定 (必須) -->
          <div class="form-section mt-4">
            <div class="section-header">
              <v-icon icon="mdi-clock" class="mr-2" />
              <span class="text-subtitle-1 font-weight-bold">投稿日時</span>
            </div>
            
            <v-row class="mt-3">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="scheduleDate"
                  label="投稿日"
                  type="date"
                  variant="outlined"
                  :rules="dateRules"
                  :min="minDate"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="scheduleTime"
                  label="投稿時刻"
                  type="time"
                  variant="outlined"
                  :rules="timeRules"
                  required
                />
              </v-col>
            </v-row>
          </div>

          <!-- 🔄 繰り返し設定 (オプション) -->
          <div class="form-section mt-4">
            <div class="section-header">
              <v-icon icon="mdi-repeat" class="mr-2" />
              <span class="text-subtitle-1 font-weight-bold">繰り返し設定</span>
              <v-spacer />
              <v-switch
                v-model="isRecurring"
                color="primary"
                density="compact"
                hide-details
              />
            </div>
            
            <v-expand-transition>
              <div v-if="isRecurring" class="mt-3">
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mb-3"
                >
                  毎週決まった曜日と時刻に自動投稿されます
                </v-alert>
                
                <div class="text-subtitle-2 mb-2">投稿する曜日を選択</div>
                <v-chip-group
                  v-model="selectedWeekdays"
                  multiple
                  color="primary"
                >
                  <v-chip
                    v-for="(day, index) in weekdays"
                    :key="index"
                    :value="index"
                    filter
                    variant="outlined"
                    size="small"
                  >
                    {{ day }}
                  </v-chip>
                </v-chip-group>
              </div>
            </v-expand-transition>
          </div>

          <!-- 🚫 複雑機能は削除 -->
          <!-- ランダム投稿、プロキシ設定、グループ設定、高度通知設定は非表示 -->

        </v-form>
      </v-card-text>

      <v-divider />

      <!-- 💾 アクションボタン -->
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          color="grey"
          @click="handleCancel"
          class="mr-2"
        >
          キャンセル
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!valid"
          @click="handleSave"
          class="px-6"
        >
          <v-icon icon="mdi-calendar-plus" class="mr-2" />
          予約する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useIgAccountsStore } from '@/stores/igAccounts'
import { useSchedulesStore } from '@/stores/schedules'

// Props & Emits
interface Props {
  modelValue: boolean
  editSchedule?: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': [schedule: any]
}>()

// Stores
const igAccountsStore = useIgAccountsStore()
const schedulesStore = useSchedulesStore()

// State
const form = ref<any>(null)
const valid = ref(false)
const loading = ref(false)
const isRecurring = ref(false)

// Form Data
const formData = ref({
  caption: '',
  images: [],
  accountId: '',
})

const scheduleDate = ref('')
const scheduleTime = ref('')
const selectedWeekdays = ref<number[]>([])

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const accountOptions = computed(() => {
  return igAccountsStore.accounts.map(account => ({
    title: account.username,
    value: account,
    profilePicture: account.profilePictureUrl || '/default-avatar.png'
  }))
})

const weekdays = ['日', '月', '火', '水', '木', '金', '土']

// Validation Rules
const captionRules = [
  (v: string) => !!v || '投稿内容は必須です',
  (v: string) => (v && v.length <= 2200) || '投稿内容は2200文字以内で入力してください'
]

const imageRules = [
  (v: File[]) => (v && v.length > 0) || '画像は必須です',
  (v: File[]) => (v && v.length <= 10) || '画像は最大10枚まで選択できます'
]

const accountRules = [
  (v: any) => !!v || 'Instagramアカウントを選択してください'
]

const dateRules = [
  (v: string) => !!v || '投稿日は必須です',
  (v: string) => {
    if (!v) return true
    const selected = new Date(v)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selected >= today || '過去の日付は選択できません'
  }
]

const timeRules = [
  (v: string) => !!v || '投稿時刻は必須です'
]

// Methods
const handleCancel = () => {
  resetForm()
  dialog.value = false
}

const handleSave = async () => {
  if (!form.value?.validate()) return

  loading.value = true
  
  try {
    const scheduleData = {
      caption: formData.value.caption,
      images: formData.value.images,
      accountId: formData.value.accountId,
      scheduledAt: new Date(`${scheduleDate.value}T${scheduleTime.value}`),
      isRecurring: isRecurring.value,
      weekdays: isRecurring.value ? selectedWeekdays.value : [],
      type: isRecurring.value ? 'recurring' : 'once'
    }

    const savedSchedule = await schedulesStore.createSchedule(scheduleData)
    
    emit('saved', savedSchedule)
    dialog.value = false
    resetForm()
  } catch (error) {
    console.error('スケジュール保存エラー:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    caption: '',
    images: [],
    accountId: '',
  }
  scheduleDate.value = ''
  scheduleTime.value = ''
  selectedWeekdays.value = []
  isRecurring.value = false
  form.value?.resetValidation()
}

// Watchers
watch(() => props.editSchedule, (schedule) => {
  if (schedule) {
    // 編集モードの場合は既存データを設定
    // (現在はシンプル実装なので新規作成のみ)
  }
})

// デフォルト値設定
watch(dialog, (open) => {
  if (open && accountOptions.value.length === 1) {
    // アカウントが1つしかない場合は自動選択
    formData.value.accountId = accountOptions.value[0].value
  }
})
</script>

<style scoped>
.simple-schedule-form {
  border-radius: 16px !important;
}

.form-section {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 16px;
  background: rgba(248, 249, 255, 0.5);
  transition: all 0.3s ease;
}

.form-section:hover {
  background: rgba(248, 249, 255, 0.8);
  border-color: rgba(102, 126, 234, 0.2);
}

.section-header {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 8px;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .simple-schedule-form {
    margin: 16px;
    border-radius: 12px !important;
  }
  
  .form-section {
    padding: 12px;
  }
}

/* アニメーション */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>