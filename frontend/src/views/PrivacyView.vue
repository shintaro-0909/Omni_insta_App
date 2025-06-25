<template>
  <div class="privacy-layout">
    <SidebarNavigation />
    <div class="privacy-view">
      <v-container class="py-8">
        <v-row justify="center">
          <v-col cols="12" md="10" lg="8">
            <v-card class="privacy-card">
              <v-toolbar color="primary" dark>
                <v-toolbar-title>プライバシーポリシー</v-toolbar-title>
              </v-toolbar>
              
              <v-card-text class="pa-6">
                <div class="privacy-content" v-html="privacyContent"></div>
              </v-card-text>
              
              <v-card-actions class="pa-6 pt-0">
                <v-spacer></v-spacer>
                <v-btn
                  variant="text"
                  @click="$router.push('/')"
                >
                  ホームに戻る
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import SidebarNavigation from '@/components/layouts/SidebarNavigation.vue';

const privacyContent = ref('');

onMounted(async () => {
  try {
    const response = await fetch('/privacy-policy.md');
    const markdown = await response.text();
    privacyContent.value = marked(markdown);
  } catch (error) {
    console.error('Failed to load privacy policy:', error);
    privacyContent.value = '<p>プライバシーポリシーを読み込めませんでした。</p>';
  }
});
</script>

<style scoped>
.privacy-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.privacy-view {
  flex: 1;
  margin-left: 72px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (min-width: 768px) {
  .privacy-view {
    margin-left: 280px;
  }
}

@media (max-width: 767px) {
  .privacy-view {
    margin-left: 0;
  }
}

.privacy-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.privacy-content {
  line-height: 1.8;
  color: #333;
}

.privacy-content :deep(h1) {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #1976d2;
}

.privacy-content :deep(h2) {
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.privacy-content :deep(h3) {
  font-size: 1.2rem;
  margin-top: 1.5rem;
  margin-bottom: 0.8rem;
  color: #555;
}

.privacy-content :deep(p) {
  margin-bottom: 1rem;
}

.privacy-content :deep(ol),
.privacy-content :deep(ul) {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.privacy-content :deep(li) {
  margin-bottom: 0.5rem;
}

.privacy-content :deep(strong) {
  color: #1976d2;
}
</style>