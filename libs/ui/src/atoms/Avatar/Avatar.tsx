import { css } from '@emotion/react';
import { FC } from 'react';

import {
  p12Bold,
  purple100,
  shortAnimationDuration,
  transparency,
} from '../../primitives';

const containerStyles = css(p12Bold, {
  aspectRatio: '1 / 1',
  minWidth: '24px',
  minHeight: '24px',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  '@supports not (aspect-ratio: 1 / 1)': {
    position: 'relative',
    paddingBottom: '100%',
    '> *': {
      position: 'absolute',
      top: 0,
      left: 0,
    },
  },
});

const initialBackgroundStyles = (hoverSelector = 'svg:hover') =>
  css({
    transition: `fill ${shortAnimationDuration} ease-in-out`,
    fill: purple100.rgb,
    [`${hoverSelector} &`]: {
      fill: transparency(purple100, 0.65).rgba,
    },
  });
const initialTextStyles = css(p12Bold, {
  dominantBaseline: 'central',
  textAnchor: 'middle',

  textTransform: 'uppercase',
});

interface AvatarProps {
  readonly name: string;
  readonly roundedSquare?: boolean;

  readonly hoverSelector?: string;
}

export const Avatar = ({
  name,
  roundedSquare = false,
  hoverSelector,
}: AvatarProps): ReturnType<FC> => {
  return (
    <div role="img" aria-label={`Avatar of user ${name}`} css={containerStyles}>
      <svg
        css={{
          width: '100%',
          height: '100%',
          borderRadius: roundedSquare ? '8px' : '50%',
        }}
      >
        <rect
          width="100%"
          height="100%"
          css={initialBackgroundStyles(hoverSelector)}
        />
        <text x="50%" y="50%" css={initialTextStyles}>
          {name[0]}
        </text>
      </svg>
    </div>
  );
};
