import { Button } from '@react-email/button';
import { Container } from '@react-email/container';
import { Head } from '@react-email/head';
import { Hr } from '@react-email/hr';
import { Html } from '@react-email/html';
import { Img } from '@react-email/img';
import { Link } from '@react-email/link';
import { Preview } from '@react-email/preview';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';

type GenericInviteProps = {
  resourceType: string;
  resourceName: string;
  resourceUrl: string;

  inviterName: string;
  inviterEmail?: string;
  inviteeName: string;
  inviteeEmail?: string;
};

const serviceName = 'Decipad';

export default function GenericInvite({
  inviterName,
  inviterEmail,
  inviteeName,
  resourceType,
  resourceName,
  resourceUrl,
}: GenericInviteProps) {
  const preview = `Join ${inviterName} on ${serviceName}`;

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Section style={main}>
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              .button {
                color: #161f2c;
                background-color: #c1fa6b;
              }
            }
          `}
        </style>
        <Container style={container}>
          <Section style={{ marginTop: '32px' }}>
            <Img
              src="https://user-images.githubusercontent.com/12210180/209393578-9c5e655d-bb5b-4098-9ddd-99dbead69e6e.png"
              alt="Decipad"
              style={logo}
              height={42}
              width={42}
            />
          </Section>
          <Text style={h1}>
            Join <strong>{resourceName}</strong> on <strong>Decipad</strong>
          </Text>
          <Text style={text}>Hello {inviteeName},</Text>
          <Text style={text}>
            Your friend,{' '}
            <Inviter inviterEmail={inviterEmail} inviterName={inviterEmail} />{' '}
            has invited you to the <strong>{resourceName}</strong> on{' '}
            <strong>{serviceName}</strong>.
          </Text>
          <Section style={{ textAlign: 'center' }}>
            <Button
              pX={20}
              pY={12}
              style={btn}
              href={resourceUrl}
              className="button"
            >
              View the {resourceType}
            </Button>
          </Section>
          <Text style={text}>
            <br />
            or copy and paste this URL into your browser:{' '}
            <Link
              href={resourceUrl}
              target="_blank"
              style={link}
              rel="noreferrer"
            >
              {resourceUrl}
            </Link>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This invitation was intended for{' '}
            <span style={black}>{inviteeName}</span>. If you were not expecting
            this invitation, you can ignore this email.
          </Text>
        </Container>
      </Section>
    </Html>
  );
}

const Inviter: React.FC<{ inviterName?: string; inviterEmail?: string }> = ({
  inviterName,
  inviterEmail,
}) => {
  const inviterHasRealName = inviterName !== inviterEmail;

  const inviterEmailEl = (
    <Link href={`mailto:${inviterEmail}`} style={link}>
      {inviterEmail}
    </Link>
  );

  if (!inviterHasRealName) {
    return inviterEmailEl;
  }

  return (
    <>
      <strong>{inviterName}</strong> ({inviterEmail && inviterEmailEl})
    </>
  );
};

const main: React.CSSProperties = {
  backgroundColor: '#f5f7Fa',
  margin: '0 auto',
  padding: 0,
};

const container = {
  backgroundColor: '#fff',
  borderRadius: '24px',
  margin: '40px auto',
  padding: '20px',
  width: '465px',
};

const logo: React.CSSProperties = {
  display: 'block',
  margin: '0 auto',
};

const h1 = {
  color: '#000',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '24px',
  fontWeight: 'normal',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
};

const link: React.CSSProperties = {
  color: '#067df7',
  textDecoration: 'none',
  wordWrap: 'break-word',
};

const text = {
  color: '#323B49',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  lineHeight: '24px',
};

const black = {
  color: 'black',
};

const btn = {
  backgroundColor: '#c1fa6b',
  borderRadius: '6px',
  color: '#161f2c',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '16px',
  fontWeight: 500,
  lineHeight: '40px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const hr = {
  border: 'none',
  borderTop: '1px solid #eaeaea',
  margin: '26px 0',
  width: '100%',
};

const footer = {
  color: '#666666',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  lineHeight: '24px',
};
