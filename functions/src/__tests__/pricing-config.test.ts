/**
 * 価格設定とユーティリティ関数のテスト
 */

import {
  PRICING_CONFIG,
  calculatePriceForSubscribers,
  generateLookupKey,
  calculateMaxSubscribersForTier,
  isMaxPriceReached,
  getPricingDebugInfo,
} from "../config/pricing";

describe("PRICING_CONFIG", () => {
  
  test("設定値が正しく読み込まれる", () => {
    expect(PRICING_CONFIG.stepSize).toBe(100);
    expect(PRICING_CONFIG.priceIncrement).toBe(500);
    expect(PRICING_CONFIG.startPriceAmount).toBe(4980);
    expect(PRICING_CONFIG.maxPriceAmount).toBe(14800);
    expect(PRICING_CONFIG.currency).toBe("jpy");
  });
  
});

describe("calculateMaxSubscribersForTier", () => {
  
  test("ティアの最大加入者数を正しく計算", () => {
    expect(calculateMaxSubscribersForTier(50)).toBe(100);   // 1-100のティア
    expect(calculateMaxSubscribersForTier(100)).toBe(100);  // 1-100のティア
    expect(calculateMaxSubscribersForTier(101)).toBe(200);  // 101-200のティア
    expect(calculateMaxSubscribersForTier(150)).toBe(200);  // 101-200のティア
    expect(calculateMaxSubscribersForTier(200)).toBe(200);  // 101-200のティア
    expect(calculateMaxSubscribersForTier(201)).toBe(300);  // 201-300のティア
  });
  
});

describe("getPricingDebugInfo", () => {
  
  test("デバッグ情報が正しく取得される", () => {
    const debugInfo = getPricingDebugInfo(150);
    
    expect(debugInfo.subscriberCount).toBe(150);
    expect(debugInfo.stepCount).toBe(1); // 150人 = 2ステップ目 = stepCount 1
    expect(debugInfo.price).toBe(5480);
    expect(debugInfo.lookupKey).toBe("tier_001");
    expect(debugInfo.maxSubscribers).toBe(200);
    expect(debugInfo.isMaxPrice).toBe(false);
  });
  
  test("最大価格時のデバッグ情報", () => {
    const debugInfo = getPricingDebugInfo(5000);
    
    expect(debugInfo.price).toBe(14800);
    expect(debugInfo.isMaxPrice).toBe(true);
    expect(debugInfo.lookupKey).toBe("tier_020");
  });
  
});

describe("境界値テスト", () => {
  
  test("ステップ境界での価格計算", () => {
    const testCases = [
      { count: 99, expectedPrice: 4980, expectedStep: 0 },
      { count: 100, expectedPrice: 4980, expectedStep: 0 },
      { count: 101, expectedPrice: 5480, expectedStep: 1 },
      { count: 199, expectedPrice: 5480, expectedStep: 1 },
      { count: 200, expectedPrice: 5980, expectedStep: 2 },
      { count: 201, expectedPrice: 5980, expectedStep: 2 },
    ];
    
    testCases.forEach(({ count, expectedPrice, expectedStep }) => {
      const price = calculatePriceForSubscribers(count);
      const debugInfo = getPricingDebugInfo(count);
      
      expect(price).toBe(expectedPrice);
      expect(debugInfo.stepCount).toBe(expectedStep);
    });
  });
  
});

describe("エッジケース", () => {
  
  test("負の値や0での計算", () => {
    expect(calculatePriceForSubscribers(-10)).toBe(4980);
    expect(calculatePriceForSubscribers(0)).toBe(4980);
    expect(generateLookupKey(calculatePriceForSubscribers(0))).toBe("tier_000");
  });
  
  test("非常に大きな値での計算", () => {
    const largeNumber = 999999;
    const price = calculatePriceForSubscribers(largeNumber);
    
    expect(price).toBe(14800); // 上限価格
    expect(isMaxPriceReached(price)).toBe(true);
  });
  
  test("小数点を含む値での計算", () => {
    // Math.ceil を使用しているため、小数点は切り上げられる
    const price150_5 = calculatePriceForSubscribers(150.5);
    const price150 = calculatePriceForSubscribers(150);
    
    expect(price150_5).toBe(price150); // 同じ結果
  });
  
});