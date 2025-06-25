/**
 * Grandfather Pricing + Price-Ladder システムの設定
 */

import { PricingConfig } from "../types/pricing";

// 環境変数から設定を取得
const getPricingConfig = (): PricingConfig => {
  const config: PricingConfig = {
    stepSize: parseInt(process.env.PRICING_STEP_SIZE || "100", 10),
    priceIncrement: parseInt(process.env.PRICING_INCREMENT || "500", 10),
    startPriceLookupKey: "tier_000",
    startPriceAmount: parseInt(process.env.PRICING_START_AMOUNT || "4980", 10),
    maxPriceAmount: parseInt(process.env.PRICING_MAX_AMOUNT || "14800", 10),
    currency: process.env.PRICING_CURRENCY || "jpy",
    productId: process.env.STRIPE_PRODUCT_ID || "",
  };

  // 必須環境変数のチェック
  if (!config.productId) {
    throw new Error("STRIPE_PRODUCT_ID environment variable is required");
  }

  return config;
};

export const PRICING_CONFIG = getPricingConfig();

/**
 * 加入者数から適用すべき価格を計算
 * @param subscriberCount 現在の加入者数（peakSubscribers）
 * @returns 適用すべき価格（円）
 */
export const calculatePriceForSubscribers = (subscriberCount: number): number => {
  const config = PRICING_CONFIG;
  
  // 0人の場合は最低価格
  if (subscriberCount <= 0) {
    return config.startPriceAmount;
  }

  // ステップ数を計算（100人ごとに1ステップ）
  const stepCount = Math.max(0, Math.ceil(subscriberCount / config.stepSize) - 1);
  
  // 価格を計算
  const calculatedPrice = config.startPriceAmount + (stepCount * config.priceIncrement);
  
  // 上限価格を適用
  return Math.min(calculatedPrice, config.maxPriceAmount);
};

/**
 * 価格からlookupKeyを生成
 * @param price 価格（円）
 * @returns lookup key (tier_000, tier_001, etc.)
 */
export const generateLookupKey = (price: number): string => {
  const config = PRICING_CONFIG;
  const stepCount = Math.max(0, Math.floor((price - config.startPriceAmount) / config.priceIncrement));
  return `tier_${stepCount.toString().padStart(3, "0")}`;
};

/**
 * 加入者数から最大加入者数の閾値を計算
 * @param subscriberCount 現在の加入者数
 * @returns このティアの最大加入者数
 */
export const calculateMaxSubscribersForTier = (subscriberCount: number): number => {
  const config = PRICING_CONFIG;
  const stepCount = Math.ceil(subscriberCount / config.stepSize);
  return stepCount * config.stepSize;
};

/**
 * 現在の価格設定が最大価格に達しているかチェック
 * @param currentPrice 現在の価格
 * @returns 最大価格に達している場合true
 */
export const isMaxPriceReached = (currentPrice: number): boolean => {
  return currentPrice >= PRICING_CONFIG.maxPriceAmount;
};

/**
 * デバッグ用：価格計算の詳細情報を取得
 */
export const getPricingDebugInfo = (subscriberCount: number) => {
  const config = PRICING_CONFIG;
  const price = calculatePriceForSubscribers(subscriberCount);
  const lookupKey = generateLookupKey(price);
  const maxSubscribers = calculateMaxSubscribersForTier(subscriberCount);
  const stepCount = Math.max(0, Math.ceil(subscriberCount / config.stepSize) - 1);

  return {
    subscriberCount,
    stepCount,
    price,
    lookupKey,
    maxSubscribers,
    isMaxPrice: isMaxPriceReached(price),
    config,
  };
};