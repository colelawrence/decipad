import { css } from '@emotion/react';
import { FC } from 'react';
import { Button } from '../../atoms';
import { AuthContent, SignUpConditionsContent } from '../../molecules';
import { cssVar, setCssVar } from '../../primitives';
import { LoginBox } from '../../organisms';

const buttonWrapperStyles = css({
  width: '100%',
  marginTop: '12px',
  textDecoration: 'none',
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
});

export const VerifyEmail = ({ email }: { email: string }): ReturnType<FC> => {
  return (
    <LoginBox>
      <AuthContent
        title="Check your inbox!"
        description={`Open the link sent to ${email}. No email? Check spam folder.`}
      />
      <div css={buttonWrapperStyles}>
        <Button type="primary" href="https://decipad.com">
          Go back to website
        </Button>
      </div>

      <SignUpConditionsContent />
    </LoginBox>
  );
};
