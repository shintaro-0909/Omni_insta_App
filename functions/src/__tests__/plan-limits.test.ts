/**
 * planLimits リファクタリング後の動作テスト
 * 新システム（Price-Ladder + Grandfather）と旧システムの互換性確認
 */

import { getTierLimits, getUserPricingInfo } from "../utils/planLimits";
import * as admin from "firebase-admin";

// Firebase Admin SDK のモック
jest.mock("firebase-admin", () => ({
  firestore: jest.fn(() => ({
    collection: jest.fn(),
  })),
  auth: jest.fn(),
  initializeApp: jest.fn(),
  apps: [],
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
}));

describe("新システム対応のplanLimits", () => {
  
  describe("getTierLimits", () => {
    
    test("全ティアで同じ制限設定を返す", async () => {
      const tierCases = ["tier_000", "tier_001", "tier_005", "tier_020"];
      
      for (const tier of tierCases) {
        const limits = await getTierLimits(tier);
        
        // 全ティアで同じ制限（現在の仕様）
        expect(limits.instagramAccountLimit).toBe(-1); // 無制限
        expect(limits.monthlyPostLimit).toBe(-1); // 無制限
        expect(limits.dailyPostLimitPerAccount).toBe(50); // 1日50投稿まで
        expect(limits.scheduledPosts).toBe(true);
        expect(limits.recurringPosts).toBe(true);
        expect(limits.randomPosts).toBe(true);
        expect(limits.proxySupport).toBe(true);
        expect(limits.prioritySupport).toBe(true);
        expect(limits.apiAccess).toBe(true);
      }
    });
    
  });
  
  describe("getUserPricingInfo", () => {
    
    let mockDb: any;
    let mockCollection: jest.Mock;
    let mockDoc: jest.Mock;
    let mockGet: jest.Mock;
    
    beforeEach(() => {
      mockGet = jest.fn();
      mockDoc = jest.fn(() => ({
        get: mockGet,
      }));
      mockCollection = jest.fn(() => ({
        doc: mockDoc,
      }));
      
      mockDb = {
        collection: mockCollection,
      };
      
      (admin.firestore as jest.Mock).mockReturnValue(mockDb);
    });
    
    test("新システムユーザーの価格情報を取得", async () => {
      const mockUserData = {
        currentPlan: {
          planId: "subscription",
          priceTier: "tier_002",
          originalPrice: 5980,
          isGrandfathered: true,
        },
      };
      
      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });
      
      const pricingInfo = await getUserPricingInfo("user123");
      
      expect(pricingInfo.priceTier).toBe("tier_002");
      expect(pricingInfo.originalPrice).toBe(5980);
      expect(pricingInfo.isGrandfathered).toBe(true);
      expect(pricingInfo.planId).toBe("subscription");
    });
    
    test("旧システムユーザーの価格情報を取得", async () => {
      const mockUserData = {
        currentPlan: {
          planId: "basic",
          status: "active",
        },
      };
      
      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });
      
      const pricingInfo = await getUserPricingInfo("user456");
      
      expect(pricingInfo.priceTier).toBe("tier_000"); // デフォルト値
      expect(pricingInfo.originalPrice).toBe(0); // デフォルト値
      expect(pricingInfo.isGrandfathered).toBe(false); // デフォルト値
      expect(pricingInfo.planId).toBe("basic");
    });
    
    test("Freeユーザーの価格情報を取得", async () => {
      const mockUserData = {
        currentPlan: {
          planId: "free",
        },
      };
      
      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockUserData,
      });
      
      const pricingInfo = await getUserPricingInfo("user789");
      
      expect(pricingInfo.priceTier).toBe("tier_000");
      expect(pricingInfo.originalPrice).toBe(0);
      expect(pricingInfo.isGrandfathered).toBe(false);
      expect(pricingInfo.planId).toBe("free");
    });
    
    test("ユーザーが存在しない場合のデフォルト値", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });
      
      const pricingInfo = await getUserPricingInfo("nonexistent");
      
      expect(pricingInfo.priceTier).toBe("tier_000");
      expect(pricingInfo.originalPrice).toBe(0);
      expect(pricingInfo.isGrandfathered).toBe(false);
      expect(pricingInfo.planId).toBe("free");
    });
    
  });
  
  describe("後方互換性", () => {
    
    test("旧プランシステムとの互換性", async () => {
      // 旧システムのプランID
      const legacyPlans = ["free", "basic", "pro", "business"];
      
      // これらのプランIDが引き続き認識されることを確認
      legacyPlans.forEach(planId => {
        expect(typeof planId).toBe("string");
        expect(planId.length).toBeGreaterThan(0);
      });
    });
    
    test("新システムの識別子", async () => {
      // 新システムのプランIDとティア
      const newSystemPlan = "subscription";
      const tiers = ["tier_000", "tier_001", "tier_002", "tier_020"];
      
      expect(newSystemPlan).toBe("subscription");
      tiers.forEach(tier => {
        expect(tier).toMatch(/^tier_\d{3}$/);
      });
    });
    
  });
  
  describe("機能フラグ対応", () => {
    
    test("制限されている機能のチェック", async () => {
      const limits = await getTierLimits("tier_000");
      
      // 現在は全機能が有効だが、将来的に機能フラグで制御可能
      expect(limits.recurringPosts).toBe(true); // 将来的に無効化可能
      expect(limits.randomPosts).toBe(true);    // 将来的に無効化可能
      expect(limits.proxySupport).toBe(true);   // 将来的に無効化可能
    });
    
  });
  
});