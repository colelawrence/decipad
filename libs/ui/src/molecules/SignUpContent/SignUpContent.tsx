import { css } from '@emotion/react';
import { FC } from 'react';
import { ContentSeparator } from '../../atoms';
import { cssVar, p13Regular, p14Medium } from '../../primitives';

const signupContentWrapperStyles = css({
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
});

const signupTeaserWrapperStyles = css({
  width: '100%',
  marginTop: '1rem',
  textAlign: 'center',
});

const teaserStyles = css(p13Regular, {
  color: cssVar('weakTextColor'),
});

const joinStyles = css(p14Medium, {
  fontWeight: 'bold',
  marginTop: '0.25rem',
});

export const SignUpContent: FC = () => {
  return (
    <div css={signupContentWrapperStyles}>
      <ContentSeparator />
      <div css={signupTeaserWrapperStyles}>
        <p css={teaserStyles}>Don't have an account?</p>
        <p css={joinStyles}>
          <a href="https://rcagp49qi5w.typeform.com/to/i8uXYEtd">
            Join our private beta waitlist
          </a>
        </p>
      </div>
    </div>
  );
};
