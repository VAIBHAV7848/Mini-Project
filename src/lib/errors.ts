import { ZodError } from 'zod';

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly details: Record<string, unknown> = {}) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_FAILED';
  readonly statusCode = 400;
}

export class AuthenticationError extends DomainError {
  readonly code = 'UNAUTHENTICATED';
  readonly statusCode = 401;

  constructor(message = 'Authentication required.') {
    super(message);
  }
}

export class AuthorizationError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;

  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'RESOURCE_NOT_FOUND';
  readonly statusCode = 404;

  constructor(resource: string, identifier?: string) {
    super(identifier ? `${resource} with identifier '${identifier}' was not found.` : `${resource} was not found.`);
  }
}

export class InvalidStateTransitionError extends DomainError {
  readonly code = 'INVALID_STATE_TRANSITION';
  readonly statusCode = 400;

  constructor(fromState: string, action: string, message?: string) {
    super(message || `Action '${action}' is illegal from current state '${fromState}'.`);
  }
}

export class ConcurrencyMutexConflictError extends DomainError {
  readonly code = 'STATE_MUTEX_LOCKED';
  readonly statusCode = 409;

  constructor(milestoneId: string) {
    super(`A concurrent operation is currently executing on milestone '${milestoneId}'.`);
  }
}

export class DoubleAllocationError extends DomainError {
  readonly code = 'ESCROW_ALREADY_ALLOCATED';
  readonly statusCode = 409;

  constructor(contractId: string) {
    super(`Escrow funds for contract '${contractId}' are already funded or allocated.`);
  }
}

export class InsufficientFundsError extends DomainError {
  readonly code = 'INSUFFICIENT_FUNDS';
  readonly statusCode = 422;

  constructor(available: number, required: number) {
    super(`Insufficient balance: available ${available.toFixed(2)}, required ${required.toFixed(2)}.`);
  }
}

export class EvidenceTamperedException extends DomainError {
  readonly code = 'EVIDENCE_TAMPERING_DETECTED';
  readonly statusCode = 422;

  constructor(expected: string, computed: string) {
    super(`Deliverable checksum mismatch! Expected '${expected}', computed '${computed}'.`);
  }
}

export class TransactionRollbackError extends DomainError {
  readonly code = 'TRANSACTION_ROLLBACK';
  readonly statusCode = 500;

  constructor(message = 'Financial transaction failed and was rolled back.') {
    super(message);
  }
}

export function formatSuccessResponse<T>(data: T, requestId = 'req-system') {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

export function formatErrorResponse(error: unknown, requestId = 'req-system') {
  if (error instanceof DomainError) {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Request payload validation failed.',
          details: error.issues,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
    };
  }

  // Sanitized generic internal error
  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
  };
}
