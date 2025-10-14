import { css } from '@emotion/react';
import { FC } from 'react';
import { Button } from '../../shared';
import { AuthContent, SignUpConditionsContent, LoginBox } from '../../modules';
import { cssVar, p12Regular } from '../../primitives';

const buttonWrapperStyles = css({
  width: '100%',
  marginTop: '12px',
  textDecoration: 'none',
});

const devMessageStyles = css(p12Regular, {
  padding: '12px',
  marginTop: '16px',
  borderRadius: '8px',
  backgroundColor: cssVar('surfaceRaised'),
  color: cssVar('textSubdued'),
  textAlign: 'center',
  fontFamily: 'monospace',
});

export interface VerifyEmailProps {
  email: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const VerifyEmail = ({ email }: VerifyEmailProps): ReturnType<FC> => {
  return (
    <LoginBox>
      <AuthContent
        title="Check your inbox!"
        description={`Open the link sent to ${email}. No email? Check spam folder.`}
      />
      
      {isDevelopment && (
        <div css={devMessageStyles}>
          <strong>Development Mode:</strong> The magic link is logged to the backend console.
          <br />
          Look for "validation link:" in your terminal output.
        </div>
      )}

      <div css={buttonWrapperStyles}>
        <Button type="primary" href="https://decipad.com">
          Go back to website
        </Button>
      </div>

      <SignUpConditionsContent />
    </LoginBox>
  );
};
