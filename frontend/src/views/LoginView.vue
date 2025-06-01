<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card elevation="8" class="pa-8">
          <v-card-title class="text-center text-h4 font-weight-bold mb-6">
            <v-icon size="48" color="primary" class="mr-2">
              mdi-instagram
            </v-icon>
            Omniy
          </v-card-title>

          <v-card-subtitle class="text-center text-h6 mb-8">
            Instagram予約投稿を始めましょう
          </v-card-subtitle>

          <!-- Google認証ボタン -->
          <v-btn
            color="primary"
            size="x-large"
            block
            :loading="authStore.loading"
            :disabled="authStore.loading"
            @click="handleGoogleLogin"
            class="mb-6"
          >
            <v-icon start>mdi-google</v-icon>
            Googleでログイン
          </v-btn>

          <!-- 利用規約・プライバシーポリシー -->
          <v-card-text class="text-center text-caption text-grey-darken-1">
            ログインすることで、
            <a href="#" class="text-primary">利用規約</a>
            および
            <a href="#" class="text-primary">プライバシーポリシー</a>
            に同意したものとみなされます。
          </v-card-text>

          <!-- 機能紹介 -->
          <v-divider class="my-6" />

          <v-card-text>
            <h3 class="text-h6 font-weight-bold mb-4 text-center">
              Omniyでできること
            </h3>

            <v-list density="compact">
              <v-list-item
                v-for="feature in features"
                :key="feature.text"
                :prepend-icon="feature.icon"
                class="px-0"
              >
                <v-list-item-title class="text-body-2">
                  {{ feature.text }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores';

  const router = useRouter();
  const authStore = useAuthStore();

  // 機能一覧
  const features = [
    {
      icon: 'mdi-calendar-clock',
      text: '日時指定で自動投稿',
    },
    {
      icon: 'mdi-repeat',
      text: '曜日・時刻の繰り返し投稿',
    },
    {
      icon: 'mdi-shuffle',
      text: 'コンテンツからランダム投稿',
    },
    {
      icon: 'mdi-account-multiple',
      text: '複数アカウントの一元管理',
    },
    {
      icon: 'mdi-shield-check',
      text: 'Instagram公式API使用で安全',
    },
  ];

  // Methods
  const handleGoogleLogin = async () => {
    try {
      await authStore.loginWithGoogle();

      // ログイン成功後、ダッシュボードへリダイレクト
      router.push('/dashboard');
    } catch (error) {
      console.error('ログインエラー:', error);
      // エラーはauthStoreで管理されているため、ここでは何もしない
    }
  };
</script>

<style scoped>
  .fill-height {
    min-height: 100vh;
  }

  .v-card {
    max-width: 100%;
  }

  a {
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
