<template>
  <v-container class="pa-6">
    <!-- ヘッダー -->
    <div class="text-center mb-8">
      <h1 class="text-h3 font-weight-bold mb-4">料金プラン</h1>
      <p class="text-h6 text-medium-emphasis">
        あなたのニーズに合ったプランを選択してください
      </p>
    </div>

    <!-- 現在のサブスクリプション情報 -->
    <v-card v-if="currentSubscription" class="mb-8" elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2" color="primary">mdi-crown</v-icon>
        現在のプラン
      </v-card-title>
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <div class="text-h5 font-weight-bold">
              {{ currentPlan?.name || 'Free' }}プラン
            </div>
            <div class="text-body-1 text-medium-emphasis">
              {{ currentPlan?.description || 'フリープランをご利用中です' }}
            </div>
            <div v-if="!isFreePlan" class="text-body-2 mt-2">
              <div>次回更新日: {{ formatDate(currentSubscription.currentPeriodEnd) }}</div>
              <div v-if="currentSubscription.cancelAtPeriodEnd" class="text-warning">
                <v-icon size="small" class="me-1">mdi-alert</v-icon>
                期間終了時にキャンセル予定
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="text-md-end">
            <div v-if="!isFreePlan" class="text-h4 font-weight-bold text-primary">
              {{ formatPrice(currentPlan?.price || 0) }}/月
            </div>
            <div class="mt-2">
              <v-btn
                v-if="canCancel"
                variant="outlined"
                color="warning"
                class="me-2"
                @click="handleCancelSubscription"
                :loading="loading"
              >
                プランをキャンセル
              </v-btn>
              <v-btn
                v-if="canResume"
                variant="outlined"
                color="success"
                class="me-2"
                @click="handleResumeSubscription"
                :loading="loading"
              >
                キャンセルを取り消し
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- プラン一覧 -->
    <v-row>
      <v-col
        v-for="plan in plans"
        :key="plan.id"
        cols="12"
        md="6"
        lg="3"
      >
        <v-card
          :class="{
            'border-primary': currentSubscription?.planId === plan.planId,
            'elevation-8': currentSubscription?.planId === plan.planId
          }"
          class="h-100 d-flex flex-column"
          elevation="2"
        >
          <!-- プランヘッダー -->
          <v-card-title class="text-center pa-6">
            <div class="w-100">
              <div class="text-h4 font-weight-bold">{{ plan.name }}</div>
              <div class="text-h3 font-weight-bold text-primary mt-2">
                {{ plan.planId === 'free' ? '無料' : formatPrice(plan.price) }}
                <span v-if="plan.planId !== 'free'" class="text-body-1">/月</span>
              </div>
              <div class="text-body-2 text-medium-emphasis mt-2">
                {{ plan.description }}
              </div>
            </div>
          </v-card-title>

          <!-- 現在のプランバッジ -->
          <div v-if="currentSubscription?.planId === plan.planId" class="text-center">
            <v-chip color="primary" variant="flat" size="small">
              <v-icon start>mdi-check</v-icon>
              現在のプラン
            </v-chip>
          </div>

          <!-- 機能一覧 -->
          <v-card-text class="flex-grow-1">
            <v-list density="compact">
              <v-list-item
                v-for="feature in getPlanFeatureText(plan)"
                :key="feature"
                class="px-0"
              >
                <template #prepend>
                  <v-icon color="success" size="small">mdi-check</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ feature }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>

          <!-- アクションボタン -->
          <v-card-actions class="pa-6">
            <v-btn
              v-if="plan.planId === 'free'"
              block
              variant="outlined"
              disabled
            >
              現在のプラン
            </v-btn>
            <v-btn
              v-else-if="currentSubscription?.planId === plan.planId"
              block
              variant="outlined"
              disabled
            >
              現在のプラン
            </v-btn>
            <v-btn
              v-else
              block
              color="primary"
              variant="flat"
              @click="handleUpgrade(plan.planId)"
              :loading="loading"
            >
              このプランを選択
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 決済履歴 -->
    <v-card v-if="!isFreePlan" class="mt-8" elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-receipt</v-icon>
        決済履歴
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="paymentHeaders"
          :items="paymentHistory"
          :loading="loading"
          no-data-text="決済履歴がありません"
          loading-text="読み込み中..."
        >
          <template #item.amount="{ item }">
            {{ formatPrice(item.amount) }}
          </template>
          <template #item.status="{ item }">
            <v-chip
              :color="getPaymentStatusColor(item.status)"
              size="small"
              variant="flat"
            >
              {{ getPaymentStatusText(item.status) }}
            </v-chip>
          </template>
          <template #item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- エラー表示 -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
    >
      {{ error }}
      <template #actions>
        <v-btn variant="text" @click="clearError">
          閉じる
        </v-btn>
      </template>
    </v-snackbar>

    <!-- 成功メッセージ -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
    </v-snackbar>

    <!-- キャンセル確認ダイアログ -->
    <v-dialog v-model="showCancelDialog" max-width="500">
      <v-card>
        <v-card-title>プランのキャンセル</v-card-title>
        <v-card-text>
          <p>本当にプランをキャンセルしますか？</p>
          <p class="text-body-2 text-medium-emphasis">
            現在の請求期間の終了時（{{ formatDate(currentSubscription?.currentPeriodEnd) }}）まで
            サービスをご利用いただけます。その後、Freeプランに自動的に変更されます。
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCancelDialog = false">
            キャンセル
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            @click="confirmCancelSubscription"
            :loading="loading"
          >
            キャンセルする
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useBillingStore } from '@/stores/billing'

const billingStore = useBillingStore()

// State
const showError = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const showCancelDialog = ref(false)

// Computed
const {
  plans,
  currentSubscription,
  currentPlan,
  paymentHistory,
  loading,
  error,
  isFreePlan,
  canCancel,
  canResume,
  formatPrice,
  formatDate,
  getPlanFeatureText
} = billingStore

// 決済履歴テーブルヘッダー
const paymentHeaders = [
  { title: '日付', key: 'createdAt', sortable: true },
  { title: 'プラン', key: 'planId', sortable: false },
  { title: '金額', key: 'amount', sortable: true },
  { title: 'ステータス', key: 'status', sortable: false },
  { title: '説明', key: 'description', sortable: false },
]

// Watchers
const errorWatcher = computed(() => error)
watch(errorWatcher, (newError) => {
  if (newError) {
    showError.value = true
  }
})

// Methods
const handleUpgrade = async (planId: string) => {
  try {
    await billingStore.createCheckoutSession(planId)
  } catch (err) {
    console.error('Failed to start checkout:', err)
  }
}

const handleCancelSubscription = () => {
  showCancelDialog.value = true
}

const confirmCancelSubscription = async () => {
  try {
    const message = await billingStore.cancelSubscription()
    showCancelDialog.value = false
    successMessage.value = message
    showSuccess.value = true
  } catch (err) {
    console.error('Failed to cancel subscription:', err)
  }
}

const handleResumeSubscription = async () => {
  try {
    const message = await billingStore.resumeSubscription()
    successMessage.value = message
    showSuccess.value = true
  } catch (err) {
    console.error('Failed to resume subscription:', err)
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'succeeded': return 'success'
    case 'failed': return 'error'
    case 'pending': return 'warning'
    default: return 'grey'
  }
}

const getPaymentStatusText = (status: string) => {
  switch (status) {
    case 'succeeded': return '成功'
    case 'failed': return '失敗'
    case 'pending': return '処理中'
    default: return status
  }
}

const clearError = () => {
  billingStore.clearError()
  showError.value = false
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    billingStore.fetchPlans(),
    billingStore.fetchSubscription()
  ])
  
  if (!isFreePlan) {
    await billingStore.fetchPaymentHistory()
  }
})
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}

.border-primary {
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}
</style> 