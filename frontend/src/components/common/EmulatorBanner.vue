<template>
  <div v-if="isEmulator" class="emulator-banner">
    <div class="emulator-content">
      <div class="emulator-icon">🔧</div>
      <div class="emulator-text">
        <div class="emulator-title">開発環境（エミュレーター）</div>
        <div class="emulator-subtitle">Facebook認証はモックで動作しています</div>
      </div>
      <button v-if="showClose" class="emulator-close" @click="$emit('close')">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  showClose?: boolean;
}

interface Emits {
  (e: 'close'): void;
}

defineProps<Props>();
defineEmits<Emits>();

const isEmulator = computed(() => {
  return import.meta.env.VITE_ENABLE_FIREBASE_EMULATOR === 'true';
});
</script>

<style scoped>
.emulator-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.emulator-content {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
}

.emulator-icon {
  font-size: 20px;
  min-width: 20px;
}

.emulator-text {
  flex: 1;
}

.emulator-title {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.2;
}

.emulator-subtitle {
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.2;
}

.emulator-close {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.emulator-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .emulator-banner {
    padding: 8px 16px;
  }
  
  .emulator-title {
    font-size: 13px;
  }
  
  .emulator-subtitle {
    font-size: 11px;
  }
}
</style>