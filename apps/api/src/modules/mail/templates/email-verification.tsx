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
        children={`Verify your email address to complete your {APP_TITLE} registration`}
      />
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={title}>{APP_TITLE}</Text>
            <Hr style={hr} />
            <Text style={text}>Hi,</Text>
            <Text style={paragraph}>
              Thank you for choosing <Link style={anchor}>{APP_TITLE}</Link>!
              We&apos;re thrilled to have you on board. To complete your
              registration, please verify your account by using the following
              code:
            </Text>
            <Text style={codePlaceholder}>{code}</Text>
            <Hr style={hr} />
            <Text style={text}>
              If you have any questions or need assistance, feel free to reach
              out. Hope you learn something new with us!
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
  color: '#525f7f',

  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
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

const codePlaceholder = {
  backgroundColor: '#fbfbfb',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
  color: '#1c1c1c',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'flex',
  justifyContent: 'center',
  width: '210px',
  padding: '14px 7px',
};
