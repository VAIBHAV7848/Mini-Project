import crypto from 'node:crypto';
import prisma from '@/lib/db';

export interface AuditEntryInput {
  actorId: string;
  entityName: string;
  entityId: string;
  action: string;
  previousState?: string | null;
  newState: string;
}

export interface AuditVerificationResult {
  isValid: boolean;
  totalVerified: number;
  tamperedRecordIds: string[];
}

export class AuditLogger {
  private computeChainedHash(
    actorId: string,
    entityName: string,
    entityId: string,
    action: string,
    newState: string,
    timestamp: Date,
    prevHash: string
  ): string {
    const payload = `${actorId}:${entityName}:${entityId}:${action}:${newState}:${timestamp.toISOString()}:${prevHash}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  async logAction(entry: AuditEntryInput, tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) {
    const client = tx || prisma;
    // Get the latest audit log to chain hashes
    const lastRecord = await client.auditLog.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    const prevHash = lastRecord ? lastRecord.verificationHash : 'GENESIS';
    const timestamp = new Date();
    const verificationHash = this.computeChainedHash(
      entry.actorId,
      entry.entityName,
      entry.entityId,
      entry.action,
      entry.newState,
      timestamp,
      prevHash
    );

    return await client.auditLog.create({
      data: {
        actorId: entry.actorId,
        entityName: entry.entityName,
        entityId: entry.entityId,
        action: entry.action,
        previousState: entry.previousState ?? null,
        newState: entry.newState,
        prevHash,
        verificationHash,
        timestamp,
      },
    });
  }

  async verifyAuditChain(): Promise<AuditVerificationResult> {
    const allRecords = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'asc' },
    });

    const tamperedRecordIds: string[] = [];
    let expectedPrevHash = 'GENESIS';

    for (let i = 0; i < allRecords.length; i++) {
      const record = allRecords[i];

      // Check chaining link
      if (i > 0 && record.prevHash !== expectedPrevHash) {
        tamperedRecordIds.push(record.id);
      }

      // Recompute hash
      const recalculatedHash = this.computeChainedHash(
        record.actorId,
        record.entityName,
        record.entityId,
        record.action,
        record.newState,
        record.timestamp,
        record.prevHash
      );

      if (record.verificationHash !== recalculatedHash) {
        if (!tamperedRecordIds.includes(record.id)) {
          tamperedRecordIds.push(record.id);
        }
      }

      expectedPrevHash = record.verificationHash;
    }

    return {
      isValid: tamperedRecordIds.length === 0,
      totalVerified: allRecords.length,
      tamperedRecordIds,
    };
  }
}

export const globalAuditLogger = new AuditLogger();
