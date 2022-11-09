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
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  boxShadow: `0px 2px 16px ${cssVar('highlightColor')}`,
  borderRadius: '8px',
});

const outerWrapperStyles = css({
  display: 'grid',
  justifyContent: 'center',
  justifyItems: 'center',
  alignContent: 'center',
});

const wrapperStyles = css({
  display: 'grid',
  width: '440px',
  gridTemplateColumns: 'min(400px, 100%)',

  justifyContent: 'center',
  justifyItems: 'center',
  alignContent: 'center',
  gridGap: '12px',

  padding: '24px 12px',
});

export const VerifyEmail = (): ReturnType<FC> => {
  return (
    <div css={outerWrapperStyles}>
      <div css={[wrapperStyles, outerBorderStyles]}>
        <AuthContent
          title="Check your inbox!"
          description="We've sent you an email with a confirmation link"
        />

        <div css={buttonWrapperStyles}>
          <Button href="/">Back to log in</Button>
        </div>
      </div>
    </div>
  );
};
