<template>
  <v-container fluid class="pa-0">
    <!-- ヒーローセクション -->
    <v-row no-gutters>
      <v-col cols="12">
        <v-card
          color="primary"
          dark
          flat
          class="text-center py-16"
        >
          <v-card-title class="text-h2 font-weight-bold mb-4">
            Omniy
          </v-card-title>
          <v-card-subtitle class="text-h5 mb-8">
            Instagram予約投稿を簡単に。<br>
            定期投稿で、フォロワーとのつながりを深めよう。
          </v-card-subtitle>
          
          <v-btn
            v-if="!authStore.isAuthenticated"
            size="x-large"
            variant="outlined"
            color="white"
            class="mr-4"
            @click="handleGetStarted"
          >
            <v-icon start>mdi-rocket-launch</v-icon>
            今すぐ始める
          </v-btn>
          
          <v-btn
            v-else
            size="x-large"
            variant="outlined"
            color="white"
            to="/dashboard"
          >
            <v-icon start>mdi-view-dashboard</v-icon>
            ダッシュボードへ
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- 機能紹介セクション -->
    <v-container class="py-16">
      <v-row>
        <v-col cols="12" class="text-center mb-8">
          <h2 class="text-h3 font-weight-bold mb-4">主要機能</h2>
          <p class="text-h6 text-grey-darken-1">
            Omniyで実現できる、Instagram運用の自動化
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="feature in features"
          :key="feature.title"
          cols="12"
          md="4"
          class="mb-8"
        >
          <v-card
            height="100%"
            elevation="2"
            class="text-center pa-6"
          >
            <v-icon
              :icon="feature.icon"
              size="64"
              color="primary"
              class="mb-4"
            />
            <v-card-title class="text-h5 mb-2">
              {{ feature.title }}
            </v-card-title>
            <v-card-text class="text-body-1">
              {{ feature.description }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 価格セクション -->
    <v-container fluid class="grey-lighten-4 py-16">
      <v-container>
        <v-row>
          <v-col cols="12" class="text-center mb-8">
            <h2 class="text-h3 font-weight-bold mb-4">料金プラン</h2>
            <p class="text-h6 text-grey-darken-1">
              あなたに最適なプランを選択してください
            </p>
          </v-col>
        </v-row>

        <v-row justify="center">
          <v-col
            v-for="plan in plans"
            :key="plan.name"
            cols="12"
            md="4"
            class="mb-4"
          >
            <v-card
              :color="plan.featured ? 'primary' : 'white'"
              :dark="plan.featured"
              elevation="4"
              class="text-center pa-6"
              height="100%"
            >
              <v-card-title class="text-h4 font-weight-bold">
                {{ plan.name }}
              </v-card-title>
              <v-card-subtitle class="text-h3 font-weight-bold my-4">
                ¥{{ plan.price.toLocaleString() }}
                <span class="text-body-1">/月</span>
              </v-card-subtitle>
              
              <v-list
                :bg-color="plan.featured ? 'primary' : 'white'"
                class="mb-6"
              >
                <v-list-item
                  v-for="feature in plan.features"
                  :key="feature"
                  class="px-0"
                >
                  <template #prepend>
                    <v-icon color="success">mdi-check</v-icon>
                  </template>
                  <v-list-item-title>{{ feature }}</v-list-item-title>
                </v-list-item>
              </v-list>

              <v-btn
                :variant="plan.featured ? 'outlined' : 'flat'"
                :color="plan.featured ? 'white' : 'primary'"
                size="large"
                block
                @click="handleSelectPlan(plan)"
              >
                {{ plan.buttonText }}
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 機能一覧
const features = [
  {
    title: '日時指定予約投稿',
    icon: 'mdi-calendar-clock',
    description: '特定の日時に自動で投稿。ベストタイミングを逃しません。'
  },
  {
    title: '繰り返し投稿',
    icon: 'mdi-repeat',
    description: '曜日と時刻を指定して定期的に投稿。継続的な発信を実現。'
  },
  {
    title: 'ランダム投稿',
    icon: 'mdi-shuffle',
    description: 'コンテンツライブラリからランダムに選択。自然な投稿パターン。'
  },
  {
    title: 'マルチアカウント',
    icon: 'mdi-account-multiple',
    description: '複数のInstagramアカウントを一元管理。効率的な運用。'
  },
  {
    title: '安全な連携',
    icon: 'mdi-shield-check',
    description: 'Instagram公式APIを使用。規約違反のリスクなし。'
  },
  {
    title: '日本語サポート',
    icon: 'mdi-translate',
    description: '完全日本語対応。直感的で使いやすいインターフェース。'
  }
]

// 料金プラン
const plans = [
  {
    name: 'フリー',
    price: 0,
    featured: false,
    buttonText: '無料で始める',
    features: [
      'Instagramアカウント 1個',
      '月間投稿数 10件',
      '基本的な予約投稿',
      'コミュニティサポート'
    ]
  },
  {
    name: 'ベーシック',
    price: 980,
    featured: true,
    buttonText: '14日間無料体験',
    features: [
      'Instagramアカウント 3個',
      '月間投稿数 100件',
      '全ての投稿機能',
      'プロキシ設定',
      'メールサポート'
    ]
  },
  {
    name: 'プロ',
    price: 2980,
    featured: false,
    buttonText: '14日間無料体験',
    features: [
      'Instagramアカウント 10個',
      '月間投稿数 無制限',
      '全ての機能',
      '優先サポート',
      'アナリティクス'
    ]
  }
]

// Methods
const handleGetStarted = () => {
  router.push('/login')
}

const handleSelectPlan = (plan: any) => {
  if (plan.price === 0) {
    router.push('/login')
  } else {
    // 有料プランの場合は認証後に決済ページへ
    if (authStore.isAuthenticated) {
      // TODO: 決済ページへリダイレクト
      console.log('決済ページへ:', plan.name)
    } else {
      router.push('/login')
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-4px);
}
</style> 