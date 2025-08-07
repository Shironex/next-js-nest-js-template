import { render } from '@react-email/render';
import AccountLockedEmail, { AccountLockedEmailProps } from './account-locked';
import { APP_TITLE } from 'src/common/constants';

// Mock the constants module
jest.mock('src/common/constants', () => ({
  APP_TITLE: 'Test App',
}));

describe('AccountLockedEmail', () => {
  const defaultProps: AccountLockedEmailProps = {
    username: 'testuser',
    lockedUntil: new Date('2024-01-01T12:00:00Z'),
    loginAttempts: 5,
  };

  describe('component rendering', () => {
    it('should render without crashing', () => {
      expect(() => AccountLockedEmail(defaultProps)).not.toThrow();
    });

    it('should include app title in content', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('Test App');
    });

    it('should include username in greeting', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('Hi testuser');
    });

    it('should include login attempts count', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('5 consecutive failed login attempts');
    });

    it('should include preview text', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain(
        'has been temporarily locked due to multiple failed login attempts',
      );
    });

    it('should have proper email structure', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('<html');
      expect(html).toContain('<body');
      expect(html).toContain('</html>');
    });
  });

  describe('date formatting', () => {
    it('should format the locked until date correctly', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      // The date should be formatted using toLocaleString
      expect(html).toContain('January 1, 2024');
      expect(html).toContain('12:00');
    });

    it('should handle different date formats', async () => {
      const props: AccountLockedEmailProps = {
        username: 'testuser',
        lockedUntil: new Date('2025-12-25T23:59:59Z'),
        loginAttempts: 3,
      };
      const html = await render(AccountLockedEmail(props));
      expect(html).toContain('December 25, 2025');
      expect(html).toContain('23:59');
      expect(html).toContain('11:59');
    });

    it('should handle past dates', async () => {
      const props: AccountLockedEmailProps = {
        username: 'testuser',
        lockedUntil: new Date('2020-01-01T00:00:00Z'),
        loginAttempts: 5,
      };
      const html = await render(AccountLockedEmail(props));
      expect(html).toContain('January 1, 2020');
    });

    it('should handle edge case dates', async () => {
      const props: AccountLockedEmailProps = {
        username: 'testuser',
        lockedUntil: new Date('2024-02-29T12:00:00Z'), // Leap year
        loginAttempts: 4,
      };
      const html = await render(AccountLockedEmail(props));
      expect(html).toContain('February 29, 2024');
    });
  });

  describe('username handling', () => {
    it('should display provided username', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('Hi testuser');
    });

    it('should handle empty username', async () => {
      const props: AccountLockedEmailProps = {
        username: '',
        lockedUntil: new Date('2024-01-01T12:00:00Z'),
        loginAttempts: 5,
      };
      const html = await render(AccountLockedEmail(props));
      expect(html).toContain('Hi ');
    });

    it('should handle long username', async () => {
      const props: AccountLockedEmailProps = {
        username: 'very_long_username_that_should_still_work_properly',
        lockedUntil: new Date('2024-01-01T12:00:00Z'),
        loginAttempts: 5,
      };
      const html = await render(AccountLockedEmail(props));
      expect(html).toContain(
        'Hi very_long_username_that_should_still_work_properly',
      );
    });

    it('should handle username with special characters', async () => {
      const props: AccountLockedEmailProps = {
        username: 'user@domain.com_123-test',
        lockedUntil: new Date('2024-01-01T12:00:00Z'),
        loginAttempts: 5,
      };
      const html = await render(AccountLockedEmail(props));
      expect(html).toContain('Hi user@domain.com_123-test');
    });

    it('should handle Unicode characters in username', async () => {
      const props: AccountLockedEmailProps = {
        username: '用户名测试αβγ',
        lockedUntil: new Date('2024-01-01T12:00:00Z'),
        loginAttempts: 5,
      };
      const html = await render(AccountLockedEmail(props));
      expect(html).toContain('Hi 用户名测试αβγ');
    });
  });

  describe('login attempts handling', () => {
    it('should display correct number of login attempts', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('5 consecutive failed login attempts');
    });

    it('should handle single login attempt', async () => {
      const props: AccountLockedEmailProps = {
        username: 'testuser',
        lockedUntil: new Date('2024-01-01T12:00:00Z'),
        loginAttempts: 1,
      };
      const html = await render(AccountLockedEmail(props));
      expect(html).toContain('1 consecutive failed login attempts');
    });

    it('should handle zero login attempts', async () => {
      const props: AccountLockedEmailProps = {
        username: 'testuser',
        lockedUntil: new Date('2024-01-01T12:00:00Z'),
        loginAttempts: 0,
      };
      const html = await render(AccountLockedEmail(props));
      expect(html).toContain('0 consecutive failed login attempts');
    });

    it('should handle large number of login attempts', async () => {
      const props: AccountLockedEmailProps = {
        username: 'testuser',
        lockedUntil: new Date('2024-01-01T12:00:00Z'),
        loginAttempts: 999,
      };
      const html = await render(AccountLockedEmail(props));
      expect(html).toContain('999 consecutive failed login attempts');
    });
  });

  describe('content and messaging', () => {
    it('should include security explanation', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('For your security');
      expect(html).toContain('temporarily locked your account');
    });

    it('should include unlock information', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('🔒 Your account will be automatically unlocked');
    });

    it('should include action instructions', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('What you can do:');
      expect(html).toContain('Wait until the lockout period expires');
      expect(html).toContain('reset it after the lockout expires');
      expect(html).toContain('correct email and password combination');
    });

    it('should include security warning', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain("Didn't try to log in?");
      expect(html).toContain('someone may be trying to access your account');
      expect(html).toContain('changing your password');
    });

    it('should include support information', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('continue to have trouble');
      expect(html).toContain('contact our support team');
    });

    it('should include automated message disclaimer', async () => {
      const html = await render(AccountLockedEmail(defaultProps));
      expect(html).toContain('automated security notification');
    });
  });
});
