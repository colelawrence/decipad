import { css } from '@emotion/react';
import { FC } from 'react';
import { Deci } from '../../icons';
import {
  cssVar,
  brand500,
  brand400,
  setCssVar,
  transparency,
  p14Regular,
  p24Medium,
} from '../../primitives';

const deciLogoWrapper = css({
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  width: '60px',
  height: '60px',
  background: `linear-gradient(145.97deg, ${brand500.rgb} 10.08%, ${
    transparency(brand400, 0.8).rgba
  } 75.32%, ${brand500.rgb} 94.81%)`,
  borderRadius: '12px',
  padding: '12px',
  marginBottom: '16px',
});

const authContentWrapperStyles = css({
  display: 'grid',
  justifyContent: 'center',
  justifyItems: 'center',
  alignContent: 'center',
});

const headingStyles = css(
  p24Medium,
  setCssVar('currentTextColor', cssVar('strongTextColor')),
  {
    paddingBottom: '6px',
    textAlign: 'center',
  }
);

const descriptionStyles = css(p14Regular, {
  color: cssVar('weakTextColor'),
  textAlign: 'center',
});

export interface AuthContentProps {
  title: string;
  description: string;
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
      <p css={css(descriptionStyles)}>{description}</p>
    </div>
  );
};
