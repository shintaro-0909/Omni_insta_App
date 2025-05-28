# Omniy 監視・アラート設定ガイド

最終更新日: 2025年1月27日

## 🎯 概要

本文書は、Omniy Instagram自動投稿サービスの包括的な監視・アラート体制の設定方法を定義します。サービスの可用性・性能・セキュリティを継続的に監視し、問題の早期発見と迅速な対応を実現します。

## 📊 監視アーキテクチャ

```mermaid
graph TB
    subgraph "Application Layer"
        A[Frontend Vue.js] --> B[Cloud Functions]
        B --> C[Firestore]
        B --> D[Instagram Graph API]
        B --> E[Stripe API]
    end
    
    subgraph "Monitoring Layer"
        F[Google Cloud Monitoring] --> G[Cloud Logging]
        F --> H[Error Reporting]
        F --> I[Cloud Trace]
        F --> J[Custom Metrics]
    end
    
    subgraph "Alerting Layer"
        K[Email Alerts] --> L[Slack Notifications]
        K --> M[PagerDuty]
        K --> N[SMS Alerts]
    end
    
    B --> F
    C --> F
```

---

## 🔧 Google Cloud Monitoring 設定

### 1. Cloud Functions 監視

#### 1.1 エラー率監視
```yaml
# cloud-functions-error-rate.yaml
displayName: "Cloud Functions High Error Rate"
combiner: OR
conditions:
  - displayName: "Error rate > 5%"
    conditionThreshold:
      filter: |
        resource.type="cloud_function"
        metric.type="cloudfunctions.googleapis.com/function/execution_count"
        metric.label.status!="ok"
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0.05
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_RATE
          crossSeriesReducer: REDUCE_SUM
```

#### 1.2 実行時間監視
```yaml
# cloud-functions-latency.yaml
displayName: "Cloud Functions High Latency"
conditions:
  - displayName: "P95 execution time > 10s"
    conditionThreshold:
      filter: |
        resource.type="cloud_function"
        metric.type="cloudfunctions.googleapis.com/function/execution_times"
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 10000
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_PERCENTILE_95
```

#### 1.3 メモリ使用量監視
```yaml
# cloud-functions-memory.yaml
displayName: "Cloud Functions High Memory Usage"
conditions:
  - displayName: "Memory utilization > 80%"
    conditionThreshold:
      filter: |
        resource.type="cloud_function"
        metric.type="cloudfunctions.googleapis.com/function/user_memory_bytes"
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0.8
      duration: 300s
```

### 2. Firestore 監視

#### 2.1 読み取り・書き込み操作監視
```yaml
# firestore-operations.yaml
displayName: "Firestore High Operation Rate"
conditions:
  - displayName: "Document reads > 1000/min"
    conditionThreshold:
      filter: |
        resource.type="datastore_database"
        metric.type="firestore.googleapis.com/api/request_count"
        metric.label.op_type="read"
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 1000
      duration: 60s
```

#### 2.2 接続エラー監視
```yaml
# firestore-errors.yaml
displayName: "Firestore Connection Errors"
conditions:
  - displayName: "Error rate > 1%"
    conditionThreshold:
      filter: |
        resource.type="datastore_database"
        metric.type="firestore.googleapis.com/api/request_count"
        metric.label.response_code!="200"
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0.01
      duration: 300s
```

### 3. アプリケーション固有監視

#### 3.1 投稿実行成功率
```javascript
// functions/src/utils/metrics.ts
import { Monitoring } from '@google-cloud/monitoring';

const monitoring = new Monitoring.MetricServiceClient();
const projectId = 'omniy-prod';

export class MetricsCollector {
  async recordPostExecution(success: boolean, accountId: string) {
    const request = {
      name: `projects/${projectId}`,
      timeSeries: [{
        metric: {
          type: 'custom.googleapis.com/instagram/post_execution',
          labels: {
            'account_id': accountId,
            'status': success ? 'success' : 'failure'
          }
        },
        resource: {
          type: 'global'
        },
        points: [{
          interval: {
            endTime: {
              seconds: Math.floor(Date.now() / 1000)
            }
          },
          value: {
            int64Value: 1
          }
        }]
      }]
    };

    await monitoring.createTimeSeries(request);
  }

  async recordAPILatency(endpoint: string, latencyMs: number) {
    const request = {
      name: `projects/${projectId}`,
      timeSeries: [{
        metric: {
          type: 'custom.googleapis.com/api/latency',
          labels: {
            'endpoint': endpoint
          }
        },
        resource: {
          type: 'global'
        },
        points: [{
          interval: {
            endTime: {
              seconds: Math.floor(Date.now() / 1000)
            }
          },
          value: {
            doubleValue: latencyMs
          }
        }]
      }]
    };

    await monitoring.createTimeSeries(request);
  }

  async recordUserActivity(action: string, userId: string) {
    const request = {
      name: `projects/${projectId}`,
      timeSeries: [{
        metric: {
          type: 'custom.googleapis.com/user/activity',
          labels: {
            'action': action,
            'user_id': userId
          }
        },
        resource: {
          type: 'global'
        },
        points: [{
          interval: {
            endTime: {
              seconds: Math.floor(Date.now() / 1000)
            }
          },
          value: {
            int64Value: 1
          }
        }]
      }]
    };

    await monitoring.createTimeSeries(request);
  }
}
```

#### 3.2 カスタムメトリクス設定
```yaml
# custom-metrics-alerts.yaml
displayName: "Instagram Post Success Rate"
conditions:
  - displayName: "Success rate < 95%"
    conditionThreshold:
      filter: |
        metric.type="custom.googleapis.com/instagram/post_execution"
        metric.label.status="success"
      comparison: COMPARISON_LESS_THAN
      thresholdValue: 0.95
      duration: 600s
      aggregations:
        - alignmentPeriod: 300s
          perSeriesAligner: ALIGN_RATE
          crossSeriesReducer: REDUCE_SUM
```

---

## 🚨 アラート通知設定

### 1. 通知チャンネル設定

#### 1.1 メール通知
```bash
# Eメール通知チャンネル作成
gcloud alpha monitoring channels create \
  --notification-channel-config='{
    "type": "email",
    "displayName": "Operations Team Email",
    "description": "Primary email for operations alerts",
    "labels": {
      "email_address": "alerts@omniy.jp"
    }
  }'
```

#### 1.2 Slack通知
```bash
# Slack通知チャンネル作成
gcloud alpha monitoring channels create \
  --notification-channel-config='{
    "type": "slack",
    "displayName": "Slack Operations Channel",
    "description": "Slack #alerts channel",
    "labels": {
      "channel_name": "#alerts",
      "url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
    }
  }'
```

#### 1.3 SMS通知（緊急時）
```bash
# SMS通知チャンネル作成
gcloud alpha monitoring channels create \
  --notification-channel-config='{
    "type": "sms",
    "displayName": "Emergency SMS",
    "description": "Emergency SMS for critical alerts",
    "labels": {
      "number": "+81-90-1234-5678"
    }
  }'
```

### 2. アラートポリシーの階層化

#### レベル1: 情報 (Info)
- **通知先**: メール、Slack
- **対応時間**: 翌営業日
- **例**: 軽微な性能劣化、使用量警告

#### レベル2: 警告 (Warning)  
- **通知先**: メール、Slack、担当者への直接連絡
- **対応時間**: 2時間以内
- **例**: API エラー率上昇、投稿成功率低下

#### レベル3: 緊急 (Critical)
- **通知先**: メール、Slack、SMS、電話
- **対応時間**: 15分以内
- **例**: サービス全停止、セキュリティ侵害

### 3. 通知設定例

```yaml
# critical-alert-policy.yaml
displayName: "Critical System Failure"
alertStrategy:
  autoClose: 604800s  # 7 days
notificationChannels:
  - "projects/omniy-prod/notificationChannels/email-ops"
  - "projects/omniy-prod/notificationChannels/slack-alerts"
  - "projects/omniy-prod/notificationChannels/sms-emergency"
documentation:
  content: |
    ## Critical System Failure Detected
    
    This alert indicates a critical system failure that requires immediate attention.
    
    ### Immediate Actions:
    1. Check the incident response playbook
    2. Verify system status dashboard
    3. Initiate emergency response if needed
    
    ### Escalation:
    - Level 1: Operations team (immediate)
    - Level 2: Engineering lead (15 minutes)
    - Level 3: Management (30 minutes)
  mimeType: "text/markdown"
```

---

## 📈 ダッシュボード設定

### 1. エグゼクティブダッシュボード

```json
{
  "displayName": "Omniy Executive Dashboard",
  "mosaicLayout": {
    "tiles": [
      {
        "width": 6,
        "height": 3,
        "widget": {
          "title": "Overall Service Health",
          "scorecard": {
            "timeSeriesQuery": {
              "timeSeriesFilter": {
                "filter": "metric.type=\"compute.googleapis.com/instance/up\"",
                "aggregation": {
                  "alignmentPeriod": "60s",
                  "perSeriesAligner": "ALIGN_MEAN"
                }
              }
            },
            "gaugeView": {
              "lowerBound": 0.0,
              "upperBound": 1.0
            }
          }
        }
      },
      {
        "width": 6,
        "height": 3,
        "widget": {
          "title": "Daily Active Users",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"custom.googleapis.com/user/activity\"",
                  "aggregation": {
                    "alignmentPeriod": "3600s",
                    "perSeriesAligner": "ALIGN_SUM"
                  }
                }
              }
            }]
          }
        }
      }
    ]
  }
}
```

### 2. 運用チームダッシュボード

```json
{
  "displayName": "Operations Dashboard",
  "mosaicLayout": {
    "tiles": [
      {
        "width": 4,
        "height": 3,
        "widget": {
          "title": "Cloud Functions Error Rate",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_function\" metric.type=\"cloudfunctions.googleapis.com/function/execution_count\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_RATE",
                    "crossSeriesReducer": "REDUCE_SUM"
                  }
                }
              }
            }]
          }
        }
      },
      {
        "width": 4,
        "height": 3,
        "widget": {
          "title": "Instagram API Success Rate",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"custom.googleapis.com/instagram/post_execution\"",
                  "aggregation": {
                    "alignmentPeriod": "300s",
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              }
            }]
          }
        }
      }
    ]
  }
}
```

### 3. 開発チームダッシュボード

```json
{
  "displayName": "Development Dashboard",
  "mosaicLayout": {
    "tiles": [
      {
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Application Latency Distribution",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "metric.type=\"custom.googleapis.com/api/latency\"",
                  "aggregation": {
                    "alignmentPeriod": "60s",
                    "perSeriesAligner": "ALIGN_PERCENTILE_95"
                  }
                }
              }
            }]
          }
        }
      },
      {
        "width": 6,
        "height": 4,
        "widget": {
          "title": "Error Distribution by Function",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_function\" metric.type=\"logging.googleapis.com/log_entry_count\" resource.label.function_name!=\"\"",
                  "aggregation": {
                    "alignmentPeriod": "300s",
                    "perSeriesAligner": "ALIGN_SUM",
                    "crossSeriesReducer": "REDUCE_SUM",
                    "groupByFields": ["resource.label.function_name"]
                  }
                }
              }
            }]
          }
        }
      }
    ]
  }
}
```

---

## 🔍 ログ管理

### 1. 構造化ログ設定

```javascript
// functions/src/utils/logger.ts
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console()
  ]
});

export class AppLogger {
  static info(message: string, meta?: any) {
    logger.info(message, {
      ...meta,
      service: 'omniy',
      version: process.env.VERSION || 'unknown'
    });
  }

  static error(message: string, error?: Error, meta?: any) {
    logger.error(message, {
      ...meta,
      error: error?.message,
      stack: error?.stack,
      service: 'omniy',
      version: process.env.VERSION || 'unknown'
    });
  }

  static audit(action: string, userId: string, details?: any) {
    logger.info('AUDIT', {
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
      service: 'omniy',
      type: 'audit'
    });
  }
}
```

### 2. ログアグリゲーション設定

```bash
# Cloud Logging シンク設定
gcloud logging sinks create omniy-audit-sink \
  bigquery.googleapis.com/projects/omniy-prod/datasets/audit_logs \
  --log-filter='jsonPayload.type="audit"'

gcloud logging sinks create omniy-error-sink \
  pubsub.googleapis.com/projects/omniy-prod/topics/error-notifications \
  --log-filter='severity>=ERROR'
```

### 3. ログ保持ポリシー

```bash
# ログ保持期間設定
gcloud logging buckets update _Default \
  --location=global \
  --retention-days=90

# 監査ログの長期保持
gcloud logging buckets create audit-logs-long-term \
  --location=global \
  --retention-days=2555  # 7年間
```

---

## 🔒 セキュリティ監視

### 1. 不正アクセス検知

```yaml
# security-alerts.yaml
displayName: "Suspicious Authentication Activity"
conditions:
  - displayName: "Failed login attempts > 10/minute"
    conditionThreshold:
      filter: |
        resource.type="cloud_function"
        jsonPayload.action="login_failed"
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 10
      duration: 60s
```

### 2. API乱用検知

```javascript
// functions/src/middleware/rateLimiting.ts
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../utils/logger';

export function rateLimitingMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.uid;
  const endpoint = req.path;
  const clientIP = req.ip;

  // レート制限チェック
  const requestCount = getRequestCount(userId, endpoint, clientIP);
  
  if (requestCount > RATE_LIMITS[endpoint]) {
    AppLogger.audit('RATE_LIMIT_EXCEEDED', userId, {
      endpoint,
      clientIP,
      requestCount
    });
    
    // アラート送信
    sendSecurityAlert('Rate limit exceeded', {
      userId,
      endpoint,
      clientIP,
      requestCount
    });
    
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  next();
}
```

### 3. データ漏洩監視

```bash
# Cloud DLP API設定
gcloud dlp job-triggers create \
  --location=global \
  --config='{
    "displayName": "PII Detection in Logs",
    "triggers": [{
      "schedule": {
        "recurrencePeriodDuration": "86400s"
      }
    }],
    "inspectJob": {
      "inspectConfig": {
        "infoTypes": [
          {"name": "EMAIL_ADDRESS"},
          {"name": "PHONE_NUMBER"},
          {"name": "CREDIT_CARD_NUMBER"}
        ]
      },
      "storageConfig": {
        "cloudStorageOptions": {
          "fileSet": {
            "url": "gs://omniy-prod-logs/*"
          }
        }
      }
    }
  }'
```

---

## 📱 モバイル・外部監視

### 1. 外部監視サービス連携

```javascript
// Uptime monitoring setup
const uptimeCheck = {
  displayName: 'Omniy Homepage Check',
  monitoredResource: {
    type: 'uptime_url',
    labels: {
      project_id: 'omniy-prod',
      host: 'omniy.app'
    }
  },
  httpCheck: {
    path: '/',
    port: 443,
    useSsl: true,
    validateSsl: true
  },
  period: '60s',
  timeout: '10s'
};
```

### 2. APM (Application Performance Monitoring)

```javascript
// Cloud Trace設定
import { NodeSDK } from '@opentelemetry/auto-instrumentations-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'omniy',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.VERSION || '1.0.0',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

---

## 🎛️ 運用手順

### 1. 日次監視チェックリスト

```markdown
## Daily Operations Checklist

### Morning (9:00 AM)
- [ ] システム全体のヘルスチェック
- [ ] 前日のエラーログレビュー
- [ ] 投稿実行成功率の確認
- [ ] リソース使用量の確認
- [ ] 予定メンテナンス作業の確認

### Evening (6:00 PM)  
- [ ] 日次レポートの確認
- [ ] アラート状況の整理
- [ ] 翌日の予定確認
- [ ] オンコール担当者への引き継ぎ
```

### 2. 週次レポート自動生成

```javascript
// Weekly report generation
async function generateWeeklyReport() {
  const metrics = await collectWeeklyMetrics();
  
  const report = {
    period: `${startDate} - ${endDate}`,
    summary: {
      totalUsers: metrics.activeUsers,
      totalPosts: metrics.postsExecuted,
      successRate: metrics.successRate,
      averageLatency: metrics.averageLatency
    },
    incidents: await getIncidents(startDate, endDate),
    performance: {
      uptimePercentage: metrics.uptime,
      errorRate: metrics.errorRate,
      p95Latency: metrics.p95Latency
    },
    recommendations: generateRecommendations(metrics)
  };

  await sendReportToTeam(report);
}
```

### 3. 月次レビュープロセス

```markdown
## Monthly Review Process

### SLI/SLO Analysis
- Availability: Target 99.9%, Actual: [X]%
- Latency: Target <1000ms P95, Actual: [X]ms
- Error Rate: Target <0.1%, Actual: [X]%

### Capacity Planning
- User growth trend analysis
- Resource utilization trends
- Cost optimization opportunities

### Incident Review
- Total incidents: [X]
- MTTR improvement: [X]%
- Root cause analysis summary

### Action Items
- [ ] Infrastructure improvements
- [ ] Monitoring enhancements  
- [ ] Process optimizations
```

---

## 🔗 関連ツール・リソース

### 監視ツール
- **Google Cloud Monitoring**: メトリクス・アラート
- **Cloud Logging**: ログ集約・分析
- **Error Reporting**: エラー追跡
- **Cloud Trace**: 分散トレーシング

### 外部ツール
- **Slack**: リアルタイム通知
- **PagerDuty**: インシデント管理
- **Grafana**: 可視化ダッシュボード
- **BigQuery**: ログ分析・レポート

### ドキュメント
- [障害対応手順書](./INCIDENT_RESPONSE.md)
- [運用手順書](./OPERATIONS.md)
- [技術仕様書](./TECHNICAL_SPECIFICATIONS.md)

---

**作成者**: DevOps チーム  
**承認者**: CTO  
**次回見直し**: 2025年4月27日