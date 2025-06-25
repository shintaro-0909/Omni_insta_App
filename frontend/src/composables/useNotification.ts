import { useNotificationsStore, type NotificationOptions, type NotificationType } from '@/stores/notifications';

/**
 * Vue 3 Composable for unified notification system
 * 
 * Usage examples:
 * const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotification();
 * 
 * notifySuccess('データを保存しました');
 * notifyError('保存に失敗しました', '再試行してください');
 * notifyWarning('未保存の変更があります');
 * notifyInfo('新しい機能が利用可能です');
 */
export function useNotification() {
  const notificationsStore = useNotificationsStore();

  // Quick notification methods
  const notifySuccess = (title: string, message?: string) => {
    return notificationsStore.notifySuccess(title, message);
  };

  const notifyError = (title: string, message?: string) => {
    return notificationsStore.notifyError(title, message);
  };

  const notifyWarning = (title: string, message?: string) => {
    return notificationsStore.notifyWarning(title, message);
  };

  const notifyInfo = (title: string, message?: string) => {
    return notificationsStore.notifyInfo(title, message);
  };

  // Advanced notification with custom options
  const notify = (type: NotificationType, options: NotificationOptions) => {
    return notificationsStore.addNotification(type, options);
  };

  // Common notification patterns
  const notifyFormSuccess = (entityName: string = 'データ') => {
    return notifySuccess(
      `${entityName}を保存しました`,
      '変更が正常に保存されました'
    );
  };

  const notifyFormError = (entityName: string = 'データ') => {
    return notifyError(
      `${entityName}の保存に失敗しました`,
      '入力内容を確認して再試行してください'
    );
  };

  const notifyDeleteSuccess = (entityName: string = 'アイテム') => {
    return notifySuccess(
      `${entityName}を削除しました`,
      '削除が完了しました'
    );
  };

  const notifyDeleteError = (entityName: string = 'アイテム') => {
    return notifyError(
      `${entityName}の削除に失敗しました`,
      '再試行してください'
    );
  };

  const notifyNetworkError = () => {
    return notifyError(
      'ネットワークエラー',
      'インターネット接続を確認してください'
    );
  };

  const notifyPermissionError = () => {
    return notifyError(
      '権限エラー',
      'この操作を実行する権限がありません'
    );
  };

  const notifyPlanLimitWarning = (feature: string) => {
    return notifyWarning(
      'プラン制限',
      `${feature}の利用上限に達しました。プランをアップグレードしてください`
    );
  };

  const notifyFeatureInfo = (feature: string) => {
    return notifyInfo(
      '新機能のお知らせ',
      `${feature}が利用可能になりました`
    );
  };

  // Instagram specific notifications
  const notifyAccountAdded = (username?: string) => {
    return notifySuccess(
      'Instagramアカウントを追加しました',
      username ? `@${username} の連携が完了しました` : 'アカウント連携が完了しました'
    );
  };

  const notifyAccountRemoved = (username?: string) => {
    return notifySuccess(
      'Instagramアカウントを削除しました',
      username ? `@${username} の連携を解除しました` : 'アカウント連携を解除しました'
    );
  };

  const notifyScheduleCreated = (title?: string) => {
    return notifySuccess(
      'スケジュールを作成しました',
      title ? `「${title}」の投稿予約が設定されました` : '投稿予約が設定されました'
    );
  };

  const notifyScheduleUpdated = (title?: string) => {
    return notifySuccess(
      'スケジュールを更新しました',
      title ? `「${title}」の設定を変更しました` : '投稿予約の設定を変更しました'
    );
  };

  const notifyScheduleDeleted = (title?: string) => {
    return notifySuccess(
      'スケジュールを削除しました',
      title ? `「${title}」の投稿予約を取り消しました` : '投稿予約を取り消しました'
    );
  };

  const notifyPostCreated = () => {
    return notifySuccess(
      'コンテンツを作成しました',
      'ライブラリに追加されました'
    );
  };

  const notifyPostUpdated = () => {
    return notifySuccess(
      'コンテンツを更新しました',
      '変更が保存されました'
    );
  };

  const notifyPostDeleted = () => {
    return notifySuccess(
      'コンテンツを削除しました',
      'ライブラリから削除されました'
    );
  };

  // Clear notifications
  const clearNotifications = () => {
    notificationsStore.clearAllNotifications();
  };

  const clearNotificationsByType = (type: NotificationType) => {
    notificationsStore.clearNotificationsByType(type);
  };

  return {
    // Quick methods
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notify,

    // Common patterns
    notifyFormSuccess,
    notifyFormError,
    notifyDeleteSuccess,
    notifyDeleteError,
    notifyNetworkError,
    notifyPermissionError,
    notifyPlanLimitWarning,
    notifyFeatureInfo,

    // Instagram specific
    notifyAccountAdded,
    notifyAccountRemoved,
    notifyScheduleCreated,
    notifyScheduleUpdated,
    notifyScheduleDeleted,
    notifyPostCreated,
    notifyPostUpdated,
    notifyPostDeleted,

    // Management
    clearNotifications,
    clearNotificationsByType,
  };
}