import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PaymentFailedEmailProps {
  username: string;
  updatePaymentUrl: string;
}

export const PaymentFailedEmail = ({
  username = 'User',
  updatePaymentUrl = 'https://example.com/account',
}: PaymentFailedEmailProps) => (
  <Html>
    <Head />
    <Preview children="Action required: Payment failed" />
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={heading}>Payment Failed</Heading>
          <Text style={text}>Hi {username},</Text>
          <Text style={text}>
            We were unable to process your recent payment for your subscription.
            This could be due to an expired card, insufficient funds, or other
            payment issues.
          </Text>
          <Text style={text}>
            To keep your subscription active and continue enjoying premium
            features, please update your payment method as soon as possible.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={updatePaymentUrl}>
              Update Payment Method
            </Button>
          </Section>
          <Text style={text}>
            If you need any assistance or have questions about your
            subscription, please don't hesitate to contact our support team.
          </Text>
          <Text style={footer}>
            Thank you for your prompt attention to this matter.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default PaymentFailedEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const box = {
  padding: '0 48px',
};

const heading = {
  fontSize: '32px',
  fontWeight: '300',
  color: '#dc2626',
  marginBottom: '24px',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '16px',
};

const buttonContainer = {
  marginTop: '24px',
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
};
