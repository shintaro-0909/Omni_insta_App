<template>
  <v-chip
    :color="chipColor"
    :variant="chipVariant"
    size="small"
    :prepend-icon="chipIcon"
  >
    {{ statusText }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  expiresAt: Date | string;
  status?: 'active' | 'token_expired' | 'warning';
}

const props = defineProps<Props>();

// 有効期限をDateオブジェクトに変換
const expirationDate = computed(() => {
  if (props.expiresAt instanceof Date) {
    return props.expiresAt;
  }
  return new Date(props.expiresAt);
});

// 現在時刻との比較
const now = computed(() => new Date());
const daysUntilExpiry = computed(() => {
  const diffMs = expirationDate.value.getTime() - now.value.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

// ステータス判定
const tokenStatus = computed(() => {
  if (props.status === 'token_expired') {
    return 'expired';
  }
  
  const days = daysUntilExpiry.value;
  
  if (days <= 0) {
    return 'expired';
  } else if (days <= 3) {
    return 'critical';
  } else if (days <= 7) {
    return 'warning';
  } else {
    return 'active';
  }
});

// チップの見た目設定
const chipColor = computed(() => {
  switch (tokenStatus.value) {
    case 'expired':
      return 'error';
    case 'critical':
      return 'warning';
    case 'warning':
      return 'orange';
    case 'active':
    default:
      return 'success';
  }
});

const chipVariant = computed(() => {
  switch (tokenStatus.value) {
    case 'expired':
    case 'critical':
      return 'flat';
    case 'warning':
      return 'tonal';
    case 'active':
    default:
      return 'tonal';
  }
});

const chipIcon = computed(() => {
  switch (tokenStatus.value) {
    case 'expired':
      return 'mdi-close-circle';
    case 'critical':
      return 'mdi-alert';
    case 'warning':
      return 'mdi-alert-circle-outline';
    case 'active':
    default:
      return 'mdi-check-circle';
  }
});

const statusText = computed(() => {
  switch (tokenStatus.value) {
    case 'expired':
      return '期限切れ';
    case 'critical':
      return `${daysUntilExpiry.value}日で期限切れ`;
    case 'warning':
      return `残り${daysUntilExpiry.value}日`;
    case 'active':
    default:
      if (daysUntilExpiry.value > 30) {
        return '正常';
      }
      return `残り${daysUntilExpiry.value}日`;
  }
});
</script>

<style scoped>
.v-chip {
  font-weight: 500;
}
</style>