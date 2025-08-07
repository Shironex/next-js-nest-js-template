// Mock for @oslojs/encoding
export const encodeHexLowerCase = jest.fn((buffer: Uint8Array): string => {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
});

export const encodeHexUpperCase = jest.fn((buffer: Uint8Array): string => {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');
});

export const decodeHex = jest.fn((hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
});
