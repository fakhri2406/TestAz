export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const isAuthError = (error: unknown): error is AuthError => {
  return error instanceof AuthError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
}; 