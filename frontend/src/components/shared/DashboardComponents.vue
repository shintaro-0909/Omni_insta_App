<!--
統合ダッシュボードコンポーネント
全ダッシュボードで共通使用する統一UIコンポーネント群
重要度: MEDIUM - UI統合によるシステム全体への影響
-->

<template>
  <!-- 統合コンポーネントの提供用ダミーテンプレート -->
  <div>Unified Dashboard Components</div>
</template>

<script setup lang="ts">
/**
 * 統合ダッシュボードコンポーネント定義
 * 全ダッシュボードで使用される共通UI要素の統合
 */

import { defineComponent, h, VNode } from 'vue'

// 統合された共通プロパティインターフェース
export interface DashboardMetric {
  id: string
  title: string
  value: string | number
  icon: string
  color: 'success' | 'warning' | 'error' | 'info' | 'primary'
  trend?: 'up' | 'down' | 'stable'
  percentage?: number
  subtitle?: string
}

export interface DashboardStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  label: string
  description?: string
  lastUpdate?: number
}

export interface DashboardAlert {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: number
  dismissible?: boolean
  actions?: Array<{
    label: string
    action: () => void
  }>
}

/**
 * 統合メトリクスカードコンポーネント
 * 全ダッシュボードで使用される数値・進捗表示
 */
export const UnifiedMetricCard = defineComponent({
  name: 'UnifiedMetricCard',
  props: {
    metric: {
      type: Object as () => DashboardMetric,
      required: true
    },
    compact: {
      type: Boolean,
      default: false
    },
    showTrend: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    return () => h('div', {
      class: `unified-metric-card ${props.compact ? 'compact' : ''}`
    }, [
      // アイコン部分
      h('div', { class: 'metric-icon' }, [
        h('v-icon', {
          color: props.metric.color,
          size: props.compact ? 20 : 24
        }, props.metric.icon)
      ]),
      
      // コンテンツ部分
      h('div', { class: 'metric-content' }, [
        h('div', { class: 'metric-value' }, props.metric.value),
        h('div', { class: 'metric-title' }, props.metric.title),
        props.metric.subtitle && h('div', { class: 'metric-subtitle' }, props.metric.subtitle)
      ]),
      
      // 進捗・トレンド部分
      props.showTrend && props.metric.percentage !== undefined && 
      h('div', { class: 'metric-progress' }, [
        h('v-progress-linear', {
          'model-value': props.metric.percentage,
          color: props.metric.color,
          height: '4',
          rounded: true
        }),
        props.metric.trend && h('v-icon', {
          size: 16,
          color: props.metric.trend === 'up' ? 'success' : props.metric.trend === 'down' ? 'error' : 'grey'
        }, 
        props.metric.trend === 'up' ? 'mdi-trending-up' : 
        props.metric.trend === 'down' ? 'mdi-trending-down' : 'mdi-trending-neutral')
      ])
    ])
  }
})

/**
 * 統合ステータスインディケーターコンポーネント
 * ステータス表示の統一化
 */
export const UnifiedStatusIndicator = defineComponent({
  name: 'UnifiedStatusIndicator',
  props: {
    status: {
      type: Object as () => DashboardStatus,
      required: true
    },
    variant: {
      type: String as () => 'chip' | 'alert' | 'badge',
      default: 'chip'
    },
    size: {
      type: String as () => 'small' | 'default' | 'large',
      default: 'default'
    }
  },
  setup(props) {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'healthy': return 'success'
        case 'warning': return 'warning'
        case 'critical': return 'error'
        default: return 'grey'
      }
    }

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'healthy': return 'mdi-check-circle'
        case 'warning': return 'mdi-alert'
        case 'critical': return 'mdi-alert-circle'
        default: return 'mdi-help-circle'
      }
    }

    return () => {
      if (props.variant === 'chip') {
        return h('v-chip', {
          color: getStatusColor(props.status.status),
          size: props.size,
          variant: 'outlined'
        }, {
          prepend: () => h('v-icon', { 
            start: true, 
            size: 16 
          }, getStatusIcon(props.status.status)),
          default: () => props.status.label.toUpperCase()
        })
      }

      if (props.variant === 'alert') {
        return h('v-alert', {
          color: getStatusColor(props.status.status),
          variant: 'outlined',
          density: 'compact'
        }, {
          prepend: () => h('v-icon', getStatusIcon(props.status.status)),
          default: () => [
            h('div', { class: 'text-body-2 font-weight-bold' }, props.status.label),
            props.status.description && h('div', { class: 'text-caption' }, props.status.description)
          ]
        })
      }

      // badge variant
      return h('v-badge', {
        color: getStatusColor(props.status.status),
        content: props.status.label
      })
    }
  }
})

/**
 * 統合アラートパネルコンポーネント
 * アラート・通知表示の統一化
 */
export const UnifiedAlertPanel = defineComponent({
  name: 'UnifiedAlertPanel',
  props: {
    alerts: {
      type: Array as () => DashboardAlert[],
      required: true
    },
    maxVisible: {
      type: Number,
      default: 5
    },
    autoHide: {
      type: Boolean,
      default: false
    }
  },
  emits: ['dismiss', 'action'],
  setup(props, { emit }) {
    const dismissAlert = (alertId: string) => {
      emit('dismiss', alertId)
    }

    const executeAction = (alertId: string, action: () => void) => {
      action()
      emit('action', alertId)
    }

    return () => {
      const visibleAlerts = props.alerts.slice(0, props.maxVisible)
      
      return h('div', { class: 'unified-alert-panel' }, 
        visibleAlerts.map(alert => 
          h('v-alert', {
            key: alert.id,
            color: alert.type,
            variant: 'outlined',
            closable: alert.dismissible,
            class: 'mb-2',
            onClose: () => dismissAlert(alert.id)
          }, {
            prepend: () => h('v-icon', alert.type === 'success' ? 'mdi-check-circle' :
                               alert.type === 'warning' ? 'mdi-alert' :
                               alert.type === 'error' ? 'mdi-alert-circle' :
                               'mdi-information'),
            default: () => [
              h('div', { class: 'text-body-2 font-weight-bold' }, alert.title),
              h('div', { class: 'text-caption' }, alert.message),
              alert.actions && h('div', { class: 'mt-2' },
                alert.actions.map((action, index) =>
                  h('v-btn', {
                    key: index,
                    color: alert.type,
                    size: 'small',
                    variant: 'outlined',
                    class: 'me-2',
                    onClick: () => executeAction(alert.id, action.action)
                  }, action.label)
                )
              )
            ]
          })
        )
      )
    }
  }
})

/**
 * 統合ダッシュボードヘッダーコンポーネント
 * ダッシュボードタイトル・アクション部分の統一化
 */
export const UnifiedDashboardHeader = defineComponent({
  name: 'UnifiedDashboardHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    iconColor: {
      type: String,
      default: 'primary'
    },
    status: {
      type: Object as () => DashboardStatus,
      required: false
    },
    actions: {
      type: Array as () => Array<{
        label: string
        icon: string
        color?: string
        action: () => void
      }>,
      default: () => []
    }
  },
  setup(props) {
    return () => h('v-card-title', { class: 'd-flex align-center' }, [
      // アイコン・タイトル
      h('v-icon', {
        color: props.iconColor,
        class: 'me-2',
        size: 24
      }, props.icon),
      h('span', props.title),
      
      h('v-spacer'),
      
      // ステータス表示
      props.status && h(UnifiedStatusIndicator, {
        status: props.status,
        variant: 'chip',
        size: 'small',
        class: 'me-2'
      }),
      
      // アクションボタン
      ...props.actions.map((action, index) => 
        h('v-btn', {
          key: index,
          color: action.color || 'primary',
          variant: 'outlined',
          size: 'small',
          class: index < props.actions.length - 1 ? 'me-2' : '',
          onClick: action.action
        }, {
          prepend: () => h('v-icon', { start: true }, action.icon),
          default: () => action.label
        })
      )
    ])
  }
})

/**
 * 統合セクションカードコンポーネント
 * ダッシュボード内のセクション区切りの統一化
 */
export const UnifiedSectionCard = defineComponent({
  name: 'UnifiedSectionCard',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: false
    },
    elevation: {
      type: Number,
      default: 1
    },
    color: {
      type: String,
      default: 'surface'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    return () => h('v-card', {
      elevation: props.elevation,
      class: `unified-section-card bg-${props.color}`,
      loading: props.loading
    }, [
      props.title && h('v-card-title', { class: 'text-subtitle-1 font-weight-bold' }, [
        props.title,
        props.subtitle && h('div', { class: 'text-caption text-grey mt-1' }, props.subtitle)
      ]),
      h('v-card-text', {}, slots.default?.())
    ])
  }
})

// コンポーネント使用例とデフォルト設定
export const dashboardDefaults = {
  colors: {
    success: 'success',
    warning: 'warning', 
    error: 'error',
    info: 'info',
    primary: 'primary'
  },
  
  // よく使用されるアイコン
  icons: {
    dashboard: 'mdi-view-dashboard',
    performance: 'mdi-speedometer',
    security: 'mdi-shield-check',
    ai: 'mdi-brain',
    accessibility: 'mdi-human-wheelchair',
    monitoring: 'mdi-monitor-dashboard'
  },
  
  // 共通サイズ設定
  sizes: {
    compact: {
      cardPadding: '12px',
      iconSize: 20,
      fontSize: '0.875rem'
    },
    default: {
      cardPadding: '16px', 
      iconSize: 24,
      fontSize: '1rem'
    },
    large: {
      cardPadding: '24px',
      iconSize: 32,
      fontSize: '1.125rem'
    }
  }
}

console.log('🎨 統合ダッシュボードコンポーネント読み込み完了')
</script>

<style scoped>
.unified-metric-card {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.unified-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.unified-metric-card.compact {
  padding: 12px;
}

.metric-icon {
  margin-right: 12px;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.metric-subtitle {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.metric-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.unified-section-card {
  margin-bottom: 16px;
  font-family: 'Inter', sans-serif;
}

.unified-alert-panel {
  max-height: 400px;
  overflow-y: auto;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .unified-metric-card {
    padding: 12px;
  }
  
  .metric-value {
    font-size: 1.25rem;
  }
  
  .metric-icon {
    margin-right: 8px;
  }
}
</style>