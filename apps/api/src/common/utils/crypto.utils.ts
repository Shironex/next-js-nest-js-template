import { randomBytes } from 'crypto';

export type AlphabetPattern = '0-9' | 'a-z' | 'A-Z' | 'a-zA-Z' | 'a-zA-Z0-9';

export function alphabet(pattern: AlphabetPattern): string {
  const patterns: Record<AlphabetPattern, string> = {
    '0-9': '0123456789',
    'a-z': 'abcdefghijklmnopqrstuvwxyz',
    'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'a-zA-Z': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'a-zA-Z0-9':
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  };

  return patterns[pattern] || pattern;
}

export function generateRandomString(length: number, chars: string): string {
  if (length <= 0) {
    throw new Error('Length must be greater than 0');
  }

  if (!chars || chars.length === 0) {
    throw new Error('Character set cannot be empty');
  }

  const bytes = randomBytes(length);
  const result = new Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = chars[bytes[i] % chars.length];
  }

  return result.join('');
}
