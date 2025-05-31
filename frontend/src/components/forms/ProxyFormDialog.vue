<template>
  <v-dialog 
    v-model="dialogModel"
    max-width="600px"
    persistent
    scrollable
  >
    <v-card class="proxy-form-card" rounded="xl">
      <!-- ヘッダー -->
      <v-card-title class="proxy-form-header">
        <div class="d-flex align-center">
          <v-icon 
            :icon="isEditing ? 'mdi-pencil' : 'mdi-plus-circle'"
            class="mr-3"
            :color="isEditing ? 'warning' : 'primary'"
          />
          <div>
            <h3 class="text-h5 font-weight-bold">
              {{ isEditing ? 'プロキシ編集' : '新しいプロキシ' }}
            </h3>
            <p class="text-subtitle-2 text-grey-darken-1 ma-0">
              {{ isEditing ? 'プロキシ設定を変更します' : 'プロキシを追加します' }}
            </p>
          </div>
        </div>
      </v-card-title>

      <v-divider />

      <!-- フォーム -->
      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
          <v-row>
            <!-- プロキシ名 -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="プロキシ名"
                placeholder="例: US East Proxy 1"
                variant="outlined"
                :rules="nameRules"
                prepend-inner-icon="mdi-tag"
                required
              />
            </v-col>

            <!-- ホスト -->
            <v-col cols="12" md="8">
              <v-text-field
                v-model="formData.host"
                label="ホスト"
                placeholder="例: 192.168.1.100 または proxy.example.com"
                variant="outlined"
                :rules="hostRules"
                prepend-inner-icon="mdi-server"
                required
              />
            </v-col>

            <!-- ポート -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.port"
                label="ポート"
                placeholder="8080"
                variant="outlined"
                type="number"
                :rules="portRules"
                prepend-inner-icon="mdi-network"
                required
              />
            </v-col>

            <!-- プロトコル -->
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.protocol"
                label="プロトコル"
                :items="protocolOptions"
                variant="outlined"
                prepend-inner-icon="mdi-protocol"
                required
              />
            </v-col>

            <!-- 認証の有無 -->
            <v-col cols="12" md="6">
              <v-switch
                v-model="useAuth"
                label="認証を使用"
                color="primary"
                hide-details
                inset
              />
            </v-col>

            <!-- 認証情報 -->
            <template v-if="useAuth">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.username"
                  label="ユーザー名"
                  variant="outlined"
                  :rules="useAuth ? usernameRules : []"
                  prepend-inner-icon="mdi-account"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.password"
                  label="パスワード"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  :rules="useAuth ? passwordRules : []"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                />
              </v-col>
            </template>

            <!-- 場所・プロバイダー -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.location"
                label="場所（任意）"
                placeholder="例: Tokyo, JP"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.provider"
                label="プロバイダー（任意）"
                placeholder="例: ProxyProvider A"
                variant="outlined"
                prepend-inner-icon="mdi-domain"
              />
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
import { ref, computed, watch, nextTick } from 'vue'
import { useProxiesStore, type Proxy } from '@/stores/proxies'

// Props & Emits
interface Props {
  modelValue: boolean
  proxy?: Proxy
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = withDefaults(defineProps<Props>(), {
  proxy: undefined
})

const emit = defineEmits<Emits>()

// Stores
const proxiesStore = useProxiesStore()

// State
const formRef = ref()
const formValid = ref(false)
const loading = ref(false)
const useAuth = ref(false)
const showPassword = ref(false)

// フォームデータ
const formData = ref({
  name: '',
  host: '',
  port: 8080,
  protocol: 'http' as 'http' | 'https' | 'socks5',
  username: '',
  password: '',
  location: '',
  provider: '',
  isActive: true
})

// プロトコルオプション
const protocolOptions = [
  { title: 'HTTP', value: 'http' },
  { title: 'HTTPS', value: 'https' },
  { title: 'SOCKS5', value: 'socks5' }
]

// バリデーションルール
const nameRules = [
  (v: string) => !!v || 'プロキシ名は必須です',
  (v: string) => v.length >= 2 || 'プロキシ名は2文字以上で入力してください',
  (v: string) => v.length <= 50 || 'プロキシ名は50文字以下で入力してください'
]

const hostRules = [
  (v: string) => !!v || 'ホストは必須です',
  (v: string) => {
    // IPアドレスまたはドメインの簡易チェック
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return ipPattern.test(v) || domainPattern.test(v) || '有効なIPアドレスまたはドメイン名を入力してください'
  }
]

const portRules = [
  (v: number) => !!v || 'ポートは必須です',
  (v: number) => v >= 1 && v <= 65535 || 'ポートは1-65535の範囲で入力してください'
]

const usernameRules = [
  (v: string) => !!v || 'ユーザー名は必須です',
  (v: string) => v.length >= 2 || 'ユーザー名は2文字以上で入力してください'
]

const passwordRules = [
  (v: string) => !!v || 'パスワードは必須です',
  (v: string) => v.length >= 4 || 'パスワードは4文字以上で入力してください'
]

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEditing = computed(() => !!props.proxy)

// Methods
const resetForm = () => {
  formData.value = {
    name: '',
    host: '',
    port: 8080,
    protocol: 'http',
    username: '',
    password: '',
    location: '',
    provider: '',
    isActive: true
  }
  useAuth.value = false
  showPassword.value = false
  
  nextTick(() => {
    formRef.value?.resetValidation()
  })
}

const loadProxyData = () => {
  if (props.proxy) {
    formData.value = {
      name: props.proxy.name,
      host: props.proxy.host,
      port: props.proxy.port,
      protocol: props.proxy.protocol,
      username: props.proxy.username || '',
      password: props.proxy.password || '',
      location: props.proxy.location || '',
      provider: props.proxy.provider || '',
      isActive: props.proxy.isActive
    }
    useAuth.value = !!(props.proxy.username && props.proxy.password)
  }
}

const handleSubmit = async () => {
  if (!formValid.value) return

  try {
    loading.value = true

    const proxyData = {
      ...formData.value,
      // 認証を使用しない場合はusername/passwordをundefinedに
      username: useAuth.value ? formData.value.username : undefined,
      password: useAuth.value ? formData.value.password : undefined
    }

    if (isEditing.value && props.proxy) {
      await proxiesStore.updateProxy(props.proxy.id, proxyData)
    } else {
      await proxiesStore.createProxy(proxyData)
    }

    emit('saved')
    dialogModel.value = false
    resetForm()

  } catch (error) {
    console.error('プロキシ保存エラー:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  dialogModel.value = false
  resetForm()
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    if (props.proxy) {
      loadProxyData()
    } else {
      resetForm()
    }
  }
})

watch(() => props.proxy, () => {
  if (props.modelValue && props.proxy) {
    loadProxyData()
  }
})
</script>

<style scoped>
.proxy-form-card {
  background: white;
  border: 1px solid #e2e8f0;
}

.proxy-form-header {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
}

.v-text-field :deep(.v-field__outline) {
  border-radius: 12px;
}

.v-select :deep(.v-field__outline) {
  border-radius: 12px;
}

/* アニメーション */
.proxy-form-card {
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