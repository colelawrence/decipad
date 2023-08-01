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
  square: boolean,
  transform: boolean,
  strokeColor?: OpaqueColor
) => {
  const stroke = strokeColor
    ? strokeColor.hex
    : variant
    ? transparency(black, 0.3).rgba
    : cssVar('backgroundMain');
  const strokeWidth = variant ? '1.11px' : '2px';
  return css({
    position: 'absolute',
    display: 'contents',

    '::before': {
      position: 'absolute',

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
  readonly top?: number;
  readonly left?: number;
  readonly right?: number;
  readonly bottom?: number;
  readonly size?: number;
  readonly variant?: boolean;
  readonly square?: boolean;
  readonly visible?: boolean;
  readonly drunkMode?: boolean;
  readonly color?: OpaqueColor;
  readonly strokeColor?: OpaqueColor;
};

export const Dot = ({
  top,
  left,
  right,
  bottom,
  size = 10,
  variant = false,
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
        styles(color, size, variant, square, false, strokeColor),
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
          styles(color, size, variant, square, true),
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
