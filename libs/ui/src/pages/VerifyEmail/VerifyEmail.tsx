import { css } from '@emotion/react';
import { FC } from 'react';
import { AuthContent } from '../../molecules';
import { cssVar, setCssVar } from '../../primitives';
import { Anchor } from '../../utils';

const wrapperStyles = css({
  height: '100%',
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
        description="We've sent you a login confirmation link to your inbox."
      />

      <Anchor
        href="/"
        css={css({
          marginTop: '48px',
          textDecoration: 'none',
          ...setCssVar('currentTextColor', cssVar('weakTextColor')),
        })}
      >
        Back to login
      </Anchor>
    </div>
  );
};
