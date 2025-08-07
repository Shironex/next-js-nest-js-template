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
          <Section>
            <Text style={title}>{APP_TITLE}</Text>
            <Hr style={hr} />
            <Text style={text}>Hi {username},</Text>
            <Text style={paragraph}>
              We detected {loginAttempts} consecutive failed login attempts on
              your <Link style={anchor}>{APP_TITLE}</Link> account. For your
              security, we've temporarily locked your account.
            </Text>
            <Text style={warningBox}>
              🔒 Your account will be automatically unlocked on{' '}
              <strong>{formatDate(lockedUntil)}</strong>
            </Text>
            <Text style={paragraph}>
              <strong>What you can do:</strong>
            </Text>
            <Text style={bulletPoint}>
              • Wait until the lockout period expires and try logging in again
            </Text>
            <Text style={bulletPoint}>
              • If you forgot your password, you can reset it after the lockout
              expires
            </Text>
            <Text style={bulletPoint}>
              • Make sure you're using the correct email and password
              combination
            </Text>
            <Hr style={hr} />
            <Text style={paragraph}>
              <strong>Didn't try to log in?</strong>
            </Text>
            <Text style={text}>
              If you didn't attempt to log in, someone may be trying to access
              your account. Please consider changing your password once the
              lockout expires and review your account security settings.
            </Text>
            <Hr style={hr} />
            <Text style={text}>
              If you continue to have trouble accessing your account or have any
              security concerns, please contact our support team.
            </Text>
            <Text style={footer}>
              This is an automated security notification from {APP_TITLE}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

AccountLockedEmail.PreviewProps = {
  username: 'artlover2024',
  lockedUntil: new Date(Date.now() + 3600000), // 1 hour from now
  loginAttempts: 5,
} as AccountLockedEmailProps;

export default AccountLockedEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
};

const text = {
  fontSize: '16px',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
};

const paragraph = {
  ...text,
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  marginBottom: '16px',
};

const bulletPoint = {
  ...text,
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '20px',
  marginLeft: '16px',
  marginBottom: '8px',
};

const anchor = {
  color: '#556cd6',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const title = {
  ...text,
  fontSize: '22px',
  fontWeight: '700',
  lineHeight: '32px',
};

const warningBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '4px',
  color: '#856404',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '14px',
  padding: '12px 16px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const footer = {
  ...text,
  fontSize: '12px',
  color: '#8898aa',
  marginTop: '24px',
};
