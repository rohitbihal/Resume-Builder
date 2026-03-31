import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export default function ReceiptEmail({ customerName = "Valued Customer", amount = "9.99", plan = "Pro" }) {
  return (
    <Html>
      <Head />
      <Preview>Your CreativeResume Receipt</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
        <Container style={{ margin: '0 auto', padding: '20px 0 48px', width: '580px' }}>
          <Heading style={{ fontSize: '24px', lineHeight: '1.3', fontWeight: '700', color: '#00B8A9' }}>
            CreativeResume
          </Heading>
          <Text style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}>
            Hi {customerName},
          </Text>
          <Text style={{ fontSize: '16px', lineHeight: '24px', color: '#555' }}>
            Thank you for your purchase! We successfully received your payment for the <strong>{plan}</strong> plan.
          </Text>
          <Section style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', margin: '24px 0' }}>
            <Text style={{ fontSize: '14px', margin: '0' }}>Plan: {plan}</Text>
            <Text style={{ fontSize: '14px', margin: '5px 0 0', fontWeight: 'bold' }}>Total Paid: ${amount}</Text>
          </Section>
          <Text style={{ fontSize: '14px', color: '#888' }}>
            If you have any questions about your account or need support building the perfect resume, simply reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
