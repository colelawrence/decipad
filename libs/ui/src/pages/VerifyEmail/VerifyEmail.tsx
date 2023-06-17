/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { Button } from '../../atoms';
import { AuthContent } from '../../molecules';
import { cssVar, setCssVar } from '../../primitives';

const buttonWrapperStyles = css({
  width: '100%',
  marginTop: '12px',
  textDecoration: 'none',
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
});

const outerBorderStyles = css({
  border: `1px solid ${cssVar('borderColor')}`,
  boxShadow: `0px 2px 16px ${cssVar('highlightColor')}`,
  borderRadius: '8px',
});

const outerWrapperStyles = css({
  display: 'grid',
  justifyItems: 'center',
  alignContent: 'center',

  padding: '16px',
});

const wrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '440px',

  gridGap: '12px',

  padding: '24px 12px',
});

export const VerifyEmail = ({ email }: { email: string }): ReturnType<FC> => {
  return (
    <div css={outerWrapperStyles}>
      <div
        data-testid="login-instructions"
        css={[wrapperStyles, outerBorderStyles]}
      >
        <AuthContent
          title="Check your inbox!"
          description={`Open the link sent to ${email}`}
        />
        <div css={buttonWrapperStyles}>
          <Button href="/">Back to log in</Button>
        </div>
      </div>
    </div>
  );
};
