import { css } from '@emotion/react';
import { FC } from 'react';
import { cssVar, p12Regular } from '../../primitives';

const conditionLinksWrapperStyles = css(p12Regular, {
  marginTop: '10px',
  padding: '0 32px',
  textAlign: 'center',
  fontSize: '75%',
  color: cssVar('weakerTextColor'),

  lineHeight: 1.36,
});

const linkStyles = css({
  textDecoration: 'underline',
});

export const SignUpConditionsContent: FC = () => {
  return (
    <div css={conditionLinksWrapperStyles}>
      <>By submitting this form, you agree to our </>
      <a target="_blank" css={linkStyles} href="/docs/terms">
        Terms of Service
      </a>
      <> and </>
      <a target="_blank" css={linkStyles} href="/docs/privacy">
        Privacy Policy
      </a>
    </div>
  );
};
