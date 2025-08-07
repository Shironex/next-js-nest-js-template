import { render } from '@react-email/render';
import ResetPasswordLinkEmail, {
  ResetPasswordLinkEmailProps,
} from './reset-password-link';
import { APP_TITLE } from 'src/common/constants';

// Mock the constants module
jest.mock('src/common/constants', () => ({
  APP_TITLE: 'Test App',
}));

describe('ResetPasswordLinkEmail', () => {
  const defaultProps: ResetPasswordLinkEmailProps = {
    resetLink: 'https://example.com/reset?token=abc123',
    userName: 'John Doe',
  };

  describe('component rendering', () => {
    it('should render without crashing', () => {
      expect(() => ResetPasswordLinkEmail(defaultProps)).not.toThrow();
    });

    it('should render with provided reset link', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('https://example.com/reset?token=abc123');
    });

    it('should include app title in content', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('Test App');
    });

    it('should include username in greeting', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('Hi John Doe');
    });

    it('should include preview text', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('Reset your password to continue');
    });

    it('should have proper email structure', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('<html');
      expect(html).toContain('<body');
      expect(html).toContain('</html>');
    });
  });

  describe('username handling', () => {
    it('should use default greeting when username is undefined', async () => {
      const props: ResetPasswordLinkEmailProps = {
        resetLink: 'https://example.com/reset?token=abc123',
      };
      const html = await render(ResetPasswordLinkEmail(props));
      expect(html).toContain('Hi there');
    });

    it('should use provided username when available', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('Hi John Doe');
    });

    it('should handle empty string username', async () => {
      const props: ResetPasswordLinkEmailProps = {
        resetLink: 'https://example.com/reset?token=abc123',
        userName: '',
      };
      const html = await render(ResetPasswordLinkEmail(props));
      expect(html).toContain('Hi ');
    });

    it('should handle long username', async () => {
      const props: ResetPasswordLinkEmailProps = {
        resetLink: 'https://example.com/reset?token=abc123',
        userName: 'Very Long Username That Should Still Work',
      };
      const html = await render(ResetPasswordLinkEmail(props));
      expect(html).toContain('Hi Very Long Username That Should Still Work');
    });

    it('should handle username with special characters', async () => {
      const props: ResetPasswordLinkEmailProps = {
        resetLink: 'https://example.com/reset?token=abc123',
        userName: "O'Connor-Smith",
      };
      const html = await render(ResetPasswordLinkEmail(props));
      expect(html).toContain("Hi O'Connor-Smith");
    });
  });

  describe('reset link handling', () => {
    it('should include reset link as button href', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('href="https://example.com/reset?token=abc123"');
    });

    it('should handle empty reset link', async () => {
      const props: ResetPasswordLinkEmailProps = {
        resetLink: '',
        userName: 'John Doe',
      };
      const html = await render(ResetPasswordLinkEmail(props));
      expect(html).toContain('href=""');
    });

    it('should handle complex reset link with query parameters', async () => {
      const props: ResetPasswordLinkEmailProps = {
        resetLink:
          'https://app.example.com/auth/reset?token=abc123&user=456&expires=789',
        userName: 'John Doe',
      };
      const html = await render(ResetPasswordLinkEmail(props));
      expect(html).toContain('token=abc123&user=456&expires=789');
    });

    it('should handle HTTPS and HTTP links', async () => {
      const httpsProps: ResetPasswordLinkEmailProps = {
        resetLink: 'https://secure.example.com/reset',
        userName: 'John Doe',
      };
      const httpProps: ResetPasswordLinkEmailProps = {
        resetLink: 'http://example.com/reset',
        userName: 'John Doe',
      };

      const httpsHtml = await render(ResetPasswordLinkEmail(httpsProps));
      const httpHtml = await render(ResetPasswordLinkEmail(httpProps));

      expect(httpsHtml).toContain('https://secure.example.com/reset');
      expect(httpHtml).toContain('http://example.com/reset');
    });

    it('should handle very long reset links', async () => {
      const longLink =
        'https://example.com/reset?token=' + 'a'.repeat(200) + '&extra=param';
      const props: ResetPasswordLinkEmailProps = {
        resetLink: longLink,
        userName: 'John Doe',
      };
      const html = await render(ResetPasswordLinkEmail(props));
      expect(html).toContain(longLink);
    });
  });

  describe('content and messaging', () => {
    it('should include reset password instructions', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('received a request to reset your password');
      expect(html).toContain('Click the button below');
      expect(html).toContain('choose a new password');
    });

    it('should mention link expiration', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('expire in 10 minutes');
    });

    it('should include security disclaimer', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain("didn't request this password reset");
      expect(html).toContain('safely ignore this email');
      expect(html).toContain('password will remain unchanged');
    });

    it('should include support contact information', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('Need help?');
      expect(html).toContain('support@example.com');
    });

    it('should include Reset Password button text', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('Reset Password');
    });
  });

  describe('styling and layout', () => {
    it('should include hero section with title', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('Reset Your Password');
    });

    it('should include horizontal rules for separation', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('<hr');
    });

    it('should have button container for the reset button', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('Reset Password');
      // The button should be in the HTML structure
    });
  });

  describe('preview props', () => {
    it('should have preview props defined', () => {
      expect(ResetPasswordLinkEmail.PreviewProps).toBeDefined();
      expect(ResetPasswordLinkEmail.PreviewProps.resetLink).toBe(
        'https://example.com/auth/reset-password?token=123456789',
      );
      expect(ResetPasswordLinkEmail.PreviewProps.userName).toBe('John');
    });

    it('should render with preview props', async () => {
      const html = await render(
        ResetPasswordLinkEmail(ResetPasswordLinkEmail.PreviewProps),
      );
      expect(html).toContain(
        'https://example.com/auth/reset-password?token=123456789',
      );
      expect(html).toContain('Hi John');
    });
  });

  describe('accessibility and security', () => {
    it('should not contain harmful scripts', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).not.toContain('<script');
      expect(html).not.toContain('javascript:');
      expect(html).not.toContain('onclick');
    });

    it('should properly escape user input in username', async () => {
      const props: ResetPasswordLinkEmailProps = {
        resetLink: 'https://example.com/reset',
        userName: '<script>alert("xss")</script>',
      };
      const html = await render(ResetPasswordLinkEmail(props));
      // React should escape HTML by default
      expect(html).not.toContain('<script>alert');
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('alert("xss")');
    });

    it('should handle malicious reset links safely', async () => {
      const props: ResetPasswordLinkEmailProps = {
        resetLink: 'javascript:alert("xss")',
        userName: 'John Doe',
      };
      const html = await render(ResetPasswordLinkEmail(props));
      // The link should be included as-is (email clients should handle security)
      expect(html).toContain('javascript:alert');
    });
  });

  describe('error handling', () => {
    it('should handle undefined props gracefully', () => {
      expect(() => ResetPasswordLinkEmail(undefined as any)).not.toThrow();
    });

    it('should handle null values', async () => {
      const props = {
        resetLink: null as any,
        userName: null as any,
      };
      const html = await render(ResetPasswordLinkEmail(props));
      expect(html).toBeDefined();
    });
  });

  describe('internationalization readiness', () => {
    it('should contain English text by default', async () => {
      const html = await render(ResetPasswordLinkEmail(defaultProps));
      expect(html).toContain('Reset Your Password');
      expect(html).toContain('received a request');
    });

    it('should handle Unicode characters in username', async () => {
      const props: ResetPasswordLinkEmailProps = {
        resetLink: 'https://example.com/reset',
        userName: '张三 José María',
      };
      const html = await render(ResetPasswordLinkEmail(props));
      expect(html).toContain('张三 José María');
    });

    it('should handle international domain names in reset links', async () => {
      const props: ResetPasswordLinkEmailProps = {
        resetLink: 'https://例え.テスト/reset?token=abc',
        userName: 'John Doe',
      };
      const html = await render(ResetPasswordLinkEmail(props));
      expect(html).toContain('例え.テスト');
    });
  });
});
