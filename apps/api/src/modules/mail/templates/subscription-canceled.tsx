import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from '@react-email/components';

interface SubscriptionCanceledEmailProps {
  username: string;
}

export const SubscriptionCanceledEmail = ({
  username = 'User',
}: SubscriptionCanceledEmailProps) => (
  <Html>
    <Head />
    <Preview children="Your subscription has been canceled" />
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Heading style={heading}>Subscription Canceled</Heading>
          <Text style={text}>Hi {username},</Text>
          <Text style={text}>
            We're sorry to see you go! Your subscription has been successfully
            canceled.
          </Text>
          <Text style={text}>
            You will continue to have access to premium features until the end
            of your current billing period. After that, your account will revert
            to the free plan.
          </Text>
          <Text style={text}>
            If you change your mind, you can resubscribe at any time from your
            account settings.
          </Text>
          <Text style={text}>
            If you have any feedback about why you canceled, we'd love to hear
            from you. Please feel free to reply to this email.
          </Text>
          <Text style={footer}>Thank you for being a valued customer.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default SubscriptionCanceledEmail;

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
  color: '#1f2937',
  marginBottom: '24px',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '16px',
};

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
};
