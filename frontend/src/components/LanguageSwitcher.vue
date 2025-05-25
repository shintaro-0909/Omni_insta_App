<template>
  <v-menu offset-y>
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        :icon="props.compact"
        :variant="props.compact ? 'text' : 'outlined'"
        :size="props.compact ? 'small' : 'default'"
        class="language-switcher"
      >
        <template v-if="!props.compact">
          <span class="flag mr-2">{{ currentLanguage.flag }}</span>
          {{ currentLanguage.name }}
          <v-icon end>mdi-chevron-down</v-icon>
        </template>
        <template v-else>
          <span class="flag">{{ currentLanguage.flag }}</span>
        </template>
      </v-btn>
    </template>

    <v-list class="language-menu" density="compact">
      <v-list-item
        v-for="locale in supportedLocales"
        :key="locale.code"
        :class="{ 'v-list-item--active': locale.code === currentLocale }"
        @click="changeLanguage(locale.code)"
      >
        <template #prepend>
          <span class="flag mr-3">{{ locale.flag }}</span>
        </template>
        
        <v-list-item-title>{{ locale.name }}</v-list-item-title>
        
        <template #append>
          <v-icon
            v-if="locale.code === currentLocale"
            icon="mdi-check"
            color="primary"
            size="small"
          />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { supportedLocales, setLocale, getCurrentLocale, type MessageLanguages } from '@/plugins/i18n'

interface Props {
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

// Computed
const currentLocale = computed(() => getCurrentLocale())

const currentLanguage = computed(() => {
  return supportedLocales.find(lang => lang.code === currentLocale.value) || supportedLocales[0]
})

// Methods
const changeLanguage = (newLocale: MessageLanguages) => {
  setLocale(newLocale)
  
  // 成功通知（オプション）
  // notifications.add({
  //   type: 'success',
  //   message: `Language changed to ${supportedLocales.find(l => l.code === newLocale)?.name}`
  // })
}
</script>

<style scoped>
.language-switcher {
  text-transform: none !important;
}

.flag {
  font-size: 1.2em;
  line-height: 1;
}

.language-menu {
  min-width: 160px;
}

.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.08);
}

.v-list-item--active .v-list-item-title {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

/* アニメーション */
.language-switcher {
  transition: all 0.2s ease;
}

.language-switcher:hover {
  transform: translateY(-1px);
}
</style>