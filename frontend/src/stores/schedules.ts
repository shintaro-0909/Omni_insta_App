import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getFunctions, httpsCallable } from 'firebase/functions';
// import { usePersistedCache, createCachedStoreAction } from '@/composables/api/usePersistedCache'
// TODO: Re-enable when these composables are implemented

// Mock implementations for development (unused but kept for future re-enabling)
// const createCachedStoreAction = (fn: any) => fn

// スケジュールタイプの定義
export type ScheduleType = 'one_time' | 'recurring' | 'random';
export type ScheduleStatus = 'active' | 'paused' | 'error' | 'completed';

// 繰返ルールの型定義
export interface RepeatRule {
  // 繰返投稿用
  weekdays?: number[]; // 0=日曜, 1=月曜, ...
  time?: string; // "HH:mm" format
  timezone?: string;

  // ランダム投稿用
  minInterval?: number; // 最小間隔（分）
  maxInterval?: number; // 最大間隔（分）
  timeWindow?: {
    start: string; // "HH:mm"
    end: string; // "HH:mm"
  };
}

// スケジュールデータの型定義
export interface Schedule {
  id: string;
  ownerUid: string;
  type: ScheduleType;
  title: string;
  description?: string;
  nextRunAt: any; // Firestore Timestamp
  status: ScheduleStatus;
  repeatRule?: RepeatRule;
  lastRunAt?: any; // Firestore Timestamp
  runCount: number;
  retryCount: number;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp

  // 関連データ
  igAccount?: {
    id: string;
    username: string;
  };
  content?: {
    id: string;
    mediaUrls: string[];
    caption: string;
    tags?: string[];
  };
}

// スケジュール作成データ
export interface CreateScheduleData {
  igAccountId: string;
  contentId: string;
  type: ScheduleType;
  title: string;
  description?: string;
  scheduledTime?: string; // ISO string for one_time
  repeatRule?: RepeatRule;
}

// スケジュール更新データ
export interface UpdateScheduleData {
  scheduleId: string;
  igAccountId: string;
  title?: string;
  description?: string;
  status?: ScheduleStatus;
  scheduledTime?: string;
  repeatRule?: RepeatRule;
}

export const useSchedulesStore = defineStore('schedules', () => {
  // State
  const schedules = ref<Schedule[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasMore = ref(true);
  const lastScheduleId = ref<string | null>(null);

  // Computed
  const activeSchedules = computed(() =>
    schedules.value.filter(s => s.status === 'active')
  );

  const completedSchedules = computed(() =>
    schedules.value.filter(s => s.status === 'completed')
  );

  const errorSchedules = computed(() =>
    schedules.value.filter(s => s.status === 'error')
  );

  const schedulesCount = computed(() => ({
    total: schedules.value.length,
    active: activeSchedules.value.length,
    completed: completedSchedules.value.length,
    error: errorSchedules.value.length,
  }));

  // Firebase Functions
  const functions = getFunctions();
  const createScheduleFunc = httpsCallable(functions, 'createSchedule');
  const getSchedulesFunc = httpsCallable(functions, 'getSchedules');
  const getScheduleFunc = httpsCallable(functions, 'getSchedule');
  const updateScheduleFunc = httpsCallable(functions, 'updateSchedule');
  const deleteScheduleFunc = httpsCallable(functions, 'deleteSchedule');

  // Actions
  const createSchedule = async (data: CreateScheduleData): Promise<string> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await createScheduleFunc(data);
      const response = result.data as any;

      if (response.success) {
        // 新しいスケジュールを一覧に追加するため再取得
        await fetchSchedules(true);
        return response.scheduleId;
      } else {
        throw new Error(response.message || 'Failed to create schedule');
      }
    } catch (err: any) {
      error.value = err.message || 'スケジュールの作成に失敗しました';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create cached fetcher for schedules (simplified)
  const cachedSchedulesFetcher = async (
    filters?: {
      status?: ScheduleStatus;
      type?: ScheduleType;
      igAccountId?: string;
    },
    lastScheduleId?: string | null
  ) => {
    const params: any = {
      limit: 20,
      ...filters,
    };

    if (lastScheduleId) {
      params.lastScheduleId = lastScheduleId;
    }

    const result = await getSchedulesFunc(params);
    const response = result.data as any;

    if (response.success) {
      return {
        schedules: response.schedules,
        hasMore: response.hasMore,
        lastScheduleId: response.lastScheduleId,
      };
    } else {
      throw new Error(response.message || 'Failed to fetch schedules');
    }
  };

  const fetchSchedules = async (
    reset: boolean = false,
    filters?: {
      status?: ScheduleStatus;
      type?: ScheduleType;
      igAccountId?: string;
    }
  ): Promise<void> => {
    try {
      loading.value = true;
      if (reset) {
        error.value = null;
        schedules.value = [];
        lastScheduleId.value = null;
        hasMore.value = true;
      }

      if (!hasMore.value && !reset) {
        return;
      }

      // Use cached fetcher for better performance
      const result = await cachedSchedulesFetcher(
        filters,
        lastScheduleId.value
      );

      if (reset) {
        schedules.value = result.schedules;
      } else {
        schedules.value.push(...result.schedules);
      }

      hasMore.value = result.hasMore;
      lastScheduleId.value = result.lastScheduleId;
    } catch (err: any) {
      error.value = err.message || 'スケジュールの取得に失敗しました';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchSchedule = async (
    scheduleId: string,
    igAccountId: string
  ): Promise<Schedule> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await getScheduleFunc({ scheduleId, igAccountId });
      const response = result.data as any;

      if (response.success) {
        return response.schedule;
      } else {
        throw new Error(response.message || 'Failed to fetch schedule');
      }
    } catch (err: any) {
      error.value = err.message || 'スケジュールの取得に失敗しました';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSchedule = async (data: UpdateScheduleData): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await updateScheduleFunc(data);
      const response = result.data as any;

      if (response.success) {
        // ローカル状態を更新
        const index = schedules.value.findIndex(s => s.id === data.scheduleId);
        if (index !== -1) {
          // 更新されたデータを取得
          const updatedSchedule = await fetchSchedule(
            data.scheduleId,
            data.igAccountId
          );
          schedules.value[index] = updatedSchedule;
        }
      } else {
        throw new Error(response.message || 'Failed to update schedule');
      }
    } catch (err: any) {
      error.value = err.message || 'スケジュールの更新に失敗しました';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSchedule = async (
    scheduleId: string,
    igAccountId: string
  ): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await deleteScheduleFunc({ scheduleId, igAccountId });
      const response = result.data as any;

      if (response.success) {
        // ローカル状態から削除
        schedules.value = schedules.value.filter(s => s.id !== scheduleId);
      } else {
        throw new Error(response.message || 'Failed to delete schedule');
      }
    } catch (err: any) {
      error.value = err.message || 'スケジュールの削除に失敗しました';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearSchedules = (): void => {
    schedules.value = [];
    hasMore.value = true;
    lastScheduleId.value = null;
    error.value = null;
  };

  const clearError = (): void => {
    error.value = null;
  };

  return {
    // State
    schedules,
    loading,
    error,
    hasMore,

    // Computed
    activeSchedules,
    completedSchedules,
    errorSchedules,
    schedulesCount,

    // Actions
    createSchedule,
    fetchSchedules,
    fetchSchedule,
    updateSchedule,
    deleteSchedule,
    clearSchedules,
    clearError,
  };
});
