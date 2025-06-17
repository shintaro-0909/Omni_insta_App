/**
 * Schedule Grid関連の型定義
 */

export interface ScheduleGridRow {
  id: string;
  datetime: string;
  accountId: string;
  text: string;
  imageUrl?: string;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'error';
  title: string;
  scheduleType: 'once' | 'recurring' | 'random';
  repeatInterval?: 'daily' | 'weekly' | 'monthly';
  minInterval?: number;
  maxInterval?: number;
}

export interface GridCellProps {
  value: any;
  data: ScheduleGridRow;
  colDef: any;
  rowIndex: number;
  api: any;
}

export interface ScheduleGridConfig {
  enableBatchOperations: boolean;
  enableDragAndDrop: boolean;
  enableInlineEditing: boolean;
  autoSaveInterval: number;
  maxRowsPerPage: number;
}

export interface BulkScheduleSettings {
  startDate: string;
  interval: number;
  skipWeekends: boolean;
}

export type SyncStatus = 'synced' | 'syncing' | 'error';

export interface ValidationError {
  field: string;
  message: string;
}