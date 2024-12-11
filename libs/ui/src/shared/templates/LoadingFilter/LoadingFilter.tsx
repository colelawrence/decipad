/* eslint decipad/css-prop-named-variable: 0 */
import { css, keyframes } from '@emotion/react';
import { FC, ReactNode } from 'react';

const loadingKeyframes = keyframes`
  0% {
    opacity: 1;
  }
  40% {
    opacity: 0.25;
  }
  60% {
    opacity: 0.75;
  }
  80% {
    opacity: 0.25;
  }
  100% {
    opacity: 1;
  }
`;

const loadingStyles = css({
  animation: `${loadingKeyframes} linear 1.5s infinite`,
});

const loadingStylesWithWidth = css(loadingStyles, {
  width: '100%',
  height: '100%',
});

const contents = css({ display: 'contents' });

export const LoadingFilter: FC<{
  children: ReactNode;
  loading: boolean;
  variant?: 'default' | 'fullWidth';
}> = ({ children, loading, variant = 'default' }) => {
  if (!loading) return <div css={contents}>{children}</div>;
  switch (variant) {
    case 'default':
      return <div css={loadingStyles}>{children}</div>;
    case 'fullWidth':
      return <div css={loadingStylesWithWidth}>{children}</div>;
  }
};
