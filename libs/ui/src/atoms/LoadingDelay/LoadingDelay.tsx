import { css, keyframes } from '@emotion/react';
import { FC, ReactNode } from 'react';

interface LoadingDelayProps {
  readonly children: ReactNode;
}

export const LoadingDelay = ({
  children,
}: LoadingDelayProps): ReturnType<FC> => {
  const fadeInAnimation = keyframes`
  0% {
    opacity: 0;
  }
  99% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

  const styles = css({
    opacity: 0,
    animation: `${fadeInAnimation} 1s ease-in`,
  });

  return <div css={styles}>{children}</div>;
};
