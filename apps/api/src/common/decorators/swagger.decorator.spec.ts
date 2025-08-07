import { applyDecorators } from '@nestjs/common';
import { ApiDocs } from './swagger.decorator';

// Mock NestJS decorators
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  applyDecorators: jest.fn(),
}));

describe('Swagger Decorator', () => {
  const mockApplyDecorators = applyDecorators as jest.MockedFunction<
    typeof applyDecorators
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ApiDocs', () => {
    it('should call applyDecorators with provided decorators', () => {
      const decorator1 = jest.fn();
      const decorator2 = jest.fn();
      const decorator3 = jest.fn();

      ApiDocs(decorator1, decorator2, decorator3);

      expect(mockApplyDecorators).toHaveBeenCalledWith(
        decorator1,
        decorator2,
        decorator3,
      );
      expect(mockApplyDecorators).toHaveBeenCalledTimes(1);
    });

    it('should work with single decorator', () => {
      const singleDecorator = jest.fn();

      ApiDocs(singleDecorator);

      expect(mockApplyDecorators).toHaveBeenCalledWith(singleDecorator);
    });

    it('should work with no decorators', () => {
      ApiDocs();

      expect(mockApplyDecorators).toHaveBeenCalledWith();
    });

    it('should work with many decorators', () => {
      const decorators = Array.from({ length: 10 }, (_, i) =>
        jest.fn().mockName(`decorator${i}`),
      );

      ApiDocs(...decorators);

      expect(mockApplyDecorators).toHaveBeenCalledWith(...decorators);
    });

    it('should pass through return value from applyDecorators', () => {
      const mockReturnValue = jest.fn();
      mockApplyDecorators.mockReturnValue(mockReturnValue);

      const decorator = jest.fn();
      const result = ApiDocs(decorator);

      expect(result).toBe(mockReturnValue);
    });

    it('should handle different decorator types', () => {
      // Mock different types of decorators
      const classDecorator = jest.fn() as ClassDecorator;
      const methodDecorator = jest.fn() as MethodDecorator;
      const propertyDecorator = jest.fn() as PropertyDecorator;

      ApiDocs(classDecorator, methodDecorator, propertyDecorator);

      expect(mockApplyDecorators).toHaveBeenCalledWith(
        classDecorator,
        methodDecorator,
        propertyDecorator,
      );
    });

    it('should maintain decorator order', () => {
      const firstDecorator = jest.fn().mockName('first');
      const secondDecorator = jest.fn().mockName('second');
      const thirdDecorator = jest.fn().mockName('third');

      ApiDocs(firstDecorator, secondDecorator, thirdDecorator);

      expect(mockApplyDecorators).toHaveBeenCalledWith(
        firstDecorator,
        secondDecorator,
        thirdDecorator,
      );
    });
  });
});
