import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { ValueTransformer } from 'typeorm';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey(): Buffer {
  const secret = process.env.CRYPTO_SECRET;
  if (!secret) {
    throw new Error('CRYPTO_SECRET não configurado');
  }
  return createHash('sha256').update(secret).digest();
}

export const encryptedColumnTransformer: ValueTransformer = {
  to(plain?: string): string | undefined {
    if (plain === undefined || plain === null) return plain;

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  },

  from(stored?: string): string | undefined {
    if (stored === undefined || stored === null) return stored;

    const raw = Buffer.from(stored, 'base64');
    const iv = raw.subarray(0, IV_LENGTH);
    const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = raw.subarray(IV_LENGTH + 16);

    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  },
};
