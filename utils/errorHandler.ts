/**
 * Centralized Error Handling System
 * Provides typed errors, user-friendly messages, and error recovery
 */

import { logError } from '../services/securityService';

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  STORAGE = 'STORAGE',
  API = 'API',
  AI = 'AI',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  context?: any;
}

export class ErrorHandler {
  static handle(error: Error, context?: any): AppError {
    let type = ErrorType.UNKNOWN;
    let userMessage = 'An unexpected error occurred. Please try again.';
    let recoverable = true;
    let retryable = false;

    const errorMessage = error.message.toLowerCase();

    // Network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
      type = ErrorType.NETWORK;
      userMessage = 'Network connection failed. Please check your internet connection and try again.';
      retryable = true;
    }
    // Auth errors
    else if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('unauthorized')) {
      type = ErrorType.AUTH;
      userMessage = 'Authentication failed. Please sign in again.';
      recoverable = false;
    }
    // Storage errors
    else if (errorMessage.includes('quota') || errorMessage.includes('storage') || errorMessage.includes('indexeddb')) {
      type = ErrorType.STORAGE;
      userMessage = 'Device storage is full or unavailable. Please free up space.';
      recoverable = false;
    }
    // AI/API errors
    else if (errorMessage.includes('api key') || errorMessage.includes('gemini')) {
      type = ErrorType.AI;
      userMessage = 'AI service is unavailable. Some features may not work. Please try again later.';
      retryable = true;
    }
    // Validation errors
    else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      type = ErrorType.VALIDATION;
      userMessage = 'Please check your input and try again.';
      recoverable = true;
    }

    // Log to monitoring service
    logError(error, { ...context, errorType: type });

    return {
      type,
      message: error.message,
      userMessage,
      recoverable,
      retryable,
      context
    };
  }

  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxAttempts) {
          // Exponential backoff
          const delay = delayMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Retry failed');
  }
}
