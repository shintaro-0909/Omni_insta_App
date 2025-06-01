import * as admin from 'firebase-admin';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (req: any) => string;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  public readonly config: RateLimitConfig;
  private db: admin.firestore.Firestore;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.db = admin.firestore();
  }

  async isRateLimited(key: string): Promise<{ limited: boolean; resetTime?: number; remaining?: number }> {
    const rateLimitKey = `rate_limit:${key}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get current rate limit record
      const docRef = this.db.collection('rateLimits').doc(rateLimitKey);
      const doc = await docRef.get();

      let record: RateLimitRecord;

      if (!doc.exists || doc.data()!.resetTime <= windowStart) {
        // No record exists or window has expired, create new record
        record = {
          count: 1,
          resetTime: now + this.config.windowMs
        };
        await docRef.set(record);
        return {
          limited: false,
          resetTime: record.resetTime,
          remaining: this.config.maxRequests - 1
        };
      }

      record = doc.data() as RateLimitRecord;

      if (record.count >= this.config.maxRequests) {
        // Rate limit exceeded
        return {
          limited: true,
          resetTime: record.resetTime,
          remaining: 0
        };
      }

      // Increment counter
      record.count += 1;
      await docRef.update({ count: record.count });

      return {
        limited: false,
        resetTime: record.resetTime,
        remaining: this.config.maxRequests - record.count
      };

    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow the request (fail open)
      return {
        limited: false,
        remaining: this.config.maxRequests
      };
    }
  }

  async cleanup(): Promise<void> {
    try {
      const now = Date.now();
      const expiredQuery = this.db.collection('rateLimits')
        .where('resetTime', '<=', now);
      
      const snapshot = await expiredQuery.get();
      const batch = this.db.batch();

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${snapshot.size} expired rate limit records`);
    } catch (error) {
      console.error('Rate limit cleanup error:', error);
    }
  }
}

// Pre-configured rate limiters
export const authRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000 // 15 minutes
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000 // 1 minute
});

export const instagramRateLimiter = new RateLimiter({
  maxRequests: 25,
  windowMs: 60 * 60 * 1000 // 1 hour
});

// Rate limit middleware factory
export function createRateLimitMiddleware(limiter: RateLimiter, keyGenerator?: (context: any) => string) {
  return async (context: any, next: () => Promise<any>) => {
    const key = keyGenerator ? keyGenerator(context) : context.auth?.uid || context.ip || 'anonymous';
    
    const result = await limiter.isRateLimited(key);
    
    if (result.limited) {
      throw new Error(`Rate limit exceeded. Try again at ${new Date(result.resetTime!).toISOString()}`);
    }

    // Add rate limit headers to response
    if (context.res) {
      context.res.set({
        'X-RateLimit-Limit': limiter.config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining?.toString() || '0',
        'X-RateLimit-Reset': new Date(result.resetTime!).toISOString()
      });
    }

    return next();
  };
}