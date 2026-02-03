/**
 * Custom error class for RoomService errors
 */

export class RoomServiceError extends Error {
  constructor(
    message: string,
    public code: number,
    public details?: string,
    public metadata?: { [key: string]: string }
  ) {
    super(message);
    this.name = 'RoomServiceError';
    Error.captureStackTrace?.(this, RoomServiceError);
  }

  /**
   * Check if this is an authentication error
   */
  isAuthenticationError(): boolean {
    return this.code === 16; // UNAUTHENTICATED
  }

  /**
   * Check if this is a permission error
   */
  isPermissionError(): boolean {
    return this.code === 7; // PERMISSION_DENIED
  }

  /**
   * Check if this is a "not found" error
   */
  isNotFoundError(): boolean {
    return this.code === 5; // NOT_FOUND
  }

  /**
   * Check if this is an invalid argument error
   */
  isInvalidArgumentError(): boolean {
    return this.code === 3; // INVALID_ARGUMENT
  }
}

/**
 * Wrap a gRPC error into a RoomServiceError
 */
export function wrapGrpcError(error: any): RoomServiceError {
  if (error instanceof RoomServiceError) {
    return error;
  }

  const code = error.code || error.metadata?.['grpc-code'] || 2; // UNKNOWN
  const details = error.details || error.message || 'Unknown error';
  const metadata = error.metadata || {};

  return new RoomServiceError(details, code, details, metadata);
}
