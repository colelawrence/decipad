/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { rotation } from '../../primitives';

interface AnimatedIconProps {
  readonly icon: ReactNode;
  readonly size?: 'fit' | 'normal';
  readonly animated: boolean;
}

export const AnimatedIcon: FC<AnimatedIconProps> = ({
  icon,
  size = 'normal',
  animated = false,
}) => {
  return (
    <span
      css={[
        iconStyles(size),
        animated && {
          svg: {
            animationName: rotation,
            animationDuration: '1s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            animationPlayState: 'running',
          },
        },
      ]}
    >
      {icon}
    </span>
  );
};

const iconStyles = (size: 'fit' | 'normal') =>
  css([
    {
      width: '12px',
    },
    size === 'normal' && {
      width: '16px',
    },
  ]);
