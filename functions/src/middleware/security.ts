import { Request, Response, NextFunction } from 'express';
import { apiRateLimiter, authRateLimiter } from '../utils/rateLimiter';
import { sanitizeInput, securityHeaders, sanitizeError } from '../utils/inputValidator';

// Security middleware that applies rate limiting and input sanitization
export async function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Apply security headers
    res.set(securityHeaders);
    
    // Get user ID from auth context or IP for rate limiting
    const userId = req.body?.auth?.uid || req.ip || 'anonymous';
    
    // Apply rate limiting
    const rateLimitResult = await apiRateLimiter.isRateLimited(userId);
    
    if (rateLimitResult.limited) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        resetTime: rateLimitResult.resetTime,
        message: 'Too many requests. Please try again later.'
      });
      return;
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
      'X-RateLimit-Reset': new Date(rateLimitResult.resetTime!).toISOString()
    });
    
    // Sanitize input data
    if (req.body) {
      req.body = sanitizeInput(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeInput(req.query);
    }
    
    next();
  } catch (error) {
    console.error('Security middleware error:', error);
    res.status(500).json({
      error: 'Security check failed',
      details: sanitizeError(error)
    });
  }
}

// Auth-specific security middleware with stricter rate limiting
export async function authSecurityMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Apply security headers
    res.set(securityHeaders);
    
    // Get IP for auth rate limiting (stricter)
    const clientId = req.ip || 'anonymous';
    
    // Apply auth rate limiting (10 requests per 15 minutes)
    const rateLimitResult = await authRateLimiter.isRateLimited(clientId);
    
    if (rateLimitResult.limited) {
      res.status(429).json({
        error: 'Auth rate limit exceeded',
        resetTime: rateLimitResult.resetTime,
        message: 'Too many authentication attempts. Please try again later.'
      });
      return;
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
      'X-RateLimit-Reset': new Date(rateLimitResult.resetTime!).toISOString()
    });
    
    // Sanitize input data
    if (req.body) {
      req.body = sanitizeInput(req.body);
    }
    
    next();
  } catch (error) {
    console.error('Auth security middleware error:', error);
    res.status(500).json({
      error: 'Authentication security check failed',
      details: sanitizeError(error)
    });
  }
}

// Validation middleware factory
export function validationMiddleware(validator: (data: any) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (req.body) {
        req.body = validator(req.body);
      }
      
      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(400).json({
        error: 'Validation failed',
        details: sanitizeError(error)
      });
    }
  };
}

// IP whitelist middleware (for admin functions)
export function ipWhitelistMiddleware(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP!)) {
      res.status(403).json({
        error: 'Access denied',
        message: 'IP address not whitelisted'
      });
      return;
    }
    
    next();
  };
}

// CORS middleware with security
export function secureCorsMiddleware(allowedOrigins: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    if (origin && allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV === 'development') {
      res.set('Access-Control-Allow-Origin', '*');
    }
    
    res.set({
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400' // 24 hours
    });
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    next();
  };
}