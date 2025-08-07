import { SetMetadata } from '@nestjs/common';
import {
  RequireTurnstile,
  REQUIRE_TURNSTILE_KEY,
} from './require-turnstile.decorator';

// Mock SetMetadata
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  SetMetadata: jest.fn(),
}));

const mockSetMetadata = SetMetadata as jest.MockedFunction<typeof SetMetadata>;

describe('RequireTurnstile Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call SetMetadata with correct key and value', () => {
    const mockDecorator = jest.fn() as any;
    mockDecorator.KEY = REQUIRE_TURNSTILE_KEY;
    mockSetMetadata.mockReturnValue(mockDecorator);

    RequireTurnstile();

    expect(mockSetMetadata).toHaveBeenCalledWith(REQUIRE_TURNSTILE_KEY, true);
    expect(mockSetMetadata).toHaveBeenCalledTimes(1);
  });

  it('should export the correct metadata key', () => {
    expect(REQUIRE_TURNSTILE_KEY).toBe('require_turnstile');
  });

  it('should return a decorator function', () => {
    const mockDecorator = jest.fn() as any;
    mockDecorator.KEY = REQUIRE_TURNSTILE_KEY;
    mockSetMetadata.mockReturnValue(mockDecorator);

    const result = RequireTurnstile();

    expect(result).toBe(mockDecorator);
  });
});
