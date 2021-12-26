import { css } from '@emotion/react';
import { FC } from 'react';
import { Deci } from '../../icons';
import { cssVar, p16Regular, p24Bold, setCssVar } from '../../primitives';

const deciLogoWrapper = css({
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  width: '60px',
  height: '60px',
  background:
    'linear-gradient(145.97deg, #C1FA6B 10.08%, rgba(207, 253, 136, 0.8) 75.32%, #AFF548 94.81%)',
  borderRadius: '12px',
  padding: '12px',
  marginBottom: '24px',
});

const headingStyles = css(
  p24Bold,
  setCssVar('currentTextColor', cssVar('strongTextColor')),
  {
    paddingBottom: '6px',
  }
);

export interface AuthContentProps {
  title: string;
  description: string;
}

export const AuthContent = ({
  title,
  description,
}: AuthContentProps): ReturnType<FC> => {
  return (
    <>
      <div css={deciLogoWrapper}>
        <Deci />
      </div>
      <h1 css={headingStyles}>{title}</h1>
      <p css={css(p16Regular)}>{description}</p>
    </>
  );
};
