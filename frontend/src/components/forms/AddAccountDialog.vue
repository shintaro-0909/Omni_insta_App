<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
        <span>Instagram アカウントを追加</span>
        <v-chip size="small" color="primary">Step {{ currentStep }}/3</v-chip>
      </v-card-title>

      <v-card-text>
        <v-stepper v-model="currentStep" alt-labels>
          <v-stepper-header>
            <v-stepper-item
              :complete="currentStep > 1"
              :value="1"
              title="アクセストークン"
            />
            <v-divider />
            <v-stepper-item
              :complete="currentStep > 2"
              :value="2"
              title="アカウント確認"
            />
            <v-divider />
            <v-stepper-item :value="3" title="完了" />
          </v-stepper-header>

          <v-stepper-window>
            <!-- ステップ1: 認証方法選択 -->
            <v-stepper-window-item :value="1">
              <div class="mb-4">
                <h3 class="text-h6 font-weight-bold mb-2">
                  Instagram アカウントを連携
                </h3>
                <p class="text-body-2 text-grey-darken-1 mb-4">
                  Instagram ビジネス/クリエイターアカウントを連携します
                </p>
              </div>

              <!-- Facebook認証（推奨） -->
              <v-card 
                variant="outlined" 
                class="mb-4 pa-4" 
                :color="authMethod === 'facebook' ? 'primary' : undefined"
                @click="authMethod = 'facebook'"
              >
                <div class="d-flex align-center">
                  <v-radio
                    :model-value="authMethod"
                    value="facebook"
                    class="mr-4"
                  />
                  <div class="flex-grow-1">
                    <h4 class="text-subtitle-1 font-weight-bold d-flex align-center">
                      <v-icon size="24" color="blue" class="mr-2">mdi-facebook</v-icon>
                      Facebook でログイン（推奨）
                    </h4>
                    <p class="text-body-2 text-grey-darken-1 mb-0">
                      Facebookアカウントでログインして、Instagram ビジネスアカウントを自動で連携
                    </p>
                  </div>
                </div>
              </v-card>

              <!-- 手動設定 -->
              <v-card 
                variant="outlined" 
                class="pa-4"
                :color="authMethod === 'manual' ? 'primary' : undefined"
                @click="authMethod = 'manual'"
              >
                <div class="d-flex align-center">
                  <v-radio
                    :model-value="authMethod"
                    value="manual"
                    class="mr-4"
                  />
                  <div class="flex-grow-1">
                    <h4 class="text-subtitle-1 font-weight-bold d-flex align-center">
                      <v-icon size="24" class="mr-2">mdi-key</v-icon>
                      アクセストークンを手動で入力
                    </h4>
                    <p class="text-body-2 text-grey-darken-1 mb-0">
                      Meta for Developers で取得したアクセストークンを直接入力
                    </p>
                  </div>
                </div>
              </v-card>

              <!-- Facebook認証ボタン -->
              <div v-if="authMethod === 'facebook'" class="text-center mt-6">
                <v-btn
                  color="blue"
                  size="large"
                  variant="flat"
                  @click="handleFacebookLogin"
                  :loading="loading"
                  prepend-icon="mdi-facebook"
                >
                  Facebook でログイン
                </v-btn>
              </div>

              <!-- 手動入力フォーム -->
              <v-form 
                v-if="authMethod === 'manual'" 
                ref="tokenFormRef" 
                v-model="isTokenFormValid"
                class="mt-4"
              >
                <v-textarea
                  v-model="form.accessToken"
                  label="アクセストークン *"
                  :rules="[rules.required]"
                  placeholder="IGQVJ..."
                  variant="outlined"
                  rows="3"
                  class="mb-4"
                />

                <v-alert type="info" variant="tonal" class="text-body-2">
                  <strong>アクセストークンの取得方法:</strong><br />
                  1. Meta for Developers にアクセス<br />
                  2. アプリを作成し、Instagram Graph API を有効化<br />
                  3. 長期有効トークンを生成<br />
                  4. 上記のフィールドに貼り付け
                </v-alert>
              </v-form>
            </v-stepper-window-item>

            <!-- ステップ2: アカウント選択（Facebook認証の場合） -->
            <v-stepper-window-item v-if="authMethod === 'facebook' && availableAccounts.length > 0" :value="2">
              <div>
                <h3 class="text-h6 font-weight-bold mb-4">
                  連携するアカウントを選択
                </h3>
                

                <v-radio-group v-model="selectedAccountId">
                  <v-card
                    v-for="account in availableAccounts"
                    :key="account.id"
                    variant="outlined"
                    class="mb-3 pa-4"
                    :color="selectedAccountId === account.id ? 'primary' : undefined"
                    @click="selectedAccountId = account.id"
                  >
                    <div class="d-flex align-center">
                      <v-radio
                        :value="account.id"
                        class="mr-4"
                      />
                      <v-avatar size="48" class="mr-4">
                        <v-img 
                          :src="account.profilePictureUrl || account.profile_picture_url || 'https://via.placeholder.com/48'" 
                          :alt="account.username"
                        />
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="text-h6 font-weight-bold">
                          @{{ account.username }}
                        </div>
                        <div class="text-body-2 text-grey-darken-1">
                          <v-chip size="x-small" class="mr-2">
                            <v-icon start size="12">mdi-account-multiple</v-icon>
                            {{ (account.followersCount || account.followers_count || 0).toLocaleString() }} フォロワー
                          </v-chip>
                          <v-chip size="x-small">
                            <v-icon start size="12">mdi-image-multiple</v-icon>
                            {{ (account.mediaCount || account.media_count || 0).toLocaleString() }} 投稿
                          </v-chip>
                        </div>
                        <div class="text-caption text-grey mt-1">
                          ページ: {{ account.pageName }}
                        </div>
                      </div>
                    </div>
                  </v-card>
                </v-radio-group>

                <v-alert v-if="availableAccounts.length === 0" type="warning" variant="tonal">
                  Instagram ビジネス/クリエイターアカウントが見つかりませんでした。<br />
                  Instagramアカウントをビジネスアカウントに変換してください。
                </v-alert>
              </div>
            </v-stepper-window-item>

            <!-- ステップ2: アカウント確認（手動入力の場合） -->
            <v-stepper-window-item v-if="authMethod === 'manual'" :value="2">
              <div v-if="userInfo">
                <h3 class="text-h6 font-weight-bold mb-4">
                  アカウント情報を確認
                </h3>

                <v-card variant="outlined" class="mb-4">
                  <v-card-text>
                    <div class="d-flex align-center">
                      <v-icon size="48" color="pink" class="mr-4">
                        mdi-instagram
                      </v-icon>
                      <div>
                        <div class="text-h6 font-weight-bold">
                          @{{ userInfo.username }}
                        </div>
                        <div class="text-body-2 text-grey-darken-1">
                          ID: {{ userInfo.instagramUserId }}
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <v-alert type="success" variant="tonal" class="mb-4">
                  アカウント情報を正常に取得しました。<br />
                  このアカウントを追加してもよろしいですか？
                </v-alert>
              </div>

              <div v-else-if="loading">
                <div class="text-center py-8">
                  <v-progress-circular
                    indeterminate
                    size="64"
                    color="primary"
                    class="mb-4"
                  />
                  <div class="text-h6">アカウント情報を取得中...</div>
                </div>
              </div>
            </v-stepper-window-item>

            <!-- ステップ3: 完了 -->
            <v-stepper-window-item :value="3">
              <div class="text-center py-8">
                <v-icon size="80" color="success" class="mb-4">
                  mdi-check-circle
                </v-icon>
                <h3 class="text-h6 font-weight-bold mb-2">
                  アカウントを追加しました！
                </h3>
                <p class="text-body-1 text-grey-darken-1">
                  Instagram アカウント「@{{ userInfo?.username }}」が<br />
                  正常に追加されました。
                </p>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <!-- ステップ1のボタン -->
        <template v-if="currentStep === 1">
          <v-btn 
            variant="text" 
            @click="handleCancel"
            :disabled="loading"
          > 
            キャンセル 
          </v-btn>
          <v-btn
            v-if="authMethod === 'manual'"
            color="primary"
            variant="flat"
            @click="handleNext"
            :loading="loading"
            :disabled="!isTokenFormValid"
          >
            次へ
          </v-btn>
        </template>

        <!-- ステップ2のボタン -->
        <template v-if="currentStep === 2">
          <v-btn variant="text" @click="currentStep = 1" :disabled="loading">
            戻る
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="handleAddAccount"
            :loading="loading"
            :disabled="authMethod === 'facebook' && !selectedAccountId"
          >
            {{ loading ? '処理中...' : 'アカウントを追加' }}
          </v-btn>
          
        </template>

        <!-- ステップ3のボタン -->
        <template v-if="currentStep === 3">
          <v-btn color="primary" variant="flat" @click="handleComplete">
            完了
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, nextTick, onMounted } from 'vue';
  import { useIgAccountsStore } from '@/stores';
  import { authenticateInstagramAccount } from '@/services/auth';

  interface Props {
    modelValue: boolean;
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'added'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const igAccountsStore = useIgAccountsStore();

  // State
  const currentStep = ref(1);
  const tokenFormRef = ref();
  const isTokenFormValid = ref(false);
  const loading = ref(false);
  const userInfo = ref<any>(null);
  const authMethod = ref<'manual' | 'facebook'>('facebook');
  const facebookToken = ref<string>('');
  const availableAccounts = ref<any[]>([]);
  const selectedAccountId = ref<string>('');

  // Form data
  const form = ref({
    accessToken: '',
  });

  // Validation rules
  const rules = {
    required: (value: string) => !!value || '必須項目です',
  };

  // Methods
  const resetForm = () => {
    form.value = {
      accessToken: '',
    };
    currentStep.value = 1;
    userInfo.value = null;
    authMethod.value = 'facebook';
    facebookToken.value = '';
    availableAccounts.value = [];
    selectedAccountId.value = '';
    if (tokenFormRef.value) {
      tokenFormRef.value.resetValidation();
    }
  };

  const handleCancel = () => {
    console.log('🔔 Cancel button clicked');
    emit('update:modelValue', false);
    nextTick(() => {
      resetForm();
    });
  };

  const handleFacebookLogin = async () => {
    console.log('🔔 Facebook login button clicked');
    
    try {
      loading.value = true;
      console.log('🔔 Loading set to true');

      // Facebook認証を実行し、長期トークンを取得
      console.log('🔔 Starting Facebook authentication...');
      const result = await authenticateInstagramAccount();
      console.log('🔔 Authentication result:', result);
      
      facebookToken.value = result.facebookToken;
      availableAccounts.value = result.accounts;

      if (result.accounts && result.accounts.length > 0) {
        console.log('🔔 Found', result.accounts.length, 'Instagram accounts');
        // アカウントが見つかった場合は選択画面へ
        currentStep.value = 2;
        // 1つしかない場合は自動選択
        if (result.accounts.length === 1) {
          selectedAccountId.value = result.accounts[0].id;
          console.log('🔔 Auto-selected account:', result.accounts[0].username);
        }
      } else {
        // アカウントが見つからない場合
        console.warn('🔔 No Instagram business accounts found');
        throw new Error('Instagram ビジネスアカウントが見つかりませんでした');
      }
    } catch (error: any) {
      console.error('🔔 Facebook認証エラー:', error);
      // エラー通知はストアで管理
      igAccountsStore.error = error.message || 'Facebook認証に失敗しました';
    } finally {
      loading.value = false;
      console.log('🔔 Loading set to false');
    }
  };

  const handleNext = async () => {
    if (authMethod.value === 'manual' && !isTokenFormValid.value) return;

    try {
      loading.value = true;

      // Instagram ユーザー情報を取得
      userInfo.value = await igAccountsStore.getInstagramUserInfo(
        form.value.accessToken
      );

      currentStep.value = 2;
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      // エラーはストアで管理されているため、ここでは何もしない
    } finally {
      loading.value = false;
    }
  };

  const handleAddAccount = async () => {
    console.log('🔔 Add account button clicked in step 2');
    console.log('🔔 Current state:', {
      authMethod: authMethod.value,
      selectedAccountId: selectedAccountId.value,
      availableAccountsCount: availableAccounts.value.length,
      loading: loading.value
    });
    
    try {
      loading.value = true;

      if (authMethod.value === 'facebook') {
        // Facebook認証の場合
        const selectedAccount = availableAccounts.value.find(a => a.id === selectedAccountId.value);
        console.log('🔔 Selected account:', selectedAccount);
        if (!selectedAccount) {
          console.error('🔔 No account selected!');
          return;
        }

        console.log('🔔 Adding account to store...');
        await igAccountsStore.addAccount({
          accessToken: selectedAccount.accessToken,
          instagramUserId: selectedAccount.id,
          username: selectedAccount.username,
          profilePictureUrl: selectedAccount.profilePictureUrl || selectedAccount.profile_picture_url,
          followersCount: selectedAccount.followersCount || selectedAccount.followers_count,
          mediaCount: selectedAccount.mediaCount || selectedAccount.media_count,
          pageId: selectedAccount.pageId,
          pageName: selectedAccount.pageName,
        });
        console.log('🔔 Account added successfully');

        userInfo.value = selectedAccount;
      } else {
        // 手動入力の場合
        if (!userInfo.value) return;

        await igAccountsStore.addAccount({
          accessToken: form.value.accessToken,
          instagramUserId: userInfo.value.instagramUserId,
          username: userInfo.value.username,
        });
      }

      currentStep.value = 3;
    } catch (error) {
      console.error('アカウント追加エラー:', error);
      // エラーはストアで管理されているため、ここでは何もしない
    } finally {
      loading.value = false;
    }
  };

  const handleComplete = () => {
    emit('added');
    emit('update:modelValue', false);
    nextTick(() => {
      resetForm();
    });
  };

  // Watch for dialog open/close
  watch(
    () => props.modelValue,
    newValue => {
      console.log('🔘 AddAccountDialog modelValue changed to:', newValue);
      if (newValue) {
        nextTick(() => {
          resetForm();
        });
      }
    }
  );

  // マウント時のデバッグログ
  onMounted(() => {
    console.log('🔘 AddAccountDialog mounted');
  });
</script>

<style scoped>
  .v-card {
    overflow-y: auto;
    max-height: 90vh;
  }
</style>
