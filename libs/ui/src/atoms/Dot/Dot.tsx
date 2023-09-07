/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import {
  black,
  cssVar,
  OpaqueColor,
  orange500,
  transparency,
  weakOpacity,
} from '../../primitives';

const styles = (
  color: OpaqueColor,
  size: number,
  variant: boolean,
  noBorder: boolean,
  position: 'absolute' | 'relative',
  square: boolean,
  transform: boolean,
  strokeColor?: OpaqueColor
) => {
  // we should go through these status dots and refactor for consistency
  // currently it has too many props and is not clear what they do
  const stroke = strokeColor
    ? strokeColor.hex
    : noBorder
    ? 'transparent'
    : variant
    ? transparency(black, 0.2).rgba
    : cssVar('backgroundMain');
  const strokeWidth = variant ? '1.11px' : '2px';
  return css({
    position,
    display: position === 'absolute' ? 'contents' : 'inline-flex',

    '::before': {
      position,
      border: `${strokeWidth} solid ${stroke}`,
      transform: transform ? 'translate(2px, -2.5px) rotate(10deg)' : 'none',
      borderRadius: square ? '4px' : '50%',
      width: size,
      height: size,

      backgroundColor: transform
        ? transparency(color, weakOpacity).rgba
        : color.hex,

      content: '" "',
    },
  });
};

type DotProps = {
  readonly children?: ReactNode;
  readonly position?: 'absolute' | 'relative';
  readonly top?: number;
  readonly left?: number;
  readonly right?: number;
  readonly bottom?: number;
  readonly size?: number;
  readonly variant?: boolean;
  readonly noBorder?: boolean;
  readonly square?: boolean;
  readonly visible?: boolean;
  readonly drunkMode?: boolean;
  readonly color?: OpaqueColor;
  readonly strokeColor?: OpaqueColor;
};

export const Dot = ({
  position = 'absolute',
  top,
  left,
  right,
  bottom,
  size = 10,
  variant = false,
  noBorder = false,
  color = orange500,
  visible = true,
  square = false,
  drunkMode = false,
  strokeColor,
  children,
}: DotProps) => {
  const elem = (
    <span
      css={[
        styles(
          color,
          size,
          variant,
          noBorder,
          position,
          square,
          false,
          strokeColor
        ),
        !visible && css({ '::before': { opacity: 0 } }),
        css({ '::before': { top, left, right, bottom } }),
      ]}
    >
      {children}
    </span>
  );
  return drunkMode ? (
    <span
      css={css({
        transform: 'translate(0, -6px)',
      })}
    >
      <span
        css={[
          styles(color, size, variant, noBorder, position, square, true),
          !visible && css({ '::before': { opacity: 0 } }),
          css({ '::before': { top, left, right, bottom } }),
        ]}
      >
        {children}
      </span>
      {elem}
    </span>
  ) : (
    elem
  );
};
