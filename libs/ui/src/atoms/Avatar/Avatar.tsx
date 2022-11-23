import { css } from '@emotion/react';
import { FC } from 'react';
import {
  grey200,
  p12Bold,
  purple300,
  shortAnimationDuration,
  transparency,
} from '../../primitives';

const containerStyles = css(p12Bold, {
  aspectRatio: '1 / 1',
  minWidth: '28px',
  minHeight: '28px',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'default',

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

const initialBackgroundStyles = (
  // eslint-disable-next-line default-param-last
  hoverSelector = 'svg:hover',
  greyedOut: boolean
) =>
  css({
    transition: `fill ${shortAnimationDuration} ease-in-out`,
    fill: greyedOut ? grey200.rgb : purple300.rgb,
    [`${hoverSelector} &`]: {
      fill: transparency(greyedOut ? grey200 : purple300, 0.65).rgba,
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
  readonly greyedOut?: boolean;
}

export const Avatar = ({
  name,
  roundedSquare = false,
  hoverSelector,
  greyedOut = false,
}: AvatarProps): ReturnType<FC> => {
  return (
    <div
      role="img"
      aria-label={`Avatar of user ${name[0]}`}
      css={containerStyles}
    >
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
          css={initialBackgroundStyles(hoverSelector, greyedOut)}
        />
        <text x="50%" y="50%" css={initialTextStyles}>
          {name[0]}
        </text>
      </svg>
    </div>
  );
};
