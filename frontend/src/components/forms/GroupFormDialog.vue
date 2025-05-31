<template>
  <v-dialog 
    v-model="dialogModel"
    max-width="600px"
    persistent
    scrollable
  >
    <v-card class="group-form-card" rounded="xl">
      <!-- ヘッダー -->
      <v-card-title class="group-form-header">
        <div class="d-flex align-center">
          <v-icon 
            :icon="isEditing ? 'mdi-pencil' : 'mdi-plus-circle'"
            class="mr-3"
            :color="isEditing ? 'warning' : 'primary'"
          />
          <div>
            <h3 class="text-h5 font-weight-bold">
              {{ isEditing ? 'グループ編集' : '新しいグループ' }}
            </h3>
            <p class="text-subtitle-2 text-grey-darken-1 ma-0">
              {{ isEditing ? 'グループ設定を変更します' : 'アカウントグループを追加します' }}
            </p>
          </div>
        </div>
      </v-card-title>

      <v-divider />

      <!-- フォーム -->
      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
          <v-row>
            <!-- グループ名 -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="グループ名"
                placeholder="例: インフルエンサーアカウント"
                variant="outlined"
                :rules="nameRules"
                prepend-inner-icon="mdi-account-group"
                required
              />
            </v-col>

            <!-- 説明 -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="説明（任意）"
                placeholder="このグループの目的や用途を説明してください"
                variant="outlined"
                rows="3"
                prepend-inner-icon="mdi-text"
              />
            </v-col>

            <!-- カラー -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.color"
                label="カラー"
                :items="colorOptions"
                variant="outlined"
                prepend-inner-icon="mdi-palette"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon 
                        :color="item.raw.value" 
                        icon="mdi-circle"
                        class="mr-2"
                      />
                    </template>
                    <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                  </v-list-item>
                </template>
                <template #selection="{ item }">
                  <div class="d-flex align-center">
                    <v-icon 
                      :color="item.raw.value" 
                      icon="mdi-circle"
                      class="mr-2"
                    />
                    {{ item.raw.title }}
                  </div>
                </template>
              </v-select>
            </v-col>

            <!-- プロキシ設定 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.proxyId"
                label="プロキシ（任意）"
                :items="proxyOptions"
                variant="outlined"
                prepend-inner-icon="mdi-server-network"
                clearable
              />
            </v-col>

            <!-- Instagramアカウント選択 -->
            <v-col cols="12">
              <v-select
                v-model="formData.igAccountIds"
                label="Instagramアカウント"
                :items="igAccountOptions"
                variant="outlined"
                multiple
                chips
                closable-chips
                prepend-inner-icon="mdi-instagram"
                :rules="accountRules"
              >
                <template #chip="{ props, item }">
                  <v-chip
                    v-bind="props"
                    :prepend-avatar="getAccountAvatar(item.raw.value)"
                    size="small"
                  >
                    {{ item.raw.title }}
                  </v-chip>
                </template>
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-avatar size="32" class="mr-2">
                        <v-img 
                          :src="getAccountAvatar(item.raw.value)"
                          :alt="item.raw.title"
                        />
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                    <v-list-item-subtitle>@{{ item.raw.subtitle }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- アクティブ状態 -->
            <v-col cols="12">
              <v-switch
                v-model="formData.isActive"
                label="アクティブ"
                color="success"
                hide-details
                inset
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <!-- アクション -->
      <v-card-actions class="pa-6">
        <v-spacer />
        
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          キャンセル
        </v-btn>

        <v-btn
          color="primary"
          variant="elevated"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!formValid"
        >
          {{ isEditing ? '更新' : '作成' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useGroupsStore, type Group } from '@/stores/groups'
import { useProxiesStore } from '@/stores/proxies'
import { useIgAccountsStore } from '@/stores/igAccounts'

// Props & Emits
interface Props {
  modelValue: boolean
  group?: Group
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = withDefaults(defineProps<Props>(), {
  group: undefined
})

const emit = defineEmits<Emits>()

// Stores
const groupsStore = useGroupsStore()
const proxiesStore = useProxiesStore()
const igAccountsStore = useIgAccountsStore()

// State
const formRef = ref()
const formValid = ref(false)
const loading = ref(false)

// フォームデータ
const formData = ref({
  name: '',
  description: '',
  igAccountIds: [] as string[],
  proxyId: '',
  color: 'blue',
  isActive: true
})

// カラーオプション
const colorOptions = [
  { title: 'ブルー', value: 'blue' },
  { title: 'グリーン', value: 'green' },
  { title: 'レッド', value: 'red' },
  { title: 'オレンジ', value: 'orange' },
  { title: 'パープル', value: 'purple' },
  { title: 'ピンク', value: 'pink' },
  { title: 'イエロー', value: 'yellow' },
  { title: 'グレー', value: 'grey' }
]

// バリデーションルール
const nameRules = [
  (v: string) => !!v || 'グループ名は必須です',
  (v: string) => v.length >= 2 || 'グループ名は2文字以上で入力してください',
  (v: string) => v.length <= 50 || 'グループ名は50文字以下で入力してください'
]

const accountRules = [
  (v: string[]) => v.length > 0 || '少なくとも1つのInstagramアカウントを選択してください'
]

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEditing = computed(() => !!props.group)

// プロキシオプション
const proxyOptions = computed(() => {
  return proxiesStore.activeProxies.map(proxy => ({
    title: proxy.name,
    value: proxy.id,
    subtitle: `${proxy.host}:${proxy.port}`
  }))
})

// Instagramアカウントオプション
const igAccountOptions = computed(() => {
  return igAccountsStore.accounts.map(account => ({
    title: account.name || account.username,
    value: account.id,
    subtitle: account.username
  }))
})

// Methods
const getAccountAvatar = (accountId: string) => {
  const account = igAccountsStore.accounts.find(acc => acc.id === accountId)
  return account?.profilePictureUrl || '/default-avatar.png'
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    igAccountIds: [],
    proxyId: '',
    color: 'blue',
    isActive: true
  }
  
  nextTick(() => {
    formRef.value?.resetValidation()
  })
}

const loadGroupData = () => {
  if (props.group) {
    formData.value = {
      name: props.group.name,
      description: props.group.description || '',
      igAccountIds: [...props.group.igAccountIds],
      proxyId: props.group.proxyId || '',
      color: props.group.color || 'blue',
      isActive: props.group.isActive
    }
  }
}

const handleSubmit = async () => {
  if (!formValid.value) return

  try {
    loading.value = true

    const groupData = {
      ...formData.value,
      description: formData.value.description || undefined,
      proxyId: formData.value.proxyId || undefined
    }

    if (isEditing.value && props.group) {
      await groupsStore.updateGroup(props.group.id, groupData)
    } else {
      await groupsStore.createGroup(groupData)
    }

    emit('saved')
    dialogModel.value = false
    resetForm()

  } catch (error) {
    console.error('グループ保存エラー:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  dialogModel.value = false
  resetForm()
}

// Lifecycle
onMounted(async () => {
  // データを読み込み
  await Promise.all([
    proxiesStore.fetchProxies(),
    igAccountsStore.fetchAccounts()
  ])
})

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    if (props.group) {
      loadGroupData()
    } else {
      resetForm()
    }
  }
})

watch(() => props.group, () => {
  if (props.modelValue && props.group) {
    loadGroupData()
  }
})
</script>

<style scoped>
.group-form-card {
  background: white;
  border: 1px solid #e2e8f0;
}

.group-form-header {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
}

.v-text-field :deep(.v-field__outline) {
  border-radius: 12px;
}

.v-textarea :deep(.v-field__outline) {
  border-radius: 12px;
}

.v-select :deep(.v-field__outline) {
  border-radius: 12px;
}

/* アニメーション */
.group-form-card {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>