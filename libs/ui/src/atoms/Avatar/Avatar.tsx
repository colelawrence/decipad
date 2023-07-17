/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import md5 from 'md5';
import { ComponentProps, FC } from 'react';
import Gravatar from 'react-gravatar';
import {
  OpaqueColor,
  cssVar,
  grey200,
  p12Medium,
  shortAnimationDuration,
  transparency,
} from '../../primitives';
import { avatarColor } from '../../utils';

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
  fontSize: '1.2em',
});

type AvatarProps = {
  readonly name: string;
  readonly email?: string;
  readonly roundedSquare?: boolean;
  readonly hoverSelector?: string;
  readonly greyedOut?: boolean;
  readonly cursorColor?: OpaqueColor;
  readonly variant?: boolean;
  readonly title?: string;
  readonly onClick?: () => void;
  readonly useSecondLetter?: boolean;
  readonly gravatarBackdrop?:
    | ComponentProps<typeof Gravatar>['default']
    | 'robohash';
};

const DEFAULT_WORD = 'Abacus';

export const Avatar = ({
  name,
  email = 'thisemaildoesnthaveagravatar@n1n.co',
  roundedSquare = false,
  hoverSelector,
  greyedOut = false,
  cursorColor,
  variant = false,
  onClick,
  title,
  useSecondLetter = true,
  gravatarBackdrop = 'blank',
}: AvatarProps): ReturnType<FC> => {
  const selectedWord =
    name ||
    (email !== 'thisemaildoesnthaveagravatar@n1n.co' && email) ||
    DEFAULT_WORD;
  const firstLetter = selectedWord?.[0]?.toUpperCase();
  const secondLetter = selectedWord?.[1]?.toLocaleLowerCase() || '';
  const color = avatarColor(name);

  return (
    <div
      role="img"
      aria-label={title ?? `Avatar of user ${name}`}
      css={containerStyles(variant)}
      onClick={onClick}
    >
      <div css={{ display: 'flex', height: '100%', width: '100%' }}>
        <div
          data-testid={'avatar-img'}
          css={[
            { width: '100%', borderRadius: roundedSquare ? '8px' : '50%' },
            variant && {
              border: `1px solid ${cssVar('borderColor')}`,
            },
            cursorColor && {
              borderRadius: '50%',
              boxShadow: `0 0 0 2px ${cursorColor.hex}`,
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
                color,
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
              {gravatarBackdrop === 'blank' && firstLetter}
              {gravatarBackdrop === 'blank' &&
                useSecondLetter &&
                secondLetter !== '@' &&
                secondLetter}
            </text>
          </svg>
        </div>
      </div>
      <div css={{ position: 'absolute' }}>
        <Gravatar
          md5={md5(email, { encoding: 'binary' })}
          style={{ borderRadius: roundedSquare ? '8px' : '50%', zIndex: 2 }}
          default={gravatarBackdrop as any} // bug in type definitions, robohash is allowed see https://en.gravatar.com/site/implement/images/#default-image
        />
      </div>
    </div>
  );
};
