/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { Deci } from '../../icons';
import { cssVar, setCssVar, p14Regular, p24Medium } from '../../primitives';

const deciLogoWrapper = css({
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  width: '40px',
  height: '40px',
  marginBottom: '10px',
});

const authContentWrapperStyles = css({
  display: 'grid',
  justifyContent: 'center',
  justifyItems: 'center',
  alignContent: 'center',
  gap: '6px',
});

const headingStyles = css(
  p24Medium,
  setCssVar('currentTextColor', cssVar('strongTextColor'))
);

const descriptionStyles = css(p14Regular, {
  color: cssVar('weakTextColor'),
  textAlign: 'center',
});

export interface AuthContentProps {
  title: string;
  description?: string;
}

export const AuthContent = ({
  title,
  description,
}: AuthContentProps): ReturnType<FC> => {
  return (
    <div css={authContentWrapperStyles}>
      <div css={deciLogoWrapper}>
        <Deci />
      </div>
      <h1 css={headingStyles}>{title}</h1>
      {description && <p css={css(descriptionStyles)}>{description}</p>}
    </div>
  );
};
