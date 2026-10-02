import { describe, it, expect } from 'vitest';
import { EscrowFsmValidator } from '@/core/engine-01-os/escrow-fsm';
import { KeyedMutex } from '@/core/engine-01-os/mutex';
import { InvalidStateTransitionError } from '@/lib/errors';

describe('Engine 01 (OS) — Escrow FSM Validator', () => {
  const fsm = new EscrowFsmValidator();

  it('should allow valid transition from AWAITING_DEPOSIT to FUNDED via DEPOSIT by CLIENT', () => {
    const result = fsm.validateTransition('AWAITING_DEPOSIT', 'DEPOSIT', 'CLIENT');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('FUNDED');
  });

  it('should reject DEPOSIT by FREELANCER (role violation)', () => {
    const result = fsm.validateTransition('AWAITING_DEPOSIT', 'DEPOSIT', 'FREELANCER');
    expect(result.allowed).toBe(false);
    expect(result.errorCode).toBe('UNAUTHORIZED_FSM_ACTOR');
  });

  it('should allow valid transition from FUNDED to IN_PROGRESS via START_WORK by FREELANCER', () => {
    const result = fsm.validateTransition('FUNDED', 'START_WORK', 'FREELANCER');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('IN_PROGRESS');
  });

  it('should allow SUBMIT_DELIVERABLE from IN_PROGRESS to SUBMITTED by FREELANCER', () => {
    const result = fsm.validateTransition('IN_PROGRESS', 'SUBMIT_DELIVERABLE', 'FREELANCER');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('SUBMITTED');
  });

  it('should allow APPROVE from UNDER_REVIEW to APPROVED by CLIENT', () => {
    const result = fsm.validateTransition('UNDER_REVIEW', 'APPROVE_MILESTONE', 'CLIENT');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('APPROVED');
  });

  it('should allow TIMEOUT_WATCHDOG from UNDER_REVIEW to REVIEW_TIMEOUT by SYSTEM', () => {
    const result = fsm.validateTransition('UNDER_REVIEW', 'TIMEOUT_WATCHDOG', 'SYSTEM');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('REVIEW_TIMEOUT');
  });

  it('should allow RELEASE_ESCROW and RAISE_DISPUTE from REVIEW_TIMEOUT', () => {
    const resultRelease = fsm.validateTransition('REVIEW_TIMEOUT', 'RELEASE_ESCROW', 'SYSTEM');
    expect(resultRelease.allowed).toBe(true);
    expect(resultRelease.nextState).toBe('RELEASED');

    const resultDispute = fsm.validateTransition('REVIEW_TIMEOUT', 'RAISE_DISPUTE', 'CLIENT');
    expect(resultDispute.allowed).toBe(true);
    expect(resultDispute.nextState).toBe('DISPUTED');
  });

  it('should allow RELEASE_ESCROW from APPROVED to RELEASED by CLIENT or SYSTEM', () => {
    const resultClient = fsm.validateTransition('APPROVED', 'RELEASE_ESCROW', 'CLIENT');
    expect(resultClient.allowed).toBe(true);
    expect(resultClient.nextState).toBe('RELEASED');

    const resultSystem = fsm.validateTransition('APPROVED', 'RELEASE_ESCROW', 'SYSTEM');
    expect(resultSystem.allowed).toBe(true);
    expect(resultSystem.nextState).toBe('RELEASED');
  });

  it('should reject illegal state jump: AWAITING_DEPOSIT to RELEASED', () => {
    expect(() => {
      fsm.assertValidTransition('AWAITING_DEPOSIT', 'RELEASE_ESCROW', 'CLIENT');
    }).toThrow(InvalidStateTransitionError);
  });

  it('should reject illegal state jump: FUNDED to RELEASED (work not submitted)', () => {
    expect(() => {
      fsm.assertValidTransition('FUNDED', 'RELEASE_ESCROW', 'CLIENT');
    }).toThrow(InvalidStateTransitionError);
  });

  it('should identify terminal states RELEASED and REFUNDED as immutable', () => {
    expect(fsm.isTerminalState('RELEASED')).toBe(true);
    expect(fsm.isTerminalState('REFUNDED')).toBe(true);
    expect(fsm.isTerminalState('IN_PROGRESS')).toBe(false);

    expect(() => {
      fsm.assertValidTransition('RELEASED', 'RELEASE_ESCROW', 'CLIENT');
    }).toThrow(InvalidStateTransitionError);
  });

  it('should allow RAISE_DISPUTE from UNDER_REVIEW or SUBMITTED into DISPUTED state', () => {
    const result = fsm.validateTransition('UNDER_REVIEW', 'RAISE_DISPUTE', 'CLIENT');
    expect(result.allowed).toBe(true);
    expect(result.nextState).toBe('DISPUTED');
  });

  it('should allow REVIEWER to render rulings on DISPUTED contracts', () => {
    const releaseRuling = fsm.validateTransition('DISPUTED', 'RESOLVE_RELEASE', 'REVIEWER');
    expect(releaseRuling.allowed).toBe(true);
    expect(releaseRuling.nextState).toBe('RELEASED');

    const refundRuling = fsm.validateTransition('DISPUTED', 'RESOLVE_REFUND', 'REVIEWER');
    expect(refundRuling.allowed).toBe(true);
    expect(refundRuling.nextState).toBe('REFUNDED');
  });
});

describe('Engine 01 (OS) — KeyedMutex Concurrency Control', () => {
  const mutex = new KeyedMutex();

  it('should serialize concurrent operations on the same milestone key', async () => {
    const executionOrder: string[] = [];
    const milestoneId = 'milestone-concurrent-test-1';

    const op1 = async () => {
      const release = await mutex.acquire(milestoneId);
      executionOrder.push('op1-start');
      await new Promise((r) => setTimeout(r, 50));
      executionOrder.push('op1-end');
      release();
    };

    const op2 = async () => {
      const release = await mutex.acquire(milestoneId);
      executionOrder.push('op2-start');
      executionOrder.push('op2-end');
      release();
    };

    await Promise.all([op1(), op2()]);

    expect(executionOrder).toEqual(['op1-start', 'op1-end', 'op2-start', 'op2-end']);
  });

  it('should allow parallel execution on different milestone keys', async () => {
    const executionOrder: string[] = [];

    const opA = async () => {
      const release = await mutex.acquire('milestone-A');
      executionOrder.push('opA-start');
      await new Promise((r) => setTimeout(r, 50));
      executionOrder.push('opA-end');
      release();
    };

    const opB = async () => {
      const release = await mutex.acquire('milestone-B');
      executionOrder.push('opB-start');
      executionOrder.push('opB-end');
      release();
    };

    await Promise.all([opA(), opB()]);

    // OpB should start before OpA finishes because they are on different keys
    expect(executionOrder.indexOf('opB-start')).toBeLessThan(executionOrder.indexOf('opA-end'));
  });
});
