import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { APP_TITLE } from 'src/common/constants';

export interface VerificationCodeEmailProps {
  code: string;
}

export const VerificationCodeEmail: React.FC<VerificationCodeEmailProps> = ({
  code,
}) => {
  return (
    <Html>
      <Head />
      <Preview
        children={`Verify your email address to complete your ${APP_TITLE} registration`}
      />
      <Body style={main}>
        <Container style={container}>
          {/* Logo Section */}
          <Section style={logoSection}>
            <Text style={logo}>{APP_TITLE}</Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Text style={greeting}>Hi there,</Text>

            <Text style={mainText}>
              Thanks for signing up! Your verification code is:
            </Text>

            {/* Verification Code */}
            <Section style={codeContainer}>
              <Text style={codeDisplay}>{code}</Text>
            </Section>

            <Text style={instructionText}>
              Enter this code to complete your email verification.
            </Text>

            <Text style={expiryText}>This code will expire in 15 minutes.</Text>

            <Text style={helpText}>
              If you didn't create an account, you can safely ignore this email.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help? Contact us at{' '}
              <Link href="mailto:support@example.com" style={footerLink}>
                support@example.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

VerificationCodeEmail.PreviewProps = {
  code: '1234 5678',
} as VerificationCodeEmailProps;

export default VerificationCodeEmail;

// Unified Dark Design System Colors (from globals.css)
const colors = {
  // Dark theme background colors
  background: '#131313', // oklch(0.2178 0 0)
  card: '#1F1F1F', // oklch(0.2435 0 0)
  primary: '#B8B8B8', // oklch(0.7058 0 0)
  primaryForeground: '#131313', // oklch(0.2178 0 0)
  secondary: '#242424', // oklch(0.3092 0 0)
  muted: '#1C1C1C', // oklch(0.2850 0 0)
  mutedForeground: '#999999', // oklch(0.5999 0 0)
  accent: '#3F3F3F', // oklch(0.3715 0 0)
  border: '#333333', // oklch(0.3290 0 0)
  destructive: '#EF4444',
  // Text colors
  foreground: '#E5E5E5', // oklch(0.8853 0 0)
};

// Main layout
const main = {
  backgroundColor: colors.background,
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: colors.foreground,
  padding: '0',
  margin: '0',
};

const container = {
  backgroundColor: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  maxWidth: '600px',
  margin: '40px auto',
  overflow: 'hidden',
};

// Header section
const logoSection = {
  backgroundColor: colors.secondary,
  padding: '32px 40px',
  textAlign: 'center' as const,
  borderBottom: `1px solid ${colors.border}`,
};

const logo = {
  color: colors.primary,
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '-0.02em',
};

// Content section
const contentSection = {
  padding: '40px',
};

const greeting = {
  color: colors.foreground,
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 24px 0',
  lineHeight: '1.5',
};

const mainText = {
  color: colors.foreground,
  fontSize: '16px',
  fontWeight: '400',
  margin: '0 0 32px 0',
  lineHeight: '1.6',
};

// Code display section
const codeContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const codeDisplay = {
  backgroundColor: colors.accent,
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  color: colors.primary,
  fontSize: '28px',
  fontWeight: '700',
  fontFamily: 'Fira Code, Monaco, "Courier New", monospace',
  letterSpacing: '0.15em',
  padding: '20px 32px',
  margin: '0',
  display: 'inline-block',
  minWidth: '280px',
};

const instructionText = {
  color: colors.mutedForeground,
  fontSize: '16px',
  fontWeight: '400',
  margin: '32px 0 20px 0',
  lineHeight: '1.6',
  textAlign: 'center' as const,
};

const expiryText = {
  color: colors.mutedForeground,
  fontSize: '14px',
  fontWeight: '400',
  margin: '20px 0 32px 0',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  opacity: '0.8',
};

const helpText = {
  color: colors.mutedForeground,
  fontSize: '14px',
  fontWeight: '400',
  margin: '32px 0 0 0',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  opacity: '0.7',
};

// Footer section
const footer = {
  backgroundColor: colors.muted,
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderTop: `1px solid ${colors.border}`,
};

const footerText = {
  color: colors.mutedForeground,
  fontSize: '13px',
  fontWeight: '400',
  margin: '0',
  lineHeight: '1.5',
};

const footerLink = {
  color: colors.primary,
  textDecoration: 'none',
};
