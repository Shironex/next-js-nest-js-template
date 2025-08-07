// Mock for @oslojs/crypto and @oslojs/crypto/subtle
export const constantTimeEqual = jest.fn(
  (a: Uint8Array, b: Uint8Array): boolean => {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }

    return result === 0;
  },
);

// Export a default object as well
export default {
  constantTimeEqual,
  subtle: {
    constantTimeEqual,
  },
};
