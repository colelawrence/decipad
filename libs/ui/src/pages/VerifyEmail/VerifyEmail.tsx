import { css } from '@emotion/react';
import { FC } from 'react';
import { AuthContent } from '../../molecules';
import { cssVar, setCssVar } from '../../primitives';
import { Anchor } from '../../utils';

const wrapperStyles = css({
  display: 'grid',
  justifyContent: 'center',
  justifyItems: 'center',
  alignContent: 'center',
});

export const VerifyEmail = (): ReturnType<FC> => {
  return (
    <div css={wrapperStyles}>
      <AuthContent
        title="Check your email"
        description="We've sent you a log in confirmation link to your inbox."
      />

      <Anchor
        href="/"
        css={css({
          marginTop: '48px',
          textDecoration: 'none',
          ...setCssVar('currentTextColor', cssVar('weakTextColor')),
        })}
      >
        Back to log in
      </Anchor>
    </div>
  );
};
