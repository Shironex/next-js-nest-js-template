import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { APP_TITLE } from 'src/common/constants';

export interface ResetPasswordLinkEmailProps {
  resetLink: string;
  userName?: string;
}

export const ResetPasswordLinkEmail = ({
  resetLink,
  userName = 'there',
}: ResetPasswordLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview children={'Reset your password to continue'} />
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={header}>
            <Text style={logo}>{APP_TITLE}</Text>
            <Text style={tagline}>Secure Access</Text>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Text style={heroTitle}>Password Reset Request</Text>
            <Text style={heroSubtitle}>
              We received a request to reset your password. No worries, it
              happens to everyone!
            </Text>
          </Section>

          {/* Content Section */}
          <Section style={contentSection}>
            <Text style={greetingText}>Hi {userName},</Text>
            <Text style={bodyText}>
              Someone (hopefully you) requested a password reset for your{' '}
              {APP_TITLE} account. Click the button below to create a new
              password. This link is secure and will expire in 10 minutes for
              your protection.
            </Text>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={ctaButton} href={resetLink}>
                Reset Your Password
              </Button>
            </Section>

            <Text style={alternativeText}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={linkText}>{resetLink}</Text>

            <Text style={securityNote}>
              <strong>Security Notice:</strong> If you didn't request this
              password reset, you can safely ignore this email. Your password
              will remain unchanged and your account is secure.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Help Section */}
          <Section style={helpSection}>
            <Text style={helpTitle}>Need Help?</Text>
            <Text style={helpText}>
              If you're having trouble with the button above, or if you have any
              security concerns, please contact our support team immediately.
            </Text>
            <Text style={contactText}>
              📧 Email:{' '}
              <Link href="mailto:support@example.com" style={contactLink}>
                support@example.com
              </Link>
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer Section */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated security message from {APP_TITLE}. Please do
              not reply to this email.
            </Text>
            <Text style={footerSubtext}>
              © 2024 {APP_TITLE}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

ResetPasswordLinkEmail.PreviewProps = {
  resetLink: 'https://example.com/auth/reset-password?token=123456789',
  userName: 'John',
} as ResetPasswordLinkEmailProps;

export default ResetPasswordLinkEmail;

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
const header = {
  backgroundColor: colors.secondary,
  padding: '32px 40px',
  textAlign: 'center' as const,
  borderBottom: `1px solid ${colors.border}`,
};

const logo = {
  color: colors.primary,
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  letterSpacing: '-0.02em',
};

const tagline = {
  color: colors.mutedForeground,
  fontSize: '12px',
  fontWeight: '400',
  margin: '0',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  opacity: '0.8',
};

// Hero section
const heroSection = {
  padding: '40px',
  textAlign: 'center' as const,
};

const heroTitle = {
  color: colors.foreground,
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 16px 0',
  lineHeight: '1.3',
  letterSpacing: '-0.02em',
};

const heroSubtitle = {
  color: colors.mutedForeground,
  fontSize: '16px',
  fontWeight: '400',
  margin: '0',
  lineHeight: '1.6',
};

// Content section
const contentSection = {
  padding: '40px',
};

const greetingText = {
  color: colors.foreground,
  fontSize: '18px',
  fontWeight: '500',
  margin: '0 0 24px 0',
  lineHeight: '1.5',
};

const bodyText = {
  color: colors.foreground,
  fontSize: '16px',
  fontWeight: '400',
  margin: '0 0 32px 0',
  lineHeight: '1.6',
};

// Button section
const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaButton = {
  backgroundColor: colors.primary,
  borderRadius: '8px',
  color: colors.primaryForeground,
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 32px',
  display: 'inline-block',
  border: `1px solid ${colors.border}`,
  minWidth: '200px',
};

const alternativeText = {
  color: colors.mutedForeground,
  fontSize: '14px',
  fontWeight: '400',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
};

const linkText = {
  backgroundColor: colors.accent,
  border: `1px solid ${colors.border}`,
  borderRadius: '6px',
  color: colors.primary,
  fontSize: '12px',
  fontFamily: 'Fira Code, Monaco, "Courier New", monospace',
  padding: '12px',
  margin: '0 0 32px 0',
  wordBreak: 'break-all' as const,
  textAlign: 'center' as const,
};

const securityNote = {
  backgroundColor: colors.muted,
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  color: colors.foreground,
  fontSize: '14px',
  fontWeight: '400',
  padding: '16px',
  margin: '32px 0 0 0',
  lineHeight: '1.5',
};

// Help section
const helpSection = {
  backgroundColor: colors.muted,
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderTop: `1px solid ${colors.border}`,
};

const helpTitle = {
  color: colors.foreground,
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const helpText = {
  color: colors.mutedForeground,
  fontSize: '14px',
  fontWeight: '400',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const contactText = {
  color: colors.mutedForeground,
  fontSize: '14px',
  fontWeight: '400',
  margin: '0',
};

const contactLink = {
  color: colors.primary,
  textDecoration: 'none',
  fontWeight: '500',
};

// Divider (removed as using section borders instead)
const divider = {
  display: 'none',
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
  margin: '0 0 8px 0',
  lineHeight: '1.5',
};

const footerSubtext = {
  color: colors.mutedForeground,
  fontSize: '12px',
  fontWeight: '400',
  margin: '0',
  opacity: '0.7',
};
