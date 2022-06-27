import { keyframes } from '@emotion/react';
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

export const LoadingFilter: FC<{ children: ReactNode; loading: boolean }> = ({
  children,
  loading,
}) => {
  return (
    <div
      css={
        loading && {
          animation: `${loadingKeyframes} linear 1.5s infinite`,
        }
      }
    >
      {children}
    </div>
  );
};
