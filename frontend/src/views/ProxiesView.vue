<template>
  <div class="proxies-view">
    <v-container>
      <!-- 🌐 ページヘッダー -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon
                icon="mdi-server-network"
                size="32"
                color="primary"
                class="mr-3"
              />
              <div>
                <h1 class="text-h3 font-weight-bold">プロキシ管理</h1>
                <p class="text-subtitle-1 text-grey-darken-1 mt-1">
                  プロキシサーバーを管理してアカウントの安全性を向上
                </p>
              </div>
            </div>

            <div class="d-flex ga-3">
              <v-btn
                color="warning"
                variant="outlined"
                prepend-icon="mdi-test-tube"
                @click="handleTestAll"
                :loading="proxiesStore.loading"
              >
                全テスト
              </v-btn>

              <v-btn
                color="primary"
                variant="elevated"
                size="large"
                prepend-icon="mdi-plus"
                @click="openCreateDialog"
              >
                プロキシ追加
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- 📊 統計カード -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in statsCards"
          :key="stat.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card
            class="stat-card"
            :class="stat.gradient"
            elevation="4"
            rounded="xl"
          >
            <v-card-text class="pa-6">
              <div class="stat-card-content">
                <div class="stat-icon-wrapper">
                  <v-icon
                    :icon="stat.icon"
                    size="28"
                    color="white"
                    class="stat-icon"
                  />
                </div>

                <div class="stat-info">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-title">{{ stat.title }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 🔍 フィルター -->
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchQuery"
            label="プロキシを検索"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            density="compact"
            @input="applyFilters"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="statusFilter"
            :items="statusFilterOptions"
            label="ステータス"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-filter"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="protocolFilter"
            :items="protocolFilterOptions"
            label="プロトコル"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-protocol"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-btn
            variant="outlined"
            block
            @click="clearFilters"
            prepend-icon="mdi-filter-remove"
          >
            クリア
          </v-btn>
        </v-col>
      </v-row>

      <!-- 📋 プロキシ一覧 -->
      <v-row>
        <v-col cols="12">
          <v-card class="proxies-list-card" elevation="0" rounded="xl">
            <v-card-title class="proxies-list-header">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-format-list-bulleted" class="mr-3" />
                  プロキシ一覧
                </div>
                <v-chip variant="outlined" size="small">
                  {{ filteredProxies.length }}件
                </v-chip>
              </div>
            </v-card-title>

            <v-divider />

            <!-- エラー表示 -->
            <v-alert
              v-if="proxiesStore.error"
              type="error"
              variant="tonal"
              class="ma-4"
              closable
              @click:close="proxiesStore.clearError"
            >
              {{ proxiesStore.error }}
            </v-alert>

            <!-- ローディング -->
            <div
              v-if="proxiesStore.loading && filteredProxies.length === 0"
              class="text-center pa-8"
            >
              <v-progress-circular indeterminate color="primary" size="64" />
              <div class="mt-4 text-subtitle-1">プロキシを読み込み中...</div>
            </div>

            <!-- 空の状態 -->
            <div
              v-else-if="filteredProxies.length === 0"
              class="text-center pa-8"
            >
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-server-off
              </v-icon>
              <div class="text-h6 mb-2">
                {{
                  searchQuery ? '検索結果がありません' : 'プロキシがありません'
                }}
              </div>
              <div class="text-subtitle-1 text-medium-emphasis mb-4">
                {{
                  searchQuery
                    ? '検索条件を変更してください'
                    : '新しいプロキシを追加してください'
                }}
              </div>
              <v-btn
                v-if="!searchQuery"
                color="primary"
                variant="elevated"
                @click="openCreateDialog"
                prepend-icon="mdi-plus"
              >
                プロキシ追加
              </v-btn>
            </div>

            <!-- プロキシリスト -->
            <div v-else>
              <v-list>
                <template
                  v-for="(proxy, index) in filteredProxies"
                  :key="proxy.id"
                >
                  <v-list-item class="proxy-item pa-4">
                    <!-- プロキシ情報 -->
                    <template #prepend>
                      <v-avatar
                        :color="proxy.isActive ? 'success' : 'error'"
                        size="48"
                        class="proxy-status-avatar"
                      >
                        <v-icon
                          :icon="proxy.isActive ? 'mdi-check' : 'mdi-close'"
                          color="white"
                        />
                      </v-avatar>
                    </template>

                    <div class="proxy-info">
                      <v-list-item-title class="text-h6 mb-1">
                        {{ proxy.name }}
                      </v-list-item-title>

                      <v-list-item-subtitle class="mb-2">
                        <div class="d-flex align-center flex-wrap ga-2">
                          <v-chip size="small" variant="outlined">
                            {{ proxy.host }}:{{ proxy.port }}
                          </v-chip>
                          <v-chip
                            size="small"
                            :color="getProtocolColor(proxy.protocol)"
                            variant="tonal"
                          >
                            {{ proxy.protocol.toUpperCase() }}
                          </v-chip>
                          <v-chip
                            v-if="proxy.location"
                            size="small"
                            variant="outlined"
                            prepend-icon="mdi-map-marker"
                          >
                            {{ proxy.location }}
                          </v-chip>
                        </div>
                      </v-list-item-subtitle>

                      <div class="proxy-details">
                        <div class="d-flex align-center ga-4">
                          <div v-if="proxy.responseTime" class="proxy-metric">
                            <v-icon
                              icon="mdi-speedometer"
                              size="16"
                              class="mr-1"
                            />
                            {{ proxy.responseTime }}ms
                          </div>
                          <div v-if="proxy.lastUsed" class="proxy-metric">
                            <v-icon icon="mdi-clock" size="16" class="mr-1" />
                            最終使用: {{ formatLastUsed(proxy.lastUsed) }}
                          </div>
                          <div v-if="proxy.provider" class="proxy-metric">
                            <v-icon icon="mdi-domain" size="16" class="mr-1" />
                            {{ proxy.provider }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- アクション -->
                    <template #append>
                      <div class="d-flex flex-column ga-2">
                        <v-btn
                          icon="mdi-test-tube"
                          variant="text"
                          size="small"
                          color="warning"
                          @click="handleTestProxy(proxy)"
                          :loading="testingProxyId === proxy.id"
                        />
                        <v-btn
                          icon="mdi-pencil"
                          variant="text"
                          size="small"
                          color="primary"
                          @click="openEditDialog(proxy)"
                        />
                        <v-btn
                          icon="mdi-delete"
                          variant="text"
                          size="small"
                          color="error"
                          @click="confirmDelete(proxy)"
                        />
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider v-if="index < filteredProxies.length - 1" />
                </template>
              </v-list>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- ダイアログ -->
    <ProxyFormDialog
      v-model="showFormDialog"
      :proxy="editingProxy"
      @saved="onProxySaved"
    />

    <!-- 削除確認ダイアログ -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5"> プロキシ削除 </v-card-title>
        <v-card-text>
          「{{ deletingProxy?.name }}」を削除しますか？
          この操作は取り消せません。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">
            キャンセル
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteProxy"
            :loading="deleting"
          >
            削除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useProxiesStore, type Proxy } from '@/stores';
  import { ProxyFormDialog } from '@/components';
  import { formatDistanceToNow } from 'date-fns';
  import { ja } from 'date-fns/locale';

  // Stores
  const proxiesStore = useProxiesStore();

  // State
  const searchQuery = ref('');
  const statusFilter = ref<string | null>(null);
  const protocolFilter = ref<string | null>(null);
  const showFormDialog = ref(false);
  const showDeleteDialog = ref(false);
  const editingProxy = ref<Proxy | undefined>(undefined);
  const deletingProxy = ref<Proxy | undefined>(undefined);
  const deleting = ref(false);
  const testingProxyId = ref<string | null>(null);

  // フィルターオプション
  const statusFilterOptions = [
    { title: 'アクティブ', value: 'active' },
    { title: '非アクティブ', value: 'inactive' },
  ];

  const protocolFilterOptions = [
    { title: 'HTTP', value: 'http' },
    { title: 'HTTPS', value: 'https' },
    { title: 'SOCKS5', value: 'socks5' },
  ];

  // Computed
  const statsCards = computed(() => [
    {
      title: '総プロキシ数',
      value: proxiesStore.proxyStats.total.toString(),
      icon: 'mdi-server',
      gradient: 'gradient-primary',
    },
    {
      title: 'アクティブ',
      value: proxiesStore.proxyStats.active.toString(),
      icon: 'mdi-check-circle',
      gradient: 'gradient-success',
    },
    {
      title: '非アクティブ',
      value: proxiesStore.proxyStats.failed.toString(),
      icon: 'mdi-close-circle',
      gradient: 'gradient-error',
    },
    {
      title: '平均応答時間',
      value: `${Math.round(proxiesStore.proxyStats.avgResponseTime)}ms`,
      icon: 'mdi-speedometer',
      gradient: 'gradient-warning',
    },
  ]);

  const filteredProxies = computed(() => {
    let filtered = [...proxiesStore.proxies];

    // テキスト検索
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        proxy =>
          proxy.name.toLowerCase().includes(query) ||
          proxy.host.toLowerCase().includes(query) ||
          proxy.location?.toLowerCase().includes(query) ||
          proxy.provider?.toLowerCase().includes(query)
      );
    }

    // ステータスフィルター
    if (statusFilter.value) {
      if (statusFilter.value === 'active') {
        filtered = filtered.filter(proxy => proxy.isActive);
      } else if (statusFilter.value === 'inactive') {
        filtered = filtered.filter(proxy => !proxy.isActive);
      }
    }

    // プロトコルフィルター
    if (protocolFilter.value) {
      filtered = filtered.filter(
        proxy => proxy.protocol === protocolFilter.value
      );
    }

    return filtered;
  });

  // Methods
  const openCreateDialog = () => {
    editingProxy.value = undefined;
    showFormDialog.value = true;
  };

  const openEditDialog = (proxy: Proxy) => {
    editingProxy.value = proxy;
    showFormDialog.value = true;
  };

  const onProxySaved = () => {
    editingProxy.value = undefined;
  };

  const confirmDelete = (proxy: Proxy) => {
    deletingProxy.value = proxy;
    showDeleteDialog.value = true;
  };

  const deleteProxy = async () => {
    if (!deletingProxy.value) return;

    try {
      deleting.value = true;
      await proxiesStore.deleteProxy(deletingProxy.value.id);
      showDeleteDialog.value = false;
      deletingProxy.value = undefined;
    } catch (error) {
      console.error('プロキシ削除エラー:', error);
    } finally {
      deleting.value = false;
    }
  };

  const handleTestProxy = async (proxy: Proxy) => {
    try {
      testingProxyId.value = proxy.id;
      await proxiesStore.testProxy(proxy.id);
    } catch (error) {
      console.error('プロキシテストエラー:', error);
    } finally {
      testingProxyId.value = null;
    }
  };

  const handleTestAll = async () => {
    await proxiesStore.testAllProxies();
  };

  const applyFilters = () => {
    // フィルターは computed で自動的に適用される
  };

  const clearFilters = () => {
    searchQuery.value = '';
    statusFilter.value = null;
    protocolFilter.value = null;
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'http':
        return 'blue';
      case 'https':
        return 'green';
      case 'socks5':
        return 'purple';
      default:
        return 'grey';
    }
  };

  const formatLastUsed = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ja,
    });
  };

  // Lifecycle
  onMounted(async () => {
    await proxiesStore.fetchProxies();
  });
</script>

<style scoped>
  /* 🎨 プロキシ管理ページのスタイル */

  .proxies-view {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  }

  /* 統計カード */
  .stat-card {
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }

  .gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .gradient-success {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: white;
  }

  .gradient-error {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
  }

  .gradient-warning {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
  }

  .stat-card-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-icon-wrapper {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 10px;
    backdrop-filter: blur(10px);
  }

  .stat-info {
    flex: 1;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .stat-title {
    font-size: 0.85rem;
    opacity: 0.9;
    font-weight: 500;
  }

  /* プロキシリスト */
  .proxies-list-card {
    background: white;
    border: 1px solid #e2e8f0;
  }

  .proxies-list-header {
    background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
    border-bottom: 1px solid #e2e8f0;
    padding: 20px 24px;
    font-weight: 600;
    color: #2c3e50;
  }

  .proxy-item {
    transition: all 0.3s ease;
    border-radius: 0;
  }

  .proxy-item:hover {
    background: rgba(102, 126, 234, 0.04);
  }

  .proxy-status-avatar {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .proxy-info {
    flex: 1;
  }

  .proxy-details {
    margin-top: 8px;
  }

  .proxy-metric {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: #64748b;
  }

  /* アニメーション */
  .stat-card {
    animation: fadeInUp 0.6s ease-out;
  }

  .proxy-item {
    animation: fadeInLeft 0.4s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* レスポンシブ */
  @media (max-width: 768px) {
    .stat-card-content {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }

    .proxy-info {
      margin-left: 0;
    }

    .proxy-details {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
</style>
