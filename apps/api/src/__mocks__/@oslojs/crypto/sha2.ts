// Mock for @oslojs/crypto/sha2
export const sha256 = jest.fn((data: Uint8Array): Uint8Array => {
  // Return a mock hash - in real implementation this would be a proper SHA256 hash
  // For testing purposes, we'll return a consistent mock hash based on input content
  const mockHash = new Uint8Array(32); // SHA256 produces 32 bytes

  // Create a more distinct pattern based on actual input content
  let contentHash = 0;
  for (let i = 0; i < data.length; i++) {
    contentHash += data[i] * (i + 1);
  }

  // Fill with a deterministic pattern based on input content and length
  for (let i = 0; i < 32; i++) {
    mockHash[i] = (contentHash + data.length * i + i * 7) % 256;
  }

  return mockHash;
});

// Mock for SHA256 class if needed
export class SHA256 {
  private data: Uint8Array[] = [];

  update(data: Uint8Array): this {
    this.data.push(data);
    return this;
  }

  digest(): Uint8Array {
    // Combine all data and return mock hash
    const totalLength = this.data.reduce((sum, arr) => sum + arr.length, 0);
    return sha256(new Uint8Array(totalLength));
  }
}

// Mock for sha224 as well in case it's used elsewhere
export const sha224 = jest.fn((data: Uint8Array): Uint8Array => {
  // Return a mock hash - SHA224 produces 28 bytes
  const mockHash = new Uint8Array(28);

  // Create a more distinct pattern based on actual input content
  let contentHash = 0;
  for (let i = 0; i < data.length; i++) {
    contentHash += data[i] * (i + 1);
  }

  for (let i = 0; i < 28; i++) {
    mockHash[i] = (contentHash + data.length * i + i * 11) % 256;
  }

  return mockHash;
});

export class SHA224 {
  private data: Uint8Array[] = [];

  update(data: Uint8Array): this {
    this.data.push(data);
    return this;
  }

  digest(): Uint8Array {
    const totalLength = this.data.reduce((sum, arr) => sum + arr.length, 0);
    return sha224(new Uint8Array(totalLength));
  }
}
