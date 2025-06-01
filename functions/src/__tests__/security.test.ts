import { RateLimiter } from '../utils/rateLimiter';
import { validate, sanitize, sanitizeInput } from '../utils/inputValidator';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  firestore: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: false })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve())
      }))
    }))
  })
}));

describe('Security Middleware Tests', () => {
  
  describe('Rate Limiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 60000 // 1 minute
      });
    });

    test('should allow requests within limit', async () => {
      const result = await rateLimiter.isRateLimited('test-user');
      
      expect(result.limited).toBe(false);
      expect(result.remaining).toBeLessThanOrEqual(5);
      expect(result.resetTime).toBeDefined();
    });

    test('should have correct configuration', () => {
      expect(rateLimiter.config.maxRequests).toBe(5);
      expect(rateLimiter.config.windowMs).toBe(60000);
    });
  });

  describe('Input Validation', () => {
    
    test('should validate user ID correctly', () => {
      // Valid user ID
      expect(() => validate.userId('user123')).not.toThrow();
      expect(() => validate.userId('user_test-123')).not.toThrow();
      
      // Invalid user ID
      expect(() => validate.userId('')).toThrow();
      expect(() => validate.userId('user@invalid')).toThrow();
      expect(() => validate.userId('x'.repeat(129))).toThrow();
    });

    test('should validate Instagram account ID correctly', () => {
      // Valid Instagram ID
      expect(() => validate.igAccountId('123456789')).not.toThrow();
      
      // Invalid Instagram ID
      expect(() => validate.igAccountId('')).toThrow();
      expect(() => validate.igAccountId('abc123')).toThrow();
      expect(() => validate.igAccountId('123-456')).toThrow();
    });

    test('should validate schedule data correctly', () => {
      const validSchedule = {
        userId: 'user123',
        igAccountId: '123456789',
        scheduleType: 'once' as const,
        scheduledAt: '2024-12-25T10:00:00Z',
        content: {
          caption: 'Test caption',
          imageUrl: 'https://example.com/image.jpg'
        }
      };
      
      expect(() => validate.schedule(validSchedule)).not.toThrow();
      
      // Invalid schedule
      const invalidSchedule = { ...validSchedule, scheduleType: 'invalid' };
      expect(() => validate.schedule(invalidSchedule)).toThrow();
    });
  });

  describe('Input Sanitization', () => {
    
    test('should sanitize text input', () => {
      expect(sanitize.text('<script>alert("xss")</script>Hello')).toBe('alert(xss)Hello');
      expect(sanitize.text('javascript:alert("xss");')).toBe('alert(xss);');
      expect(sanitize.text('  Text with spaces  ')).toBe('Text with spaces');
      
      // Verify HTML tags are removed
      expect(sanitize.text('<div>content</div>')).toBe('content');
      expect(sanitize.text('<img src="x" onerror="alert(1)">')).toBe('');
    });

    test('should sanitize URLs', () => {
      expect(sanitize.url('https://example.com/image.jpg')).toBe('https://example.com/image.jpg');
      expect(sanitize.url('http://example.com/image.jpg')).toBe('http://example.com/image.jpg');
      
      expect(() => sanitize.url('javascript:alert("xss")')).toThrow();
      expect(() => sanitize.url('ftp://example.com/file')).toThrow();
      expect(() => sanitize.url('invalid-url')).toThrow();
    });

    test('should sanitize Instagram captions', () => {
      const longCaption = 'x'.repeat(2300);
      const sanitized = sanitize.instagramCaption(longCaption);
      
      expect(sanitized.length).toBeLessThanOrEqual(2200);
      expect(sanitize.instagramCaption('<script>Hello</script>')).toBe('Hello');
      expect(sanitize.instagramCaption('javascript:alert("xss");Hello')).toBe('alert("xss");Hello');
    });

    test('should sanitize file names', () => {
      expect(sanitize.fileName('my file.jpg')).toBe('my_file.jpg');
      expect(sanitize.fileName('../../../etc/passwd')).toBe('______etc_passwd');
      expect(sanitize.fileName('file<>name.txt')).toBe('file__name.txt');
    });

    test('should sanitize nested input objects', () => {
      const input = {
        title: '<script>alert("xss")</script>Title',
        nested: {
          description: 'javascript:alert("test");Description',
          array: ['<b>item1</b>', 'item2']
        }
      };

      const sanitized = sanitizeInput(input);

      expect(sanitized.title).toBe('alert(xss)Title');
      expect(sanitized.nested.description).toBe('alert(test);Description');
      expect(sanitized.nested.array[0]).toBe('item1');
      expect(sanitized.nested.array[1]).toBe('item2');
    });
  });

  describe('Schema Validation Edge Cases', () => {
    
    test('should handle post content validation', () => {
      const validPost = {
        caption: 'Valid caption',
        imageUrl: 'https://example.com/image.jpg'
      };
      
      expect(() => validate.postContent(validPost)).not.toThrow();
      
      // Test optional caption
      const postWithoutCaption = {
        imageUrl: 'https://example.com/image.jpg'
      };
      
      expect(() => validate.postContent(postWithoutCaption)).not.toThrow();
      
      // Test invalid URL
      const invalidPost = {
        caption: 'Valid caption',
        imageUrl: 'not-a-url'
      };
      
      expect(() => validate.postContent(invalidPost)).toThrow();
    });

    test('should validate pagination parameters', () => {
      // Default pagination
      const defaultPagination = validate.pagination({});
      expect(defaultPagination.limit).toBe(20);
      
      // Custom pagination
      const customPagination = validate.pagination({ limit: 50 });
      expect(customPagination.limit).toBe(50);
      
      // Invalid pagination
      expect(() => validate.pagination({ limit: 101 })).toThrow();
      expect(() => validate.pagination({ limit: 0 })).toThrow();
    });
  });
});

// Integration test for middleware workflow
describe('Security Middleware Integration', () => {
  
  test('should process request through complete security pipeline', async () => {
    // Simulate a request object
    const mockRequest = {
      body: {
        userId: 'user123',
        igAccountId: '987654321',
        content: {
          caption: '<script>alert("xss")</script>Hello World',
          imageUrl: 'https://example.com/image.jpg'
        }
      }
    };

    // Step 1: Sanitize input
    const sanitizedRequest = {
      ...mockRequest,
      body: sanitizeInput(mockRequest.body)
    };

    // Step 2: Validate sanitized input
    const validatedData = validate.schedule({
      ...sanitizedRequest.body,
      scheduleType: 'once' as const,
      content: sanitizedRequest.body.content
    });

    // Step 3: Rate limiting check
    const rateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60000 });
    const rateLimitResult = await rateLimiter.isRateLimited(validatedData.userId);

    // Assertions
    expect(validatedData.content.caption).toBe('alert(xss)Hello World'); // HTML tags removed
    expect(validatedData.userId).toBe('user123'); // Valid format
    expect(validatedData.igAccountId).toBe('987654321'); // Valid format
    expect(rateLimitResult.limited).toBe(false); // Within rate limit
    expect(rateLimitResult.remaining).toBeDefined();
  });
});