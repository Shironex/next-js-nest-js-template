import { decodeHex, encodeHexLowerCase } from '@oslojs/encoding';
import { constantTimeEqual } from '@oslojs/crypto/subtle';

interface PasswordHashingAlgorithm {
  hash(password: string): Promise<string>;
  verify(hash: string, password: string): Promise<boolean>;
}

export class ScryptService implements PasswordHashingAlgorithm {
  constructor(
    private readonly generateScryptKey: (
      data: string,
      salt: string,
      blockSize?: number,
    ) => Promise<Uint8Array>,
  ) {}

  async hash(password: string): Promise<string> {
    const salt = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(16)));
    const key = await this.generateScryptKey(password.normalize('NFKC'), salt);
    return `${salt}:${encodeHexLowerCase(key)}`;
  }

  async verify(hash: string, password: string): Promise<boolean> {
    const parts = hash.split(':');
    if (parts.length !== 2) return false;

    const [salt, key] = parts;
    const targetKey = await this.generateScryptKey(
      password.normalize('NFKC'),
      salt,
    );
    return constantTimeEqual(targetKey, decodeHex(key));
  }
}
