import { UserRole, ContractAction, SessionContext } from '@/types';
import { AuthorizationError, AuthenticationError } from '@/lib/errors';

export class RbacEnforcer {
  private static readonly ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<string>> = {
    CLIENT: new Set([
      'project:create',
      'project:view',
      'proposal:view',
      'proposal:accept',
      'contract:deposit',
      'contract:view',
      'deliverable:review',
      'deliverable:approve',
      'dispute:raise',
      'dispute:view',
    ]),
    FREELANCER: new Set([
      'project:view',
      'project:browse',
      'proposal:create',
      'proposal:view_self',
      'contract:view',
      'deliverable:submit',
      'dispute:raise',
      'dispute:view',
      'gig:manage',
    ]),
    REVIEWER: new Set([
      'dispute:view_all',
      'dispute:inspect_evidence',
      'dispute:rule',
      'audit:view',
      'contract:view',
    ]),
    ADMIN: new Set([
      'project:create',
      'project:view',
      'proposal:view',
      'proposal:accept',
      'contract:deposit',
      'contract:view',
      'deliverable:review',
      'deliverable:approve',
      'dispute:raise',
      'dispute:view',
      'dispute:view_all',
      'dispute:inspect_evidence',
      'dispute:rule',
      'audit:view',
      'audit:verify',
      'system:manage',
    ]),
  };

  /**
   * Asserts that the session user has one of the allowed roles.
   * Throws AuthorizationError (HTTP 403) on violation.
   */
  static enforceRole(session: SessionContext | null | undefined, allowedRoles: UserRole[]): void {
    if (!session) {
      throw new AuthenticationError('Active session is required to perform this action.');
    }

    if (!allowedRoles.includes(session.role)) {
      throw new AuthorizationError(
        `Access denied. Role '${session.role}' is not authorized. Required: [${allowedRoles.join(', ')}].`
      );
    }
  }

  /**
   * Asserts that the session user is a party to the contract (Client, Freelancer), or an authorized Reviewer/Admin.
   */
  static enforceContractAccess(
    session: SessionContext | null | undefined,
    contract: { clientId: string; freelancerId: string }
  ): void {
    if (!session) {
      throw new AuthenticationError('Active session is required.');
    }

    if (session.role === 'ADMIN' || session.role === 'REVIEWER') {
      return;
    }

    const isParty = session.userId === contract.clientId || session.userId === contract.freelancerId;
    if (!isParty) {
      throw new AuthorizationError('Access denied. You are not a contracted party to this agreement.');
    }
  }

  /**
   * Verifies if a user possesses a specific granular permission string.
   */
  static hasPermission(role: UserRole, permission: string): boolean {
    const permissions = RbacEnforcer.ROLE_PERMISSIONS[role];
    return permissions ? permissions.has(permission) : false;
  }

  /**
   * Asserts that a specific action is legally actionable by the role.
   */
  static canExecuteContractAction(role: UserRole, action: ContractAction): boolean {
    switch (action) {
      case 'DEPOSIT':
        return role === 'CLIENT' || role === 'ADMIN';
      case 'START_WORK':
      case 'SUBMIT_DELIVERABLE':
        return role === 'FREELANCER' || role === 'ADMIN';
      case 'APPROVE_MILESTONE':
      case 'RELEASE_ESCROW':
        return role === 'CLIENT' || role === 'ADMIN';
      case 'RAISE_DISPUTE':
        return role === 'CLIENT' || role === 'FREELANCER' || role === 'ADMIN';
      case 'RESOLVE_RELEASE':
      case 'RESOLVE_REFUND':
        return role === 'REVIEWER' || role === 'ADMIN';
      case 'TIMEOUT_WATCHDOG':
        return role === 'ADMIN';
      default:
        return false;
    }
  }
}
