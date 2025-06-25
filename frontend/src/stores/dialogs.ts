import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ConfirmDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  cancelColor?: string;
  persistent?: boolean;
  danger?: boolean;
  icon?: string;
  resolve: (confirmed: boolean) => void;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  cancelColor?: string;
  persistent?: boolean;
  danger?: boolean;
  icon?: string;
}

export const useDialogsStore = defineStore('dialogs', () => {
  // State
  const confirmDialog = ref<ConfirmDialog | null>(null);
  const isConfirmDialogOpen = ref(false);

  // Actions
  const showConfirmDialog = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = `confirm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      confirmDialog.value = {
        id,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? '確認',
        cancelText: options.cancelText ?? 'キャンセル',
        confirmColor: options.confirmColor ?? 'primary',
        cancelColor: options.cancelColor ?? 'grey',
        persistent: options.persistent ?? false,
        danger: options.danger ?? false,
        icon: options.icon,
        resolve,
      };
      
      isConfirmDialogOpen.value = true;
    });
  };

  const confirmAction = () => {
    if (confirmDialog.value) {
      confirmDialog.value.resolve(true);
      closeConfirmDialog();
    }
  };

  const cancelAction = () => {
    if (confirmDialog.value) {
      confirmDialog.value.resolve(false);
      closeConfirmDialog();
    }
  };

  const closeConfirmDialog = () => {
    isConfirmDialogOpen.value = false;
    confirmDialog.value = null;
  };

  // Predefined confirm dialogs
  const confirmDelete = (
    entityName: string = 'このアイテム',
    details?: string
  ): Promise<boolean> => {
    return showConfirmDialog({
      title: '削除の確認',
      message: details 
        ? `${entityName}を削除しますか？\n\n${details}\n\nこの操作は取り消せません。`
        : `${entityName}を削除しますか？\n\nこの操作は取り消せません。`,
      confirmText: '削除',
      cancelText: 'キャンセル',
      confirmColor: 'error',
      danger: true,
      icon: 'mdi-delete-alert',
      persistent: true,
    });
  };

  const confirmLogout = (): Promise<boolean> => {
    return showConfirmDialog({
      title: 'ログアウトの確認',
      message: 'ログアウトしますか？\n\n未保存の変更がある場合は失われます。',
      confirmText: 'ログアウト',
      cancelText: 'キャンセル',
      confirmColor: 'warning',
      icon: 'mdi-logout',
    });
  };

  const confirmUnsavedChanges = (): Promise<boolean> => {
    return showConfirmDialog({
      title: '未保存の変更',
      message: '未保存の変更があります。\n\n変更を破棄して続行しますか？',
      confirmText: '破棄して続行',
      cancelText: '戻る',
      confirmColor: 'warning',
      icon: 'mdi-alert',
    });
  };

  const confirmPlanUpgrade = (feature: string): Promise<boolean> => {
    return showConfirmDialog({
      title: 'プランアップグレード',
      message: `${feature}を利用するには、プランのアップグレードが必要です。\n\nプラン管理ページに移動しますか？`,
      confirmText: 'プラン管理へ',
      cancelText: 'キャンセル',
      confirmColor: 'primary',
      icon: 'mdi-crown',
    });
  };

  const confirmAccountDisconnect = (username: string): Promise<boolean> => {
    return showConfirmDialog({
      title: 'アカウント連携解除',
      message: `@${username} の連携を解除しますか？\n\n関連するスケジュールも削除されます。`,
      confirmText: '連携解除',
      cancelText: 'キャンセル',
      confirmColor: 'error',
      danger: true,
      icon: 'mdi-account-remove',
      persistent: true,
    });
  };

  const confirmScheduleDelete = (title: string): Promise<boolean> => {
    return showConfirmDialog({
      title: 'スケジュール削除',
      message: `「${title}」を削除しますか？\n\n設定されている投稿予約も取り消されます。`,
      confirmText: '削除',
      cancelText: 'キャンセル',
      confirmColor: 'error',
      danger: true,
      icon: 'mdi-calendar-remove',
      persistent: true,
    });
  };

  const confirmBulkDelete = (count: number, entityType: string): Promise<boolean> => {
    return showConfirmDialog({
      title: '一括削除の確認',
      message: `選択した${count}件の${entityType}を削除しますか？\n\nこの操作は取り消せません。`,
      confirmText: `${count}件削除`,
      cancelText: 'キャンセル',
      confirmColor: 'error',
      danger: true,
      icon: 'mdi-delete-sweep',
      persistent: true,
    });
  };

  const confirmDataExport = (dataType: string): Promise<boolean> => {
    return showConfirmDialog({
      title: 'データエクスポート',
      message: `${dataType}をエクスポートしますか？\n\n処理に時間がかかる場合があります。`,
      confirmText: 'エクスポート',
      cancelText: 'キャンセル',
      confirmColor: 'primary',
      icon: 'mdi-download',
    });
  };

  const confirmImportantAction = (actionName: string, impact?: string): Promise<boolean> => {
    return showConfirmDialog({
      title: '重要な操作の確認',
      message: impact 
        ? `${actionName}を実行しますか？\n\n${impact}`
        : `${actionName}を実行しますか？`,
      confirmText: '実行',
      cancelText: 'キャンセル',
      confirmColor: 'warning',
      icon: 'mdi-alert-circle',
      persistent: true,
    });
  };

  return {
    // State
    confirmDialog,
    isConfirmDialogOpen,

    // Actions
    showConfirmDialog,
    confirmAction,
    cancelAction,
    closeConfirmDialog,

    // Predefined dialogs
    confirmDelete,
    confirmLogout,
    confirmUnsavedChanges,
    confirmPlanUpgrade,
    confirmAccountDisconnect,
    confirmScheduleDelete,
    confirmBulkDelete,
    confirmDataExport,
    confirmImportantAction,
  };
});