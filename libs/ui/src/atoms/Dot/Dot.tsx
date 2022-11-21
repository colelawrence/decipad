import { css } from '@emotion/react';
import { ReactNode } from 'react';
import {
  black,
  cssVar,
  OpaqueColor,
  orange500,
  transparency,
} from '../../primitives';

const styles = (color: OpaqueColor, size: number, variant: boolean) => {
  const stroke = variant
    ? transparency(black, 0.3).rgba
    : cssVar('backgroundColor');
  const strokeWidth = variant ? '1.11px' : '2px';
  return css({
    position: 'relative',
    display: 'contents',

    '::before': {
      position: 'absolute',

      border: `${strokeWidth} solid ${stroke}`,
      borderRadius: '50%',
      width: size,
      height: size,

      backgroundColor: color.rgb,

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
  readonly visible?: boolean;
  readonly color?: OpaqueColor;
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
  children,
}: DotProps) => (
  <span
    css={[
      styles(color, size, variant),
      !visible && css({ '::before': { opacity: 0 } }),
      css({ '::before': { top, left, right, bottom } }),
    ]}
  >
    {children}
  </span>
);
