import crypto from 'node:crypto';

export class Sha256Hasher {
  computeDigest(data: Buffer | string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  verifyDigest(data: Buffer | string, expectedHash: string): boolean {
    const computed = this.computeDigest(data);
    return crypto.timingSafeEqual(Buffer.from(computed, 'utf-8'), Buffer.from(expectedHash, 'utf-8'));
  }
}

export const globalSha256Hasher = new Sha256Hasher();
