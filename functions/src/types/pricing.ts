/**
 * Grandfather Pricing + Price-Ladder モデルの型定義
 */

import { Timestamp } from "firebase-admin/firestore";

export interface PriceHistoryRecord {
  priceId: string;                    // Stripe Price ID
  lookupKey: string;                  // tier_000, tier_001, etc.
  maxSubscribers: number;             // この価格が適用される最大加入者数
  amount: number;                     // 価格（円）
  currency: string;                   // 通貨コード（jpy）
  createdAt: Timestamp;               // 作成日時
  isActive: boolean;                  // 現在アクティブか
  metadata: {
    tier: string;                     // ティア識別子
    createdBy: string;                // 作成方法（auto_rotate, manual, migration）
    maxSubscribers: string;           // 文字列形式での閾値（Stripe metadata用）
  };
}

export interface GlobalStats {
  currentSubscribers: number;         // 現在の課金者数
  peakSubscribers: number;            // 過去最大課金者数（値下げ防止用）
  currentPriceId: string;             // 現在適用中の価格ID
  lastUpdated: Timestamp;             // 最終更新日時
}

export interface PricingConfig {
  stepSize: number;                   // 100ユーザーごと
  priceIncrement: number;             // +¥500/step
  startPriceLookupKey: string;        // tier_000
  startPriceAmount: number;           // ¥4,980
  maxPriceAmount: number;             // 上限 ¥14,800
  currency: string;                   // jpy
  productId: string;                  // Stripe Product ID
}

export interface CheckoutMetadata {
  priceLookupKey: string;            // Checkout時の価格識別子
  peakSubscribersAtCheckout: number;  // Checkout時の最大加入者数
  checkoutTimestamp: string;          // Checkout作成時刻
}