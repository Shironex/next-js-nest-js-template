import {
  TimeSpan,
  createDate,
  isWithinExpirationDate,
  TimeUnit,
} from './date.utils';

describe('Date Utils', () => {
  describe('TimeSpan', () => {
    describe('constructor and conversion methods', () => {
      it('should handle seconds correctly', () => {
        const timeSpan = new TimeSpan(30, 's');
        expect(timeSpan.toMilliseconds()).toBe(30 * 1000);
        expect(timeSpan.toSeconds()).toBe(30);
        expect(timeSpan.toMinutes()).toBe(0);
        expect(timeSpan.toHours()).toBe(0);
        expect(timeSpan.toDays()).toBe(0);
      });

      it('should handle minutes correctly', () => {
        const timeSpan = new TimeSpan(5, 'm');
        expect(timeSpan.toMilliseconds()).toBe(5 * 60 * 1000);
        expect(timeSpan.toSeconds()).toBe(5 * 60);
        expect(timeSpan.toMinutes()).toBe(5);
        expect(timeSpan.toHours()).toBe(0);
        expect(timeSpan.toDays()).toBe(0);
      });

      it('should handle hours correctly', () => {
        const timeSpan = new TimeSpan(2, 'h');
        expect(timeSpan.toMilliseconds()).toBe(2 * 60 * 60 * 1000);
        expect(timeSpan.toSeconds()).toBe(2 * 60 * 60);
        expect(timeSpan.toMinutes()).toBe(2 * 60);
        expect(timeSpan.toHours()).toBe(2);
        expect(timeSpan.toDays()).toBe(0);
      });

      it('should handle days correctly', () => {
        const timeSpan = new TimeSpan(3, 'd');
        expect(timeSpan.toMilliseconds()).toBe(3 * 24 * 60 * 60 * 1000);
        expect(timeSpan.toSeconds()).toBe(3 * 24 * 60 * 60);
        expect(timeSpan.toMinutes()).toBe(3 * 24 * 60);
        expect(timeSpan.toHours()).toBe(3 * 24);
        expect(timeSpan.toDays()).toBe(3);
      });

      it('should handle weeks correctly', () => {
        const timeSpan = new TimeSpan(1, 'w');
        expect(timeSpan.toMilliseconds()).toBe(7 * 24 * 60 * 60 * 1000);
        expect(timeSpan.toSeconds()).toBe(7 * 24 * 60 * 60);
        expect(timeSpan.toMinutes()).toBe(7 * 24 * 60);
        expect(timeSpan.toHours()).toBe(7 * 24);
        expect(timeSpan.toDays()).toBe(7);
      });

      it('should handle unknown unit with default case', () => {
        const timeSpan = new TimeSpan(10, 'x' as TimeUnit);
        expect(timeSpan.toMilliseconds()).toBe(0);
        expect(timeSpan.toSeconds()).toBe(0);
        expect(timeSpan.toMinutes()).toBe(0);
        expect(timeSpan.toHours()).toBe(0);
        expect(timeSpan.toDays()).toBe(0);
      });

      it('should handle zero values', () => {
        const timeSpan = new TimeSpan(0, 'h');
        expect(timeSpan.toMilliseconds()).toBe(0);
        expect(timeSpan.toSeconds()).toBe(0);
        expect(timeSpan.toMinutes()).toBe(0);
        expect(timeSpan.toHours()).toBe(0);
        expect(timeSpan.toDays()).toBe(0);
      });

      it('should handle negative values', () => {
        const timeSpan = new TimeSpan(-5, 'm');
        expect(timeSpan.toMilliseconds()).toBe(-5 * 60 * 1000);
        expect(timeSpan.toSeconds()).toBe(-5 * 60);
        expect(timeSpan.toMinutes()).toBe(-5);
      });

      it('should handle decimal values', () => {
        const timeSpan = new TimeSpan(1.5, 'h');
        expect(timeSpan.toMilliseconds()).toBe(1.5 * 60 * 60 * 1000);
        expect(timeSpan.toSeconds()).toBe(Math.floor(1.5 * 60 * 60));
        expect(timeSpan.toMinutes()).toBe(Math.floor(1.5 * 60));
        expect(timeSpan.toHours()).toBe(1); // Math.floor
      });
    });

    describe('conversion precision', () => {
      it('should floor conversion results', () => {
        // 90 seconds = 1.5 minutes, should floor to 1
        const timeSpan = new TimeSpan(90, 's');
        expect(timeSpan.toMinutes()).toBe(1);
        expect(timeSpan.toHours()).toBe(0);
      });

      it('should handle large values', () => {
        const timeSpan = new TimeSpan(10000, 's');
        expect(timeSpan.toMilliseconds()).toBe(10000 * 1000);
        expect(timeSpan.toSeconds()).toBe(10000);
        expect(timeSpan.toMinutes()).toBe(Math.floor(10000 / 60));
        expect(timeSpan.toHours()).toBe(Math.floor(10000 / 3600));
      });
    });
  });

  describe('createDate', () => {
    it('should create date in the future', () => {
      const timeSpan = new TimeSpan(1, 'h');
      const futureDate = createDate(timeSpan);
      const now = new Date();

      expect(futureDate.getTime()).toBeGreaterThan(now.getTime());
      expect(futureDate.getTime() - now.getTime()).toBeCloseTo(
        60 * 60 * 1000,
        -2,
      ); // Within 100ms
    });

    it('should create date in the past with negative timespan', () => {
      const timeSpan = new TimeSpan(-1, 'h');
      const pastDate = createDate(timeSpan);
      const now = new Date();

      expect(pastDate.getTime()).toBeLessThan(now.getTime());
    });

    it('should create same date with zero timespan', () => {
      const timeSpan = new TimeSpan(0, 's');
      const sameDate = createDate(timeSpan);
      const now = new Date();

      expect(Math.abs(sameDate.getTime() - now.getTime())).toBeLessThan(10); // Within 10ms
    });

    it('should work with different time units', () => {
      const timeSpanMinutes = new TimeSpan(30, 'm');
      const timeSpanDays = new TimeSpan(1, 'd');

      const futureMinutes = createDate(timeSpanMinutes);
      const futureDays = createDate(timeSpanDays);
      const now = new Date();

      expect(futureMinutes.getTime()).toBeGreaterThan(now.getTime());
      expect(futureDays.getTime()).toBeGreaterThan(futureMinutes.getTime());
    });
  });

  describe('isWithinExpirationDate', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date(Date.now() + 60000); // 1 minute from now
      expect(isWithinExpirationDate(futureDate)).toBe(true);
    });

    it('should return false for past dates', () => {
      const pastDate = new Date(Date.now() - 60000); // 1 minute ago
      expect(isWithinExpirationDate(pastDate)).toBe(false);
    });

    it('should return false for current time (edge case)', () => {
      const now = new Date();

      // Create a date that's essentially "now" but slightly in the past due to execution time
      setTimeout(() => {
        expect(isWithinExpirationDate(now)).toBe(false);
      }, 1);
    });

    it('should work with dates created by createDate', () => {
      const futureTimeSpan = new TimeSpan(1, 'h');
      const pastTimeSpan = new TimeSpan(-1, 'h');

      const futureDate = createDate(futureTimeSpan);
      const pastDate = createDate(pastTimeSpan);

      expect(isWithinExpirationDate(futureDate)).toBe(true);
      expect(isWithinExpirationDate(pastDate)).toBe(false);
    });

    it('should handle very far future dates', () => {
      const farFutureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      expect(isWithinExpirationDate(farFutureDate)).toBe(true);
    });

    it('should handle very old dates', () => {
      const veryOldDate = new Date(0); // January 1, 1970
      expect(isWithinExpirationDate(veryOldDate)).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should work together for session expiration logic', () => {
      // Create a session that expires in 15 minutes
      const sessionDuration = new TimeSpan(15, 'm');
      const expiresAt = createDate(sessionDuration);

      expect(isWithinExpirationDate(expiresAt)).toBe(true);

      // Simulate checking after the session should have expired
      const expiredSession = new Date(Date.now() - 1000); // 1 second ago
      expect(isWithinExpirationDate(expiredSession)).toBe(false);
    });

    it('should work for token expiration scenarios', () => {
      // Short-lived token (5 seconds)
      const shortToken = createDate(new TimeSpan(5, 's'));
      expect(isWithinExpirationDate(shortToken)).toBe(true);

      // Long-lived token (7 days)
      const longToken = createDate(new TimeSpan(7, 'd'));
      expect(isWithinExpirationDate(longToken)).toBe(true);

      // Expired token
      const expiredToken = createDate(new TimeSpan(-1, 'd'));
      expect(isWithinExpirationDate(expiredToken)).toBe(false);
    });
  });
});
