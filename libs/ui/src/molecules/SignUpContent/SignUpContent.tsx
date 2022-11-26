import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p13Regular, p13Bold } from '../../primitives';

const signupContentWrapperStyles = css({
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
});

const signupTeaserWrapperStyles = css({
  width: '100%',
  textAlign: 'center',
  marginTop: '0.5rem',
});

const teaserStyles = css(p13Regular, {
  color: cssVar('weakTextColor'),
});

const joinStyles = css(p13Bold, {
  marginTop: '0.25rem',
  color: cssVar('normalTextColor'),
});

export const SignUpContent: FC = () => {
  return (
    <div css={signupContentWrapperStyles}>
      <div css={signupTeaserWrapperStyles}>
        <p css={teaserStyles}>
          No account?{' '}
          <a
            css={joinStyles}
            href="https://rcagp49qi5w.typeform.com/to/JUOinTMW"
          >
            Join our private beta waitlist
          </a>
        </p>
      </div>
    </div>
  );
};
