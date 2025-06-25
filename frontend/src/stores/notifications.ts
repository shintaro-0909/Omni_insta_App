import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timeout?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    color?: string;
  }>;
  createdAt: Date;
}

export interface NotificationOptions {
  title: string;
  message?: string;
  timeout?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    color?: string;
  }>;
}

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([]);
  const maxNotifications = ref(5);

  // Computed
  const activeNotifications = computed(() => 
    notifications.value.slice(-maxNotifications.value)
  );

  const hasNotifications = computed(() => 
    notifications.value.length > 0
  );

  // Actions
  const addNotification = (
    type: NotificationType,
    options: NotificationOptions
  ): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: Notification = {
      id,
      type,
      title: options.title,
      message: options.message,
      timeout: options.timeout ?? getDefaultTimeout(type),
      persistent: options.persistent ?? false,
      actions: options.actions,
      createdAt: new Date(),
    };

    notifications.value.push(notification);

    // Auto-remove non-persistent notifications
    if (!notification.persistent && notification.timeout! > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.timeout);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  const clearAllNotifications = () => {
    notifications.value = [];
  };

  const clearNotificationsByType = (type: NotificationType) => {
    notifications.value = notifications.value.filter(n => n.type !== type);
  };

  // Helper methods
  const getDefaultTimeout = (type: NotificationType): number => {
    switch (type) {
      case 'error':
        return 8000; // 8 seconds for errors
      case 'warning':
        return 6000; // 6 seconds for warnings
      case 'success':
        return 4000; // 4 seconds for success
      case 'info':
        return 5000; // 5 seconds for info
      default:
        return 5000;
    }
  };

  // Convenience methods for different notification types
  const showSuccess = (options: NotificationOptions) => 
    addNotification('success', options);

  const showError = (options: NotificationOptions) => 
    addNotification('error', options);

  const showWarning = (options: NotificationOptions) => 
    addNotification('warning', options);

  const showInfo = (options: NotificationOptions) => 
    addNotification('info', options);

  // Quick notification methods
  const notifySuccess = (title: string, message?: string) => 
    showSuccess({ title, message });

  const notifyError = (title: string, message?: string) => 
    showError({ title, message });

  const notifyWarning = (title: string, message?: string) => 
    showWarning({ title, message });

  const notifyInfo = (title: string, message?: string) => 
    showInfo({ title, message });

  return {
    // State
    notifications,
    maxNotifications,

    // Computed
    activeNotifications,
    hasNotifications,

    // Actions
    addNotification,
    removeNotification,
    clearAllNotifications,
    clearNotificationsByType,

    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
});