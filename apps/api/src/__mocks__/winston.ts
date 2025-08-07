// Mock winston for Jest tests
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

const mockFormat = {
  combine: jest.fn(() => 'combined-format'),
  timestamp: jest.fn(() => 'timestamp-format'),
  printf: jest.fn(() => 'printf-format'),
  errors: jest.fn(() => 'errors-format'),
  json: jest.fn(() => 'json-format'),
};

const mockTransports = {
  Console: jest.fn().mockImplementation(() => ({})),
  DailyRotateFile: jest.fn().mockImplementation(() => ({})),
};

const winston = {
  createLogger: jest.fn(() => mockLogger),
  format: mockFormat,
  transports: mockTransports,
};

// Export both default and named exports for compatibility
export default winston;
export const format = mockFormat;
export const transports = mockTransports;
export const createLogger = jest.fn(() => mockLogger);
