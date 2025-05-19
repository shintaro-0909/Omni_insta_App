# System Overview – Instagram予約投稿ツール

```mermaid
flowchart TD
    %% ===== Client Side =====
    subgraph Client
        A[User Browser / Smartphone]
    end

    %% ===== Firebase Hosting & UI =====
    subgraph Firebase Frontend
        B[Firebase Hosting<br/>SPA UI]
        C[Firebase Auth]
    end

    %% ===== Backend =====
    subgraph Backend (GCP)
        D[Cloud Firestore<br/>DB]
        E[Cloud Functions<br/>(2nd Gen)]
        F[Cloud Scheduler<br/>(毎分ポーリング)]
        J[Cloud Run<br/>Media Worker]
    end

    %% ===== External Services =====
    subgraph External
        G[Stripe<br/>Subscription]
        H[Instagram Graph API]
        I[High‑Quality<br/>Proxy Pool]
    end

    %% ===== Data Flow =====
    %% Client interactions
    A -- HTTPS --> B
    B -- 認証 --> C
    B -- CRUD --> D
    B -- Invoke --> E

    %% Scheduler triggers
    F -- Trigger --> E

    %% Functions logic
    E -- Read/Write --> D
    E -- Charge / Webhook --> G
    E -- Post Media --> H
    E -- via Proxy --> I
    E -- Heavy Task --> J
    J -- Upload / Return --> H

    %% Notes
    classDef note fill:#fff5b1,stroke:#333,stroke-width:1px;
    E:::note;
    class E note;
```

> **Legend**
> • Cloud Scheduler: 1分間隔で投稿キューをチェック
> • Cloud Functions: 認証済みアクセストークンとプロキシ経由でGraph APIに投稿
> • Cloud Run (optional): 動画変換など重量処理をオフロード
> • Stripe: Checkout & Webhook で課金状態を同期