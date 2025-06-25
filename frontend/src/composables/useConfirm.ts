import { useDialogsStore, type ConfirmOptions } from '@/stores/dialogs';

/**
 * Vue 3 Composable for confirmation dialogs
 * 
 * Usage examples:
 * const { confirmDelete, confirmLogout, confirm } = useConfirm();
 * 
 * // Basic confirmation
 * const confirmed = await confirm({
 *   title: '確認',
 *   message: 'この操作を実行しますか？'
 * });
 * 
 * // Predefined confirmations
 * const deleteConfirmed = await confirmDelete('投稿スケジュール');
 * const logoutConfirmed = await confirmLogout();
 */
export function useConfirm() {
  const dialogsStore = useDialogsStore();

  // Basic confirm method
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return dialogsStore.showConfirmDialog(options);
  };

  // Predefined confirmation methods
  const confirmDelete = (
    entityName: string = 'このアイテム',
    details?: string
  ): Promise<boolean> => {
    return dialogsStore.confirmDelete(entityName, details);
  };

  const confirmLogout = (): Promise<boolean> => {
    return dialogsStore.confirmLogout();
  };

  const confirmUnsavedChanges = (): Promise<boolean> => {
    return dialogsStore.confirmUnsavedChanges();
  };

  const confirmPlanUpgrade = (feature: string): Promise<boolean> => {
    return dialogsStore.confirmPlanUpgrade(feature);
  };

  const confirmAccountDisconnect = (username: string): Promise<boolean> => {
    return dialogsStore.confirmAccountDisconnect(username);
  };

  const confirmScheduleDelete = (title: string): Promise<boolean> => {
    return dialogsStore.confirmScheduleDelete(title);
  };

  const confirmBulkDelete = (count: number, entityType: string): Promise<boolean> => {
    return dialogsStore.confirmBulkDelete(count, entityType);
  };

  const confirmDataExport = (dataType: string): Promise<boolean> => {
    return dialogsStore.confirmDataExport(dataType);
  };

  const confirmImportantAction = (actionName: string, impact?: string): Promise<boolean> => {
    return dialogsStore.confirmImportantAction(actionName, impact);
  };

  // Convenience methods for common operations
  const confirmAndExecute = async (
    confirmOptions: ConfirmOptions,
    action: () => void | Promise<void>
  ): Promise<boolean> => {
    const confirmed = await confirm(confirmOptions);
    if (confirmed) {
      await action();
    }
    return confirmed;
  };

  const confirmDeleteAndExecute = async (
    entityName: string,
    deleteAction: () => void | Promise<void>,
    details?: string
  ): Promise<boolean> => {
    const confirmed = await confirmDelete(entityName, details);
    if (confirmed) {
      await deleteAction();
    }
    return confirmed;
  };

  // Instagram specific confirmations
  const confirmPostDelete = (caption?: string): Promise<boolean> => {
    const displayName = caption 
      ? `「${caption.length > 30 ? caption.substring(0, 30) + '...' : caption}」`
      : 'この投稿コンテンツ';
      
    return confirmDelete(displayName, 'ライブラリから削除されます。');
  };

  const confirmSchedulePause = (title: string): Promise<boolean> => {
    return confirm({
      title: 'スケジュール一時停止',
      message: `「${title}」を一時停止しますか？\n\n投稿は実行されなくなります。`,
      confirmText: '一時停止',
      cancelText: 'キャンセル',
      confirmColor: 'warning',
      icon: 'mdi-pause-circle',
    });
  };

  const confirmScheduleResume = (title: string): Promise<boolean> => {
    return confirm({
      title: 'スケジュール再開',
      message: `「${title}」を再開しますか？\n\n設定されたスケジュールで投稿が再開されます。`,
      confirmText: '再開',
      cancelText: 'キャンセル',
      confirmColor: 'success',
      icon: 'mdi-play-circle',
    });
  };

  const confirmImmediatePost = (title: string): Promise<boolean> => {
    return confirm({
      title: '今すぐ投稿',
      message: `「${title}」を今すぐ投稿しますか？\n\nスケジュールを無視して即座に投稿されます。`,
      confirmText: '今すぐ投稿',
      cancelText: 'キャンセル',
      confirmColor: 'primary',
      icon: 'mdi-send',
      persistent: true,
    });
  };

  const confirmAccountRefresh = (username: string): Promise<boolean> => {
    return confirm({
      title: 'アカウント情報更新',
      message: `@${username} の情報を更新しますか？\n\nInstagramから最新情報を取得します。`,
      confirmText: '更新',
      cancelText: 'キャンセル',
      confirmColor: 'info',
      icon: 'mdi-refresh',
    });
  };

  const confirmProxyChange = (): Promise<boolean> => {
    return confirm({
      title: 'プロキシ設定変更',
      message: 'プロキシ設定を変更しますか？\n\n接続に影響する可能性があります。',
      confirmText: '変更',
      cancelText: 'キャンセル',
      confirmColor: 'warning',
      icon: 'mdi-server-network',
    });
  };

  const confirmClearData = (dataType: string): Promise<boolean> => {
    return confirm({
      title: 'データ消去',
      message: `すべての${dataType}を消去しますか？\n\nこの操作は取り消せません。`,
      confirmText: '消去',
      cancelText: 'キャンセル',
      confirmColor: 'error',
      danger: true,
      icon: 'mdi-database-remove',
      persistent: true,
    });
  };

  return {
    // Basic methods
    confirm,
    confirmAndExecute,
    confirmDeleteAndExecute,

    // General confirmations
    confirmDelete,
    confirmLogout,
    confirmUnsavedChanges,
    confirmPlanUpgrade,
    confirmBulkDelete,
    confirmDataExport,
    confirmImportantAction,

    // Instagram specific
    confirmAccountDisconnect,
    confirmScheduleDelete,
    confirmPostDelete,
    confirmSchedulePause,
    confirmScheduleResume,
    confirmImmediatePost,
    confirmAccountRefresh,
    confirmProxyChange,
    confirmClearData,
  };
}