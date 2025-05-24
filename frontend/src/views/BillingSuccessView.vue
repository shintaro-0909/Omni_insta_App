<template>
  <v-container class="pa-6">
    <div class="text-center">
      <!-- 成功アイコン -->
      <v-icon
        size="120"
        color="success"
        class="mb-6"
      >
        mdi-check-circle
      </v-icon>

      <!-- メッセージ -->
      <h1 class="text-h3 font-weight-bold mb-4">
        決済が完了しました！
      </h1>
      
      <p class="text-h6 text-medium-emphasis mb-8">
        プランのアップグレードありがとうございます。<br>
        新しい機能をお楽しみください。
      </p>

      <!-- アクションボタン -->
      <div class="d-flex flex-column flex-sm-row justify-center gap-4">
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          to="/dashboard"
          prepend-icon="mdi-view-dashboard"
        >
          ダッシュボードに戻る
        </v-btn>
        
        <v-btn
          variant="outlined"
          size="large"
          to="/billing"
          prepend-icon="mdi-receipt"
        >
          請求情報を確認
        </v-btn>
      </div>

      <!-- 次のステップ -->
      <v-card class="mt-8 mx-auto" max-width="600" elevation="2">
        <v-card-title class="text-center">
          <v-icon class="me-2">mdi-rocket</v-icon>
          次のステップ
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-account-plus</v-icon>
              </template>
              <v-list-item-title>Instagramアカウントを追加</v-list-item-title>
              <v-list-item-subtitle>
                複数のアカウントを管理して効率的に投稿しましょう
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-calendar-plus</v-icon>
              </template>
              <v-list-item-title>投稿をスケジュール</v-list-item-title>
              <v-list-item-subtitle>
                予約投稿や繰り返し投稿を設定して時間を節約
              </v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-image-multiple</v-icon>
              </template>
              <v-list-item-title>コンテンツライブラリを活用</v-list-item-title>
              <v-list-item-subtitle>
                投稿コンテンツを整理して再利用しましょう
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBillingStore } from '@/stores/billing'

const billingStore = useBillingStore()

// 決済完了後にサブスクリプション情報を更新
onMounted(async () => {
  // 少し待ってからWebhookが処理されるのを待つ
  setTimeout(async () => {
    await billingStore.fetchSubscription()
  }, 2000)
})
</script>

<style scoped>
.gap-4 {
  gap: 1rem;
}
</style> 