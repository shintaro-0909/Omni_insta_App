# Firestore コレクション設計 — Instagram予約投稿ツール

> **目的**: マルチアカウント管理・投稿自動化・プロキシ設定・サブスク課金を安全かつ拡張しやすく保存する。

---

## 1. コレクション構造図

```text
users/{uid}
├─ profile            … 氏名・メール・権限など
├─ currentPlan        … プラン種別 / Stripe subID / 上限値
├─ settings           … タイムゾーン・通知設定
├─ usage              … 今月の投稿数など
├─ igAccounts/{igId}
│   ├─ schedules/{schId}
│   └─ logs/{logId}   … アカウント単位の実行ログ
└─ proxies/{proxyId?} … (Should) ユーザー専用プロキシ

posts/{postId}         … 画像/動画＋キャプション共通ライブラリ
plans/{planId}         … 料金テーブル（Stripe Price と同期）
proxyPool/{proxyId}    … 共有プロキシ在庫 & 使用数
globalLogs/{day}/{id}  … 管理者用ランタイムログ
```

---

## 2. ドキュメント定義

### 2‑1. `users/{uid}`
| フィールド | 型 | 説明 |
|-----------|----|------|
| `profile.displayName` | string | 表示名 |
| `profile.email` | string | ログイン Email |
| `currentPlan.planId` | string | `plans/{}` 参照 |
| `currentPlan.status` | enum(active/overdue/canceled) | Stripe Webhook 更新 |
| `currentPlan.instagramAccountLimit` | number | プラン上限 |
| `settings.timeZone` | string | 例 `Asia/Tokyo` |
| `usage.monthlyPostCount` | number | 当月投稿総数 |

### 2‑2. `igAccounts/{igId}`
| フィールド | 型 | 説明 |
|------------|----|------|
| `instagramUserId` | string | Graph API IG User ID |
| `username` | string | @handle |
| `accessToken` | string (encrypted) | 長期有効トークン |
| `tokenExpiresAt` | timestamp | 失効前に更新 |
| `proxyId` | string? | `proxyPool/{}` 参照 |
| `createdAt / updatedAt` | timestamp | — |

### 2‑3. `schedules/{schId}`
| フィールド | 型 | 説明 |
|------------|----|------|
| `type` | enum(one_time/recurring/random) | |
| `contentRef` | reference(`posts/{}`) | |
| `repeatRule` | map | 例: `{weekday:[1,3], time:"10:00"}` |
| `nextRunAt` | timestamp | 次回実行時刻 |
| `status` | enum(active/paused/error) | |
| `retryCount` | number | リトライ制御 |

> **Composite Index**: `status` + `nextRunAt` 昇順

### 2‑4. `posts/{postId}`
| フィールド | 型 | 説明 |
|-----------|----|------|
| `ownerUid` | string | アクセス制御用 |
| `mediaUrls` | array<string> | GCS 署名付き URL |
| `caption` | string | 本文 |
| `tags` | array<string> | ハッシュタグ |
| `timesPosted` | number | 再投稿回数 |

### 2‑5. `proxyPool/{proxyId}` (Should)
| フィールド | 型 | 説明 |
|-----------|----|------|
| `ip` | string | IP アドレス |
| `port` | number | — |
| `auth` | map | {user, pass} |
| `type` | enum(residential/mobile/datacenter) |
| `allocatedCount` | number | 割当済み数 |

---

## 3. Firestore ルール（抜粋）

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;

      match /igAccounts/{igId} {
        allow read, write: if request.auth.uid == userId;

        match /schedules/{schId} {
          allow read: if request.auth.uid == userId;
          allow write: if false; // Cloud Functions が書込
        }
      }
    }

    match /posts/{postId} {
      allow read, write: if request.auth.uid == resource.data.ownerUid;
    }

    match /proxyPool/{proxyId} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

---

## 4. 拡張時のサブコレ案

| 目的 | コレクション | 主要フィールド |
|------|--------------|----------------|
| 投稿成功/失敗ログ | `users/{uid}/logs/{}` | status, errorCode, runAt |
| インサイト集計 | `analytics/{month}/{uid}` | reach, likes, comments |
| Stripe Webhook | `stripeWebhook/{eventId}` | rawPayload, processed |

---

### ポイントまとめ
1. **ユーザー階層化**でセキュリティルール簡潔  
2. **`nextRunAt` インデックス**で 1 分トリガーが効率的  
3. プロキシ関連は Should 要件として後付け可能  
4. Admin SDK でサーバー書込、クライアントは読み取り中心