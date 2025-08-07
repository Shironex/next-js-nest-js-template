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

export interface AccountLockedEmailProps {
  username: string;
  lockedUntil: Date;
  loginAttempts: number;
}

export const AccountLockedEmail: React.FC<AccountLockedEmailProps> = ({
  username,
  lockedUntil,
  loginAttempts,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  return (
    <Html>
      <Head />
      <Preview
        children={`Your ${APP_TITLE} account has been temporarily locked due to multiple failed login attempts`}
      />
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={header}>
            <Text style={logo}>{APP_TITLE}</Text>
            <Text style={tagline}>Account Security</Text>
          </Section>

          {/* Alert Section */}
          <Section style={alertSection}>
            <Text style={alertIcon}>🔒</Text>
            <Text style={alertTitle}>Account Temporarily Locked</Text>
            <Text style={alertSubtitle}>
              We've detected suspicious activity and have secured your account
            </Text>
          </Section>

          {/* Content Section */}
          <Section style={contentSection}>
            <Text style={greetingText}>Hi {username},</Text>
            <Text style={bodyText}>
              We detected{' '}
              <strong>{loginAttempts} consecutive failed login attempts</strong>{' '}
              on your{' '}
              <Link href="#" style={brandLink}>
                {APP_TITLE}
              </Link>{' '}
              account. As a security measure, we've temporarily locked your
              account to protect it from unauthorized access.
            </Text>

            {/* Lockout Details */}
            <Section style={lockoutBox}>
              <Text style={lockoutTitle}>Account Status</Text>
              <Text style={lockoutDetail}>
                <strong>Locked Until:</strong> {formatDate(lockedUntil)}
              </Text>
              <Text style={lockoutDetail}>
                <strong>Failed Attempts:</strong> {loginAttempts}
              </Text>
              <Text style={lockoutNote}>
                Your account will be automatically unlocked at the time shown
                above.
              </Text>
            </Section>

            {/* Actions Section */}
            <Text style={sectionTitle}>What You Can Do</Text>
            <Section style={actionsList}>
              <Text style={actionItem}>
                ✓ <strong>Wait for automatic unlock</strong> - Your account will
                be available again at the specified time
              </Text>
              <Text style={actionItem}>
                ✓ <strong>Reset your password</strong> - Use the password reset
                feature after the lockout expires
              </Text>
              <Text style={actionItem}>
                ✓ <strong>Verify your credentials</strong> - Ensure you're using
                the correct email and password
              </Text>
              <Text style={actionItem}>
                ✓ <strong>Check for typos</strong> - Make sure caps lock is off
                and check for spelling errors
              </Text>
            </Section>

            <Hr style={divider} />

            {/* Security Alert */}
            <Section style={securitySection}>
              <Text style={securityTitle}>🚨 Didn't try to log in?</Text>
              <Text style={securityText}>
                If you didn't attempt to access your account, this could
                indicate that someone is trying to gain unauthorized access. We
                recommend:
              </Text>
              <Text style={securityRecommendation}>
                • <strong>Change your password immediately</strong> after the
                lockout expires
              </Text>
              <Text style={securityRecommendation}>
                • <strong>Review your account security settings</strong> and
                enable two-factor authentication
              </Text>
              <Text style={securityRecommendation}>
                • <strong>Check your recent login activity</strong> for any
                suspicious sessions
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Support Section */}
          <Section style={supportSection}>
            <Text style={supportTitle}>Need Immediate Help?</Text>
            <Text style={supportText}>
              If you continue to have trouble accessing your account or have
              urgent security concerns, our support team is here to help.
            </Text>
            <Text style={contactText}>
              📧 Email:{' '}
              <Link href="mailto:support@example.com" style={contactLink}>
                support@example.com
              </Link>
            </Text>
            <Text style={supportNote}>
              Please include your username and details about the issue when
              contacting support.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer Section */}
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated security notification from {APP_TITLE}. We
              take your account security seriously and appreciate your
              understanding.
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

AccountLockedEmail.PreviewProps = {
  username: 'john.doe',
  lockedUntil: new Date(Date.now() + 3600000), // 1 hour from now
  loginAttempts: 5,
} as AccountLockedEmailProps;

export default AccountLockedEmail;

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
  warning: '#F59E0B',
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

// Header section (security alert)
const header = {
  backgroundColor: colors.destructive,
  padding: '32px 40px',
  textAlign: 'center' as const,
  borderBottom: `1px solid ${colors.border}`,
};

const logo = {
  color: '#FFFFFF',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  letterSpacing: '-0.02em',
};

const tagline = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '12px',
  fontWeight: '400',
  margin: '0',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
};

// Alert section
const alertSection = {
  padding: '40px',
  textAlign: 'center' as const,
};

const alertIcon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
};

const alertTitle = {
  color: colors.foreground,
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 16px 0',
  lineHeight: '1.3',
  letterSpacing: '-0.02em',
};

const alertSubtitle = {
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

const brandLink = {
  color: colors.primary,
  textDecoration: 'none',
  fontWeight: '600',
};

// Lockout details box
const lockoutBox = {
  backgroundColor: colors.accent,
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  padding: '24px',
  margin: '0 0 32px 0',
  textAlign: 'center' as const,
};

const lockoutTitle = {
  color: colors.primary,
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const lockoutDetail = {
  color: colors.foreground,
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 8px 0',
};

const lockoutNote = {
  color: colors.mutedForeground,
  fontSize: '14px',
  fontWeight: '400',
  margin: '12px 0 0 0',
  fontStyle: 'italic',
};

// Actions section
const sectionTitle = {
  color: colors.foreground,
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px 0',
};

const actionsList = {
  margin: '0 0 32px 0',
};

const actionItem = {
  color: colors.foreground,
  fontSize: '16px',
  fontWeight: '400',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
  paddingLeft: '8px',
};

// Security section
const securitySection = {
  backgroundColor: colors.muted,
  border: `1px solid ${colors.destructive}`,
  borderRadius: '8px',
  padding: '24px',
  margin: '0',
};

const securityTitle = {
  color: colors.foreground,
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const securityText = {
  color: colors.foreground,
  fontSize: '16px',
  fontWeight: '400',
  margin: '0 0 16px 0',
  lineHeight: '1.5',
};

const securityRecommendation = {
  color: colors.foreground,
  fontSize: '15px',
  fontWeight: '400',
  margin: '0 0 8px 0',
  lineHeight: '1.5',
  paddingLeft: '8px',
};

// Divider (removed as using section borders instead)
const divider = {
  display: 'none',
};

// Support section
const supportSection = {
  backgroundColor: colors.muted,
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderTop: `1px solid ${colors.border}`,
};

const supportTitle = {
  color: colors.foreground,
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const supportText = {
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
  margin: '0 0 12px 0',
};

const contactLink = {
  color: colors.primary,
  textDecoration: 'none',
  fontWeight: '500',
};

const supportNote = {
  color: colors.mutedForeground,
  fontSize: '13px',
  fontWeight: '400',
  margin: '0',
  fontStyle: 'italic',
  opacity: '0.8',
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
