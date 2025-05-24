import * as admin from "firebase-admin";

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
    end: string;   // "HH:mm"
  };
}

// スケジュールデータの型定義
export interface ScheduleData {
  ownerUid: string;
  igAccountRef: FirebaseFirestore.DocumentReference;
  contentRef: FirebaseFirestore.DocumentReference;
  type: ScheduleType;
  title: string;
  description?: string;
  nextRunAt: FirebaseFirestore.Timestamp;
  status: ScheduleStatus;
  repeatRule?: RepeatRule;
  lastRunAt?: FirebaseFirestore.Timestamp;
  runCount: number;
  retryCount: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

/**
 * 次回実行時刻を計算する
 */
export function calculateNextRunAt(
  type: ScheduleType,
  scheduledTime: Date,
  repeatRule?: RepeatRule,
  timezone: string = 'Asia/Tokyo'
): Date {
  const now = new Date();
  
  switch (type) {
    case 'one_time':
      return calculateOneTimeNextRun(scheduledTime, now);
    
    case 'recurring':
      return calculateRecurringNextRun(repeatRule, timezone, now);
    
    case 'random':
      return calculateRandomNextRun(repeatRule, timezone, now);
    
    default:
      throw new Error(`Unsupported schedule type: ${type}`);
  }
}

/**
 * 一回限り投稿の次回実行時刻を計算
 */
function calculateOneTimeNextRun(scheduledTime: Date, now: Date): Date {
  // 指定時刻が過去の場合はエラー
  if (scheduledTime <= now) {
    throw new Error('Scheduled time must be in the future');
  }
  
  return new Date(scheduledTime);
}

/**
 * 繰返投稿の次回実行時刻を計算
 */
function calculateRecurringNextRun(
  repeatRule: RepeatRule | undefined,
  timezone: string,
  now: Date
): Date {
  if (!repeatRule || !repeatRule.weekdays || !repeatRule.time) {
    throw new Error('Recurring schedule requires weekdays and time');
  }
  
  const { weekdays, time } = repeatRule;
  const [hours, minutes] = time.split(':').map(Number);
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time format');
  }
  
  // タイムゾーンを考慮した現在時刻
  const nowInTimezone = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  // 今日から7日後まで検索
  for (let daysOffset = 0; daysOffset < 7; daysOffset++) {
    const candidateDate = new Date(nowInTimezone);
    candidateDate.setDate(candidateDate.getDate() + daysOffset);
    candidateDate.setHours(hours, minutes, 0, 0);
    
    const dayOfWeek = candidateDate.getDay();
    
    // 指定された曜日かチェック
    if (weekdays.includes(dayOfWeek)) {
      // 今日の場合は、現在時刻より後かチェック
      if (daysOffset === 0 && candidateDate <= nowInTimezone) {
        continue;
      }
      
      // タイムゾーンをUTCに戻す
      return new Date(candidateDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    }
  }
  
  throw new Error('No valid next run time found for recurring schedule');
}

/**
 * ランダム投稿の次回実行時刻を計算
 */
function calculateRandomNextRun(
  repeatRule: RepeatRule | undefined,
  timezone: string,
  now: Date
): Date {
  if (!repeatRule || !repeatRule.minInterval || !repeatRule.maxInterval) {
    throw new Error('Random schedule requires minInterval and maxInterval');
  }
  
  const { minInterval, maxInterval, timeWindow } = repeatRule;
  
  if (minInterval <= 0 || maxInterval <= 0 || minInterval > maxInterval) {
    throw new Error('Invalid interval values');
  }
  
  // ランダムな間隔を計算（分単位）
  const randomInterval = Math.floor(
    Math.random() * (maxInterval - minInterval + 1) + minInterval
  );
  
  const nextRun = new Date(now.getTime() + randomInterval * 60 * 1000);
  
  // 時間窓が指定されている場合は調整
  if (timeWindow) {
    return adjustToTimeWindow(nextRun, timeWindow, timezone);
  }
  
  return nextRun;
}

/**
 * 指定された時間窓に合わせて時刻を調整
 */
function adjustToTimeWindow(
  targetTime: Date,
  timeWindow: { start: string; end: string },
  timezone: string
): Date {
  const [startHours, startMinutes] = timeWindow.start.split(':').map(Number);
  const [endHours, endMinutes] = timeWindow.end.split(':').map(Number);
  
  // タイムゾーンを考慮した時刻
  const targetInTimezone = new Date(targetTime.toLocaleString('en-US', { timeZone: timezone }));
  
  const startTime = new Date(targetInTimezone);
  startTime.setHours(startHours, startMinutes, 0, 0);
  
  const endTime = new Date(targetInTimezone);
  endTime.setHours(endHours, endMinutes, 0, 0);
  
  // 終了時刻が開始時刻より早い場合（日をまたぐ場合）
  if (endTime <= startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }
  
  // 時間窓内の場合はそのまま返す
  if (targetInTimezone >= startTime && targetInTimezone <= endTime) {
    return new Date(targetInTimezone.toLocaleString('en-US', { timeZone: 'UTC' }));
  }
  
  // 時間窓より前の場合は開始時刻に設定
  if (targetInTimezone < startTime) {
    return new Date(startTime.toLocaleString('en-US', { timeZone: 'UTC' }));
  }
  
  // 時間窓より後の場合は翌日の開始時刻に設定
  const nextDayStart = new Date(startTime);
  nextDayStart.setDate(nextDayStart.getDate() + 1);
  return new Date(nextDayStart.toLocaleString('en-US', { timeZone: 'UTC' }));
}

/**
 * スケジュールの実行後に次回実行時刻を更新
 */
export function updateNextRunAfterExecution(
  scheduleData: ScheduleData,
  timezone: string = 'Asia/Tokyo'
): Date | null {
  const { type, repeatRule } = scheduleData;
  
  switch (type) {
    case 'one_time':
      // 一回限りの場合は完了
      return null;
    
    case 'recurring':
      // 繰返の場合は次回実行時刻を計算
      return calculateRecurringNextRun(repeatRule, timezone, new Date());
    
    case 'random':
      // ランダムの場合は次回実行時刻を計算
      return calculateRandomNextRun(repeatRule, timezone, new Date());
    
    default:
      throw new Error(`Unsupported schedule type: ${type}`);
  }
}

/**
 * スケジュールの入力値を検証
 */
export function validateScheduleData(data: Partial<ScheduleData>): string[] {
  const errors: string[] = [];
  
  // 必須フィールドのチェック
  if (!data.type) {
    errors.push('Schedule type is required');
  }
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }
  
  if (data.description && data.description.length > 500) {
    errors.push('Description must be 500 characters or less');
  }
  
  // タイプ別の検証
  if (data.type === 'recurring') {
    if (!data.repeatRule?.weekdays || data.repeatRule.weekdays.length === 0) {
      errors.push('Weekdays are required for recurring schedule');
    }
    
    if (!data.repeatRule?.time) {
      errors.push('Time is required for recurring schedule');
    } else {
      const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timePattern.test(data.repeatRule.time)) {
        errors.push('Invalid time format (HH:mm required)');
      }
    }
    
    if (data.repeatRule?.weekdays) {
      const invalidWeekdays = data.repeatRule.weekdays.filter(
        day => day < 0 || day > 6 || !Number.isInteger(day)
      );
      if (invalidWeekdays.length > 0) {
        errors.push('Weekdays must be integers between 0 and 6');
      }
    }
  }
  
  if (data.type === 'random') {
    if (!data.repeatRule?.minInterval || !data.repeatRule?.maxInterval) {
      errors.push('Min and max intervals are required for random schedule');
    }
    
    if (data.repeatRule?.minInterval && data.repeatRule.minInterval <= 0) {
      errors.push('Min interval must be greater than 0');
    }
    
    if (data.repeatRule?.maxInterval && data.repeatRule.maxInterval <= 0) {
      errors.push('Max interval must be greater than 0');
    }
    
    if (
      data.repeatRule?.minInterval &&
      data.repeatRule?.maxInterval &&
      data.repeatRule.minInterval > data.repeatRule.maxInterval
    ) {
      errors.push('Min interval must be less than or equal to max interval');
    }
  }
  
  return errors;
}

/**
 * Firestoreタイムスタンプを作成
 */
export function createTimestamp(date: Date): FirebaseFirestore.Timestamp {
  return admin.firestore.Timestamp.fromDate(date);
} 