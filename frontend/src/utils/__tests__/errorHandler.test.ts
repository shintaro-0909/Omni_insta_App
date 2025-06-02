import { describe, it, expect, vi } from 'vitest';
import { ErrorHandler, useErrorHandler, AppError, ErrorType, ErrorSeverity } from '../validation/errorHandler';

// Mock console methods
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

describe('Error Handler', () => {
  it('should export ErrorHandler class', () => {
    expect(ErrorHandler).toBeDefined();
    expect(typeof ErrorHandler.fromError).toBe('function');
  });

  it('should export useErrorHandler composable', () => {
    const { handleError, handleAsyncError } = useErrorHandler();
    expect(handleError).toBeDefined();
    expect(handleAsyncError).toBeDefined();
    expect(typeof handleError).toBe('function');
    expect(typeof handleAsyncError).toBe('function');
  });

  it('should handle error conversion', () => {
    const testError = new Error('Test error');
    const appError = ErrorHandler.fromError(testError, 'test-context');
    
    expect(appError).toBeInstanceOf(AppError);
    expect(appError.type).toBe(ErrorType.UNKNOWN);
    expect(appError.severity).toBe(ErrorSeverity.MEDIUM);
    expect(appError.message).toContain('test-context: Test error');
  });
});