import { z } from 'zod';

// Common validation schemas
export const schemas = {
  // User ID validation
  userId: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
  
  // Instagram account validation
  igAccountId: z.string().min(1).max(50).regex(/^\d+$/),
  
  // Post validation
  postContent: z.object({
    caption: z.string().max(2200).optional(),
    imageUrl: z.string().url().max(500),
    scheduledAt: z.string().datetime().optional(),
  }),
  
  // Schedule validation
  schedule: z.object({
    userId: z.string().min(1).max(128),
    igAccountId: z.string().min(1).max(50),
    scheduleType: z.enum(['once', 'recurring', 'random']),
    scheduledAt: z.string().datetime().optional(),
    repeatRule: z.object({
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
      time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    }).optional(),
    content: z.object({
      caption: z.string().max(2200).optional(),
      imageUrl: z.string().url().max(500),
    }),
  }),
  
  // Group validation
  group: z.object({
    userId: z.string().min(1).max(128),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    igAccounts: z.array(z.string().min(1).max(50)).max(10),
  }),
  
  // Proxy validation
  proxy: z.object({
    userId: z.string().min(1).max(128),
    host: z.string().min(1).max(253),
    port: z.number().min(1).max(65535),
    username: z.string().max(100).optional(),
    password: z.string().max(100).optional(),
    type: z.enum(['http', 'https', 'socks4', 'socks5']),
  }),
  
  // Pagination validation
  pagination: z.object({
    limit: z.number().min(1).max(100).default(20),
    startAfter: z.string().optional(),
  }),
};

// Sanitization functions
export const sanitize = {
  // Remove potentially dangerous characters
  text: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags completely
      .replace(/[\"']/g, '') // Remove quotes
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .trim();
  },
  
  // Sanitize URLs
  url: (input: string): string => {
    try {
      const url = new URL(input);
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return url.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  },
  
  // Sanitize Instagram caption
  instagramCaption: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags completely
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .slice(0, 2200) // Instagram caption limit
      .trim();
  },
  
  // Sanitize file names
  fileName: (input: string): string => {
    return input
      .replace(/\.\./g, '_') // Prevent directory traversal first
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Only allow safe chars
      .slice(0, 255); // File name length limit
  },
};

// Validation middleware factory
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${messages}`);
      }
      throw error;
    }
  };
}

// Input sanitization middleware
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return sanitize.text(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitize.text(key);
      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

// Common validation functions
export const validate = {
  userId: createValidationMiddleware(schemas.userId),
  igAccountId: createValidationMiddleware(schemas.igAccountId),
  postContent: createValidationMiddleware(schemas.postContent),
  schedule: createValidationMiddleware(schemas.schedule),
  group: createValidationMiddleware(schemas.group),
  proxy: createValidationMiddleware(schemas.proxy),
  pagination: createValidationMiddleware(schemas.pagination),
};

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Error sanitization
export function sanitizeError(error: any): { message: string; code?: string } {
  // Don't expose internal details in production
  if (process.env.NODE_ENV === 'production') {
    return {
      message: 'An error occurred',
      code: error.code || 'INTERNAL_ERROR'
    };
  }
  
  return {
    message: sanitize.text(error.message || 'Unknown error'),
    code: error.code
  };
}