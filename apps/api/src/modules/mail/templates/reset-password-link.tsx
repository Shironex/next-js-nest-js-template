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
          <Section style={logoContainer}>
            <Text style={logoText}>{APP_TITLE}</Text>
          </Section>

          <Section style={heroSection}>
            <Text style={heroText}>Reset Your Password</Text>
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={text}>Hi {userName},</Text>
            <Text style={paragraph}>
              We received a request to reset your password. Click the button
              below to choose a new password. This link will expire in 10
              minutes.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetLink}>
                Reset Password
              </Button>
            </Section>

            <Text style={paragraph}>
              If you didn't request this password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={footerText}>
              Need help? Contact our support team at{' '}
              <Link href="mailto:support@example.com" style={anchor}>
                support@example.com
              </Link>
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

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '5px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  padding: '40px',
  margin: '40px auto',
  maxWidth: '600px',
};

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const logoText = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'center' as const,
};

const heroSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const heroText = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0',
  marginBottom: '8px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
  marginBottom: '16px',
};

const paragraph = {
  color: '#444',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
  marginBottom: '24px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: 'auto',
  transition: 'background-color 0.2s ease',
  ':hover': {
    backgroundColor: '#0056b3',
  },
  padding: '12px 20px',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
};

const anchor = {
  color: '#007bff',
  textDecoration: 'none',
};

const footerText = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
};

export default ResetPasswordLinkEmail;
