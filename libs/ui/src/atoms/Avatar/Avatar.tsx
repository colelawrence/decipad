import { css } from '@emotion/react';
import { FC } from 'react';

import {
  p12Bold,
  purple100,
  shortAnimationDuration,
  transparency,
} from '../../primitives';

const containerStyles = css(p12Bold, {
  width: '100%',
  height: '100%',
  minWidth: '24px',
  minHeight: '24px',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const initialStyles = css(p12Bold, {
  aspectRatio: '1 / 1',
});
const initialBackgroundStyles = (hoverSelector?: string) =>
  css({
    transition: `fill ${shortAnimationDuration} ease-in-out`,
    fill: purple100.rgb,
    [hoverSelector === undefined ? ':hover' : `${hoverSelector} &`]: {
      fill: transparency(purple100, 0.65).rgba,
    },
  });
const initialTextStyles = css({
  dominantBaseline: 'central',
  textAnchor: 'middle',

  textTransform: 'uppercase',
});

interface AvatarProps {
  readonly userName: string;
  readonly roundedSquare?: boolean;

  readonly hoverSelector?: string;
}

export const Avatar = ({
  userName,
  roundedSquare = false,
  hoverSelector,
}: AvatarProps): ReturnType<FC> => {
  return (
    <div
      role="img"
      aria-label={`Avatar of user ${userName}`}
      css={containerStyles}
    >
      <svg
        css={[initialStyles, { borderRadius: roundedSquare ? '8px' : '50%' }]}
      >
        <rect
          width="100%"
          height="100%"
          css={initialBackgroundStyles(hoverSelector)}
        />
        <text x="50%" y="50%" css={initialTextStyles}>
          {userName[0]}
        </text>
      </svg>
    </div>
  );
};
