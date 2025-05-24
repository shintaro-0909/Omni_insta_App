<template>
  <v-card elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2" color="primary">mdi-chart-donut</v-icon>
      使用量ダッシュボード
      <v-spacer />
      <v-btn
        icon="mdi-refresh"
        variant="text"
        size="small"
        @click="refreshUsage"
        :loading="loading"
      />
    </v-card-title>

    <v-card-text>
      <div v-if="loading && !limits" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" />
        <div class="mt-2">使用量を読み込み中...</div>
      </div>

      <div v-else-if="error" class="text-center py-4">
        <v-icon color="error" size="48">mdi-alert-circle</v-icon>
        <div class="mt-2 text-error">{{ error }}</div>
        <v-btn
          variant="outlined"
          color="primary"
          class="mt-2"
          @click="refreshUsage"
        >
          再試行
        </v-btn>
      </div>

      <div v-else-if="limits && usage">
        <!-- プラン情報 -->
        <div class="mb-4">
          <v-chip
            :color="isUnlimited ? 'success' : 'primary'"
            variant="flat"
            size="small"
          >
            <v-icon start>mdi-crown</v-icon>
            {{ getPlanName() }}プラン
          </v-chip>
        </div>

        <!-- 使用量メトリクス -->
        <v-row>
          <!-- Instagramアカウント使用量 -->
          <v-col cols="12" md="6">
            <div class="usage-metric">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-subtitle-2 font-weight-medium">
                  <v-icon size="small" class="me-1">mdi-instagram</v-icon>
                  Instagramアカウント
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ accountUsageText }}
                </div>
              </div>
              
              <v-progress-linear
                :model-value="accountUsagePercentage"
                :color="accountUsageColor"
                height="8"
                rounded
                class="mb-2"
              />
              
              <div class="text-caption text-medium-emphasis">
                <span v-if="limits.instagramAccountLimit === -1">
                  無制限でアカウントを追加できます
                </span>
                <span v-else-if="canAddAccount">
                  あと{{ limits.instagramAccountLimit - usage.instagramAccountCount }}個追加できます
                </span>
                <span v-else class="text-warning">
                  アカウント追加の上限に達しています
                </span>
              </div>
            </div>
          </v-col>

          <!-- 月間投稿数使用量 -->
          <v-col cols="12" md="6">
            <div class="usage-metric">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-subtitle-2 font-weight-medium">
                  <v-icon size="small" class="me-1">mdi-calendar-month</v-icon>
                  月間投稿数
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ postUsageText }}
                </div>
              </div>
              
              <v-progress-linear
                :model-value="postUsagePercentage"
                :color="postUsageColor"
                height="8"
                rounded
                class="mb-2"
              />
              
              <div class="text-caption text-medium-emphasis">
                <span v-if="limits.monthlyPostLimit === -1">
                  無制限で投稿できます
                </span>
                <span v-else-if="canPost">
                  あと{{ limits.monthlyPostLimit - usage.monthlyPostCount }}回投稿できます
                </span>
                <span v-else class="text-warning">
                  月間投稿数の上限に達しています
                </span>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- 機能制限表示 -->
        <v-divider class="my-4" />
        
        <div class="mb-3">
          <div class="text-subtitle-2 font-weight-medium mb-2">
            <v-icon size="small" class="me-1">mdi-feature-search</v-icon>
            利用可能な機能
          </div>
          
          <v-row dense>
            <v-col cols="6" sm="4" md="3">
              <v-chip
                :color="limits.scheduledPosts ? 'success' : 'grey'"
                variant="flat"
                size="small"
                class="w-100"
              >
                <v-icon start size="small">
                  {{ limits.scheduledPosts ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
                予約投稿
              </v-chip>
            </v-col>
            
            <v-col cols="6" sm="4" md="3">
              <v-chip
                :color="limits.recurringPosts ? 'success' : 'grey'"
                variant="flat"
                size="small"
                class="w-100"
              >
                <v-icon start size="small">
                  {{ limits.recurringPosts ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
                繰り返し投稿
              </v-chip>
            </v-col>
            
            <v-col cols="6" sm="4" md="3">
              <v-chip
                :color="limits.randomPosts ? 'success' : 'grey'"
                variant="flat"
                size="small"
                class="w-100"
              >
                <v-icon start size="small">
                  {{ limits.randomPosts ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
                ランダム投稿
              </v-chip>
            </v-col>
            
            <v-col cols="6" sm="4" md="3">
              <v-chip
                :color="limits.prioritySupport ? 'success' : 'grey'"
                variant="flat"
                size="small"
                class="w-100"
              >
                <v-icon start size="small">
                  {{ limits.prioritySupport ? 'mdi-check' : 'mdi-close' }}
                </v-icon>
                優先サポート
              </v-chip>
            </v-col>
          </v-row>
        </div>

        <!-- アップグレード促進 -->
        <div v-if="shouldShowUpgrade" class="mt-4">
          <v-alert
            type="info"
            variant="tonal"
            class="mb-3"
          >
            <div class="d-flex align-center">
              <div class="flex-grow-1">
                <div class="font-weight-medium">プランをアップグレードしませんか？</div>
                <div class="text-body-2 mt-1">
                  より多くのアカウントと投稿、追加機能をご利用いただけます。
                </div>
              </div>
              <v-btn
                color="primary"
                variant="flat"
                to="/billing"
                class="ml-3"
              >
                プランを見る
              </v-btn>
            </div>
          </v-alert>
        </div>

        <!-- 最終更新日時 -->
        <div class="text-caption text-medium-emphasis text-center mt-3">
          最終更新: {{ formatLastUpdate() }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePlanLimitsStore } from '@/stores/planLimits'

const planLimitsStore = usePlanLimitsStore()

// Computed
const {
  limits,
  usage,
  loading,
  error,
  isUnlimited,
  canAddAccount,
  canPost,
  accountUsageText,
  postUsageText,
  accountUsagePercentage,
  postUsagePercentage,
  accountUsageColor,
  postUsageColor
} = planLimitsStore

const shouldShowUpgrade = computed(() => {
  if (!limits.value || !usage.value) return false
  
  // Freeプランで使用量が多い場合
  if (getCurrentPlanId() === 'free') {
    return usage.value.instagramAccountCount > 0 || usage.value.monthlyPostCount > 5
  }
  
  // 使用量が70%を超えている場合
  return accountUsagePercentage.value > 70 || postUsagePercentage.value > 70
})

// Methods
const refreshUsage = async () => {
  await planLimitsStore.fetchLimitsAndUsage()
}

const getCurrentPlanId = () => {
  // 実際の実装では認証ストアから取得
  return 'free' // プレースホルダー
}

const getPlanName = () => {
  const planId = getCurrentPlanId()
  const planNames: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    pro: 'Pro',
    business: 'Business'
  }
  return planNames[planId] || 'Unknown'
}

const formatLastUpdate = () => {
  return new Date().toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  await refreshUsage()
})
</script>

<style scoped>
.usage-metric {
  padding: 12px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface), 0.5);
}

.w-100 {
  width: 100%;
}
</style> 