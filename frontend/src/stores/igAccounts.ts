import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebase';
import { isRunningInEmulator, showEmulatorNotification } from '@/services/mockAuth';
// import { usePersistedCache, createCachedStoreAction } from '@/composables/api/usePersistedCache'
// TODO: Re-enable when these composables are implemented

// Mock implementations for development (unused but kept for future re-enabling)
// const createCachedStoreAction = (fn: any) => fn

// IGアカウントの型定義
export interface IGAccount {
  id: string;
  instagramUserId: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
  tokenExpiresAt: Date;
  proxyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddAccountData {
  accessToken: string;
  instagramUserId: string;
  username: string;
  profilePictureUrl?: string;
  followersCount?: number;
  mediaCount?: number;
  pageId?: string;
  pageName?: string;
}

export const useIgAccountsStore = defineStore('igAccounts', () => {
  // State
  const accounts = ref<IGAccount[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const accountsCount = computed(() => accounts.value.length);
  const accountById = computed(
    () => (id: string) => accounts.value.find(account => account.id === id)
  );
  const accountByUsername = computed(
    () => (username: string) =>
      accounts.value.find(account => account.username === username)
  );

  // Actions
  const getInstagramUserInfo = async (accessToken: string) => {
    try {
      loading.value = true;
      error.value = null;

      const getUserInfoFn = httpsCallable(functions, 'getInstagramUserInfo');
      const result = await getUserInfoFn({ accessToken });
      const data = result.data as any;

      if (data.success) {
        return data.userInfo;
      } else {
        throw new Error('Failed to get Instagram user info');
      }
    } catch (err: any) {
      error.value = err.message || 'Instagram ユーザー情報の取得に失敗しました';
      console.error('Instagram ユーザー情報取得エラー:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addAccount = async (accountData: AddAccountData) => {
    try {
      loading.value = true;
      error.value = null;

      // エミュレーター環境ではモック処理
      if (isRunningInEmulator()) {
        console.log('🔔 Mock: Adding Instagram account...', accountData);
        showEmulatorNotification('アカウントを追加中...', 'info');
        
        // モックアカウントをローカルに追加
        const mockAccount: IGAccount = {
          id: 'mock_account_' + Date.now(),
          instagramUserId: accountData.instagramUserId,
          username: accountData.username,
          name: accountData.username,
          profilePictureUrl: accountData.profilePictureUrl,
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60日後
          proxyId: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // ローカルストレージに保存 (エミュレーター用)
        const existingAccounts = JSON.parse(localStorage.getItem('mock_ig_accounts') || '[]');
        existingAccounts.push(mockAccount);
        localStorage.setItem('mock_ig_accounts', JSON.stringify(existingAccounts));
        
        // ストアを更新
        accounts.value.push(mockAccount);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // シミュレート避延
        showEmulatorNotification('アカウントを追加しました！', 'success');
        
        return mockAccount.id;
      }

      const addAccountFn = httpsCallable(functions, 'addInstagramAccount');
      const result = await addAccountFn(accountData);
      const data = result.data as any;

      if (data.success) {
        // アカウント一覧を再読み込み
        await loadAccounts();
        return data.accountId;
      } else {
        throw new Error('Failed to add Instagram account');
      }
    } catch (err: any) {
      error.value = err.message || 'Instagram アカウントの追加に失敗しました';
      console.error('Instagram アカウント追加エラー:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create cached fetcher for IG accounts (simplified)
  const cachedAccountsFetcher = async () => {
    const getAccountsFn = httpsCallable(functions, 'getInstagramAccounts');
    const result = await getAccountsFn({});
    const data = result.data as any;

    if (data.success) {
      return data.accounts.map((account: any) => ({
        ...account,
        tokenExpiresAt: new Date(account.tokenExpiresAt.seconds * 1000),
        createdAt: new Date(account.createdAt.seconds * 1000),
        updatedAt: new Date(account.updatedAt.seconds * 1000),
      }));
    } else {
      throw new Error('Failed to load Instagram accounts');
    }
  };

  const loadAccounts = async () => {
    try {
      loading.value = true;
      error.value = null;

      // エミュレーター環境ではローカルストレージから読み込み
      if (isRunningInEmulator()) {
        console.log('🔔 Mock: Loading accounts from localStorage...');
        const mockAccounts = JSON.parse(localStorage.getItem('mock_ig_accounts') || '[]');
        accounts.value = mockAccounts.map((account: any) => ({
          ...account,
          tokenExpiresAt: new Date(account.tokenExpiresAt),
          createdAt: new Date(account.createdAt),
          updatedAt: new Date(account.updatedAt)
        }));
        return;
      }

      // Use cached fetcher for better performance
      accounts.value = await cachedAccountsFetcher();
    } catch (err: any) {
      error.value =
        err.message || 'Instagram アカウントの読み込みに失敗しました';
      console.error('Instagram アカウント読み込みエラー:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      loading.value = true;
      error.value = null;

      // エミュレーター環境ではモック処理
      if (isRunningInEmulator()) {
        console.log('🔔 Mock: Deleting account...', accountId);
        showEmulatorNotification('アカウントを削除中...', 'info');
        
        // ローカルストレージから削除
        const existingAccounts = JSON.parse(localStorage.getItem('mock_ig_accounts') || '[]');
        const filteredAccounts = existingAccounts.filter((account: any) => account.id !== accountId);
        localStorage.setItem('mock_ig_accounts', JSON.stringify(filteredAccounts));
        
        // ストアから削除
        accounts.value = accounts.value.filter(account => account.id !== accountId);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        showEmulatorNotification('アカウントを削除しました', 'success');
        return;
      }

      const deleteAccountFn = httpsCallable(
        functions,
        'deleteInstagramAccount'
      );
      const result = await deleteAccountFn({ accountId });
      const data = result.data as any;

      if (data.success) {
        // ローカルの一覧から削除
        accounts.value = accounts.value.filter(
          account => account.id !== accountId
        );
      } else {
        throw new Error('Failed to delete Instagram account');
      }
    } catch (err: any) {
      error.value = err.message || 'Instagram アカウントの削除に失敗しました';
      console.error('Instagram アカウント削除エラー:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const refreshToken = async (accountId: string) => {
    try {
      loading.value = true;
      error.value = null;

      // エミュレーター環境ではモック処理
      if (isRunningInEmulator()) {
        console.log('🔔 Mock: Refreshing token...', accountId);
        showEmulatorNotification('トークンを更新中...', 'info');
        
        // ローカルストレージのアカウントを更新
        const existingAccounts = JSON.parse(localStorage.getItem('mock_ig_accounts') || '[]');
        const updatedAccounts = existingAccounts.map((account: any) => {
          if (account.id === accountId) {
            return {
              ...account,
              tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60日後
              updatedAt: new Date()
            };
          }
          return account;
        });
        localStorage.setItem('mock_ig_accounts', JSON.stringify(updatedAccounts));
        
        // ストアを更新
        await loadAccounts();
        
        await new Promise(resolve => setTimeout(resolve, 800));
        showEmulatorNotification('トークンを更新しました', 'success');
        
        const newExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
        return newExpiresAt.toISOString();
      }

      const refreshTokenFn = httpsCallable(functions, 'refreshInstagramToken');
      const result = await refreshTokenFn({ accountId });
      const data = result.data as any;

      if (data.success) {
        // アカウント一覧を再読み込み
        await loadAccounts();
        return data.expiresAt;
      } else {
        throw new Error('Failed to refresh Instagram token');
      }
    } catch (err: any) {
      error.value = err.message || 'アクセストークンの更新に失敗しました';
      console.error('アクセストークン更新エラー:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
    accounts.value = [];
    loading.value = false;
    error.value = null;
  };

  return {
    // State
    accounts,
    loading,
    error,
    // Getters
    accountsCount,
    accountById,
    accountByUsername,
    // Actions
    getInstagramUserInfo,
    addAccount,
    loadAccounts,
    fetchAccounts: loadAccounts, // エイリアス
    deleteAccount,
    refreshToken,
    clearError,
    reset,
  };
});
