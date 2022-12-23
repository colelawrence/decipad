import { css } from '@emotion/react';
import md5 from 'md5';
import { FC } from 'react';
import Gravatar from 'react-gravatar';
import {
  cssVar,
  grey200,
  OpaqueColor,
  p12Medium,
  purple300,
  shortAnimationDuration,
  transparency,
} from '../../primitives';

const containerStyles = (variant: boolean) =>
  css([
    p12Medium,
    variant && { cursor: 'pointer' },
    {
      aspectRatio: '1 / 1',
      minWidth: '28px',
      minHeight: '28px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',

      '@supports not (aspect-ratio: 1 / 1)': {
        position: 'relative',
        paddingBottom: '100%',
        '> *': {
          position: 'absolute',
          top: 0,
          left: 0,
        },
      },
    },
  ]);

const baseColors = [purple300];

interface InitialBackgroundStylesProps {
  color: OpaqueColor;
  greyedOut: boolean;
  variant: boolean;
  hoverSelector?: string;
}

const initialBackgroundStyles = ({
  color,
  greyedOut,
  variant,
  hoverSelector,
}: InitialBackgroundStylesProps) => {
  return css({
    transition: `fill ${shortAnimationDuration} ease-in-out`,
    fill: variant
      ? cssVar('backgroundColor')
      : greyedOut
      ? grey200.rgb
      : color.rgb,
    [`${hoverSelector} &`]: {
      fill: transparency(greyedOut ? grey200 : color, 0.65).rgba,
    },
  });
};

const initialTextStyles = css({
  dominantBaseline: 'central',
  textAnchor: 'middle',
  textTransform: 'uppercase',
  fontSize: '1.2em',
});

interface AvatarProps {
  readonly name: string;
  readonly email?: string;
  readonly roundedSquare?: boolean;
  readonly hoverSelector?: string;
  readonly greyedOut?: boolean;
  readonly backgroundColor?: OpaqueColor;
  readonly variant?: boolean;
  readonly title?: string;
}

export const Avatar = ({
  name,
  email = 'thisemaildoesnthaveagravatar@n1n.co',
  roundedSquare = false,
  hoverSelector,
  greyedOut = false,
  backgroundColor,
  variant = false,
  title,
}: AvatarProps): ReturnType<FC> => {
  const hashString = name
    .split('')
    .map((c: string) => c.charCodeAt(0))
    .reduce((a: number, b: number) => a + b, 0);
  const avatarColor =
    backgroundColor ?? baseColors[hashString % baseColors.length];
  return (
    <div
      role="img"
      aria-label={title ?? `Avatar of user ${name[0]}`}
      css={containerStyles(variant)}
    >
      <div css={{ display: 'flex', height: '100%', width: '100%' }}>
        <div
          css={[
            { width: '100%', borderRadius: roundedSquare ? '8px' : '50%' },
            variant && {
              border: `1px solid ${cssVar('borderColor')}`,
            },
          ]}
        >
          <svg
            css={{
              width: '100%',
              height: '100%',
              borderRadius: roundedSquare ? '8px' : '50%',
              zIndex: 1,
            }}
          >
            <rect
              width="100"
              height="100"
              css={initialBackgroundStyles({
                color: avatarColor,
                greyedOut,
                variant,
                hoverSelector,
              })}
            />
            <text
              x="50%"
              y="50%"
              css={css([
                p12Medium,
                initialTextStyles,
                variant
                  ? { fill: cssVar('currentTextColor') }
                  : { fill: cssVar('iconColorDark') },
              ])}
            >
              {name[0]}
            </text>
          </svg>
        </div>
      </div>
      <div css={{ position: 'absolute' }}>
        <Gravatar
          md5={md5(email, { encoding: 'binary' })}
          style={{ borderRadius: roundedSquare ? '8px' : '50%', zIndex: 2 }}
          default={'blank'}
        />
      </div>
    </div>
  );
};
