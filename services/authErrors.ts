/**
 * Authentication Error Types and Handlers
 * Provides structured error handling for authentication flows
 */

export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  OAUTH_ERROR = 'OAUTH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  userMessage: string;
  canRetry: boolean;
  requiresAction?: 'resend_confirmation' | 'reset_password' | 'contact_support';
}

/**
 * Maps Supabase error messages to structured error types
 */
export function parseAuthError(error: any): AuthError {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorDescription = error?.error_description?.toLowerCase() || '';
  const statusCode = error?.status;

  // Invalid credentials
  if (errorMessage.includes('invalid login credentials') || 
      errorMessage.includes('invalid email or password')) {
    return {
      type: AuthErrorType.INVALID_CREDENTIALS,
      message: error.message,
      userMessage: 'Invalid email or password. Please try again.',
      canRetry: true,
    };
  }

  // Email not confirmed
  if (errorMessage.includes('email not confirmed') || 
      errorMessage.includes('email confirmation')) {
    return {
      type: AuthErrorType.EMAIL_NOT_CONFIRMED,
      message: error.message,
      userMessage: 'Please confirm your email address before signing in.',
      canRetry: false,
      requiresAction: 'resend_confirmation',
    };
  }

  // User not found
  if (errorMessage.includes('user not found') || 
      errorMessage.includes('no user found')) {
    return {
      type: AuthErrorType.USER_NOT_FOUND,
      message: error.message,
      userMessage: 'No account found with this email address.',
      canRetry: false,
    };
  }

  // Weak password
  if (errorMessage.includes('password') && 
      (errorMessage.includes('weak') || errorMessage.includes('strength'))) {
    return {
      type: AuthErrorType.WEAK_PASSWORD,
      message: error.message,
      userMessage: 'Password is too weak. Use at least 8 characters with mixed case, numbers, and symbols.',
      canRetry: true,
    };
  }

  // Email already exists
  if (errorMessage.includes('already registered') || 
      errorMessage.includes('user already exists')) {
    return {
      type: AuthErrorType.EMAIL_ALREADY_EXISTS,
      message: error.message,
      userMessage: 'An account with this email already exists. Try signing in instead.',
      canRetry: false,
    };
  }

  // Rate limiting
  if (errorMessage.includes('rate limit') || 
      errorMessage.includes('too many requests') || 
      statusCode === 429) {
    return {
      type: AuthErrorType.RATE_LIMIT_EXCEEDED,
      message: error.message,
      userMessage: 'Too many attempts. Please wait a few minutes before trying again.',
      canRetry: true,
    };
  }

  // Network errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('fetch') || 
      errorMessage.includes('connection')) {
    return {
      type: AuthErrorType.NETWORK_ERROR,
      message: error.message,
      userMessage: 'Network error. Please check your connection and try again.',
      canRetry: true,
    };
  }

  // Session expired
  if (errorMessage.includes('session') && 
      (errorMessage.includes('expired') || errorMessage.includes('invalid'))) {
    return {
      type: AuthErrorType.SESSION_EXPIRED,
      message: error.message,
      userMessage: 'Your session has expired. Please sign in again.',
      canRetry: true,
    };
  }

  // Invalid token
  if (errorMessage.includes('token') && 
      (errorMessage.includes('invalid') || errorMessage.includes('malformed'))) {
    return {
      type: AuthErrorType.INVALID_TOKEN,
      message: error.message,
      userMessage: 'Authentication token is invalid. Please sign in again.',
      canRetry: true,
    };
  }

  // Service unavailable
  if (statusCode === 503 || statusCode === 500 || 
      errorMessage.includes('service unavailable')) {
    return {
      type: AuthErrorType.SERVICE_UNAVAILABLE,
      message: error.message,
      userMessage: 'Authentication service is temporarily unavailable. Please try again later.',
      canRetry: true,
    };
  }

  // OAuth errors
  if (errorMessage.includes('oauth') || 
      errorMessage.includes('provider') || 
      errorMessage.includes('unsupported provider')) {
    return {
      type: AuthErrorType.OAUTH_ERROR,
      message: error.message,
      userMessage: 'OAuth sign-in is not available. Please use email/password or contact support.',
      canRetry: false,
    };
  }

  // Unknown error
  return {
    type: AuthErrorType.UNKNOWN_ERROR,
    message: error.message || 'An unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again or contact support.',
    canRetry: true,
  };
}

/**
 * Gets a user-friendly message for an error type
 */
export function getErrorMessage(errorType: AuthErrorType): string {
  const messages: Record<AuthErrorType, string> = {
    [AuthErrorType.INVALID_CREDENTIALS]: 'Invalid email or password.',
    [AuthErrorType.EMAIL_NOT_CONFIRMED]: 'Please confirm your email address.',
    [AuthErrorType.USER_NOT_FOUND]: 'No account found with this email.',
    [AuthErrorType.WEAK_PASSWORD]: 'Password does not meet requirements.',
    [AuthErrorType.EMAIL_ALREADY_EXISTS]: 'Email already registered.',
    [AuthErrorType.RATE_LIMIT_EXCEEDED]: 'Too many attempts. Try again later.',
    [AuthErrorType.NETWORK_ERROR]: 'Network error. Check your connection.',
    [AuthErrorType.SESSION_EXPIRED]: 'Session expired. Please sign in again.',
    [AuthErrorType.INVALID_TOKEN]: 'Invalid authentication. Please sign in again.',
    [AuthErrorType.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable.',
    [AuthErrorType.OAUTH_ERROR]: 'OAuth sign-in is not available.',
    [AuthErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred.',
  };

  return messages[errorType];
}
