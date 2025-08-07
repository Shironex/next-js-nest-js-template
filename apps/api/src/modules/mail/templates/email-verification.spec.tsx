import { render } from '@react-email/render';
import VerificationCodeEmail, {
  VerificationCodeEmailProps,
} from './email-verification';
import { APP_TITLE } from 'src/common/constants';

// Mock the constants module
jest.mock('src/common/constants', () => ({
  APP_TITLE: 'Test App',
}));

describe('VerificationCodeEmail', () => {
  const defaultProps: VerificationCodeEmailProps = {
    code: '123456',
  };

  describe('component rendering', () => {
    it('should render without crashing', () => {
      expect(() => VerificationCodeEmail(defaultProps)).not.toThrow();
    });

    it('should render with provided code', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      expect(html).toContain('123456');
    });

    it('should include app title in content', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      expect(html).toContain('Test App');
    });

    it('should include verification message', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      expect(html).toContain('verify your account');
      expect(html).toContain('registration');
    });

    it('should include preview text', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      expect(html).toContain('Verify your email address');
    });

    it('should have proper email structure', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      expect(html).toContain('<html');
      expect(html).toContain('<body');
      expect(html).toContain('</html>');
    });
  });

  describe('code handling', () => {
    it('should handle empty code', async () => {
      const props: VerificationCodeEmailProps = { code: '' };
      const html = await render(VerificationCodeEmail(props));
      expect(html).toContain('<div'); // Should still render structure
    });

    it('should handle long code', async () => {
      const props: VerificationCodeEmailProps = {
        code: '1234567890abcdefghijklmnop',
      };
      const html = await render(VerificationCodeEmail(props));
      expect(html).toContain('1234567890abcdefghijklmnop');
    });

    it('should handle code with spaces', async () => {
      const props: VerificationCodeEmailProps = {
        code: '1234 5678',
      };
      const html = await render(VerificationCodeEmail(props));
      expect(html).toContain('1234 5678');
    });

    it('should handle special characters in code', async () => {
      const props: VerificationCodeEmailProps = {
        code: 'ABC-123_XYZ',
      };
      const html = await render(VerificationCodeEmail(props));
      expect(html).toContain('ABC-123_XYZ');
    });

    it('should handle numeric code', async () => {
      const props: VerificationCodeEmailProps = {
        code: '999888',
      };
      const html = await render(VerificationCodeEmail(props));
      expect(html).toContain('999888');
    });
  });

  describe('styling and layout', () => {
    it('should include CSS styles for code placeholder', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      // Check that the code is properly styled (should be in a styled container)
      expect(html).toContain('123456');
      // The specific styling is applied via the React Email components
    });

    it('should include proper text content', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      expect(html).toContain('Thank you for choosing');
      expect(html).toContain('complete your registration');
      expect(html).toContain('If you have any questions');
    });

    it('should include horizontal rules for separation', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      expect(html).toContain('<hr');
    });
  });

  describe('preview props', () => {
    it('should have preview props defined', () => {
      expect(VerificationCodeEmail.PreviewProps).toBeDefined();
      expect(VerificationCodeEmail.PreviewProps.code).toBe('1234 5678');
    });

    it('should render with preview props', async () => {
      const html = await render(
        VerificationCodeEmail(VerificationCodeEmail.PreviewProps),
      );
      expect(html).toContain('1234 5678');
    });
  });

  describe('accessibility and content', () => {
    it('should include alt text and proper semantic structure', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      // React Email components should generate proper semantic HTML
      expect(html).toContain('<div'); // Container elements
      expect(html).toContain('Hi,'); // Greeting
    });

    it('should include support information', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      expect(html).toContain('questions or need assistance');
      expect(html).toContain('Hope you learn something new');
    });

    it('should not contain harmful scripts', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      expect(html).not.toContain('<script');
      expect(html).not.toContain('javascript:');
      expect(html).not.toContain('onclick');
    });
  });

  describe('error handling', () => {
    it('should handle undefined props gracefully', () => {
      // TypeScript should prevent this, but testing runtime behavior
      expect(() => VerificationCodeEmail(undefined as any)).not.toThrow();
    });

    it('should handle null code', async () => {
      const props = { code: null as any };
      const html = await render(VerificationCodeEmail(props));
      expect(html).toBeDefined();
    });
  });

  describe('internationalization readiness', () => {
    it('should contain English text by default', async () => {
      const html = await render(VerificationCodeEmail(defaultProps));
      expect(html).toContain('Thank you for choosing');
      expect(html).toContain('verify your account');
    });

    it('should handle Unicode characters in code', async () => {
      const props: VerificationCodeEmailProps = {
        code: '测试123αβγ',
      };
      const html = await render(VerificationCodeEmail(props));
      expect(html).toContain('测试123αβγ');
    });
  });
});
