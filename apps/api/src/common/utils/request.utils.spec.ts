import { Request } from 'express';
import { getClientIp } from './request.utils';

describe('Request Utils', () => {
  describe('getClientIp', () => {
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        headers: {},
        connection: {},
        ip: undefined,
      };
    });

    it('should return x-forwarded-for header when present', () => {
      mockRequest.headers = {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      };

      const result = getClientIp(mockRequest as Request);

      expect(result).toBe('192.168.1.1, 10.0.0.1');
    });

    it('should return x-real-ip header when x-forwarded-for is not present', () => {
      mockRequest.headers = {
        'x-real-ip': '192.168.1.1',
      };

      const result = getClientIp(mockRequest as Request);

      expect(result).toBe('192.168.1.1');
    });

    it('should return connection.remoteAddress when headers are not present', () => {
      mockRequest.connection = {
        remoteAddress: '127.0.0.1',
      };

      const result = getClientIp(mockRequest as Request);

      expect(result).toBe('127.0.0.1');
    });

    it('should return request.ip when other options are not available', () => {
      mockRequest.ip = '10.0.0.1';

      const result = getClientIp(mockRequest as Request);

      expect(result).toBe('10.0.0.1');
    });

    it('should return null when no IP information is available', () => {
      mockRequest = {
        headers: {},
        connection: {},
        ip: undefined,
      };

      const result = getClientIp(mockRequest as Request);

      expect(result).toBeNull();
    });

    it('should prioritize x-forwarded-for over other options', () => {
      mockRequest.headers = {
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '10.0.0.1',
      };
      mockRequest.connection = {
        remoteAddress: '127.0.0.1',
      };
      mockRequest.ip = '172.16.0.1';

      const result = getClientIp(mockRequest as Request);

      expect(result).toBe('192.168.1.1');
    });

    it('should prioritize x-real-ip over connection when x-forwarded-for is not present', () => {
      mockRequest.headers = {
        'x-real-ip': '10.0.0.1',
      };
      mockRequest.connection = {
        remoteAddress: '127.0.0.1',
      };
      mockRequest.ip = '172.16.0.1';

      const result = getClientIp(mockRequest as Request);

      expect(result).toBe('10.0.0.1');
    });

    it('should prioritize connection.remoteAddress over request.ip', () => {
      mockRequest.connection = {
        remoteAddress: '127.0.0.1',
      };
      mockRequest.ip = '172.16.0.1';

      const result = getClientIp(mockRequest as Request);

      expect(result).toBe('127.0.0.1');
    });

    it('should handle empty string headers', () => {
      mockRequest.headers = {
        'x-forwarded-for': '',
        'x-real-ip': '',
      };
      mockRequest.connection = {
        remoteAddress: '127.0.0.1',
      };

      const result = getClientIp(mockRequest as Request);

      expect(result).toBe('127.0.0.1');
    });

    it('should handle undefined headers object', () => {
      mockRequest.headers = undefined;
      mockRequest.connection = {
        remoteAddress: '127.0.0.1',
      };

      const result = getClientIp(mockRequest as Request);

      expect(result).toBe('127.0.0.1');
    });
  });
});
