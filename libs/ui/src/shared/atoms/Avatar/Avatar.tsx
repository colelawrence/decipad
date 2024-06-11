/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ComponentProps, FC, useCallback, useMemo } from 'react';
import Gravatar from 'react-gravatar';
import {
  cssVar,
  grey200,
  p10Medium,
  p12Medium,
  p13Medium,
  shortAnimationDuration,
  transparency,
} from '../../../primitives';
import { OpaqueColor } from '@decipad/utils';
import { avatarColor } from '../../../utils';

const containerStyles = (variant: boolean, size: number) =>
  css([
    p12Medium,
    variant && { cursor: 'pointer' },
    {
      aspectRatio: '1 / 1',
      minWidth: size,
      minHeight: size,
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
      ? cssVar('backgroundMain')
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
  color: cssVar('textDefault'),
});

type AvatarProps = {
  readonly name: string;
  readonly roundedSquare?: boolean;
  readonly hoverSelector?: string;
  readonly greyedOut?: boolean;
  readonly cursorColor?: string | null;
  readonly variant?: boolean;
  readonly title?: string;
  readonly onClick?: () => void;
  readonly useSecondLetter?: boolean;
  readonly gravatarBackdrop?:
    | ComponentProps<typeof Gravatar>['default']
    | 'robohash';
  readonly imageHash?: string | null;
  readonly size?: number;
};

const DEFAULT_WORD = 'Abacus';

const getTextSize = (size: number) => {
  if (size < 24) {
    return p10Medium;
  }
  if (size < 32) {
    return p12Medium;
  }
  return p13Medium;
};

export const Avatar = ({
  name,
  roundedSquare = false,
  hoverSelector,
  greyedOut = false,
  cursorColor,
  variant = false,
  onClick,
  title,
  useSecondLetter = true,
  gravatarBackdrop = 'blank',
  imageHash,
  size = 28,
}: AvatarProps): ReturnType<FC> => {
  const selectedWord = name || DEFAULT_WORD;

  const getDisplayName = useCallback((input: string, count: 1 | 2): string => {
    const regex =
      count === 1
        ? /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|.{1})/u
        : /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}|.{1,2})/u;
    const match = input.match(regex);

    return match ? match[0].toLocaleUpperCase() : '';
  }, []);

  const displayName = useMemo(() => {
    return getDisplayName(selectedWord, useSecondLetter ? 2 : 1);
  }, [selectedWord, useSecondLetter, getDisplayName]);

  const color = avatarColor(name);

  return (
    <div
      role="img"
      aria-label={title ?? `Avatar of user ${name}`}
      css={containerStyles(variant, size)}
      onClick={onClick}
    >
      <div css={{ display: 'flex', height: '100%', width: '100%' }}>
        <div
          data-testid={'avatar-img'}
          css={[
            { width: '100%', borderRadius: roundedSquare ? '8px' : '50%' },
            variant && {
              border: `1px solid ${cssVar('borderSubdued')}`,
            },
            cursorColor && {
              borderRadius: '50%',
              boxShadow: `0 0 0 2px ${cursorColor}`,
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
            <text x="50%" y="50%" css={[getTextSize(size), initialTextStyles]}>
              {gravatarBackdrop === 'blank' && displayName}
            </text>
          </svg>
        </div>
      </div>
      <div css={{ position: 'absolute' }}>
        {imageHash && (
          <Gravatar
            md5={imageHash}
            style={{ borderRadius: roundedSquare ? '8px' : '50%', zIndex: 2 }}
            default={gravatarBackdrop as any} // bug in type definitions, robohash is allowed see https://en.gravatar.com/site/implement/images/#default-image
          />
        )}
      </div>
    </div>
  );
};
