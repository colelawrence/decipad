import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar, OpaqueColor, orange500 } from '../../primitives';

const styles = (color: OpaqueColor) =>
  css({
    position: 'relative',
    display: 'contents',

    '::before': {
      position: 'absolute',

      border: `2px solid ${cssVar('backgroundColor')}`,
      borderRadius: '50%',
      width: '10px',
      height: '10px',

      backgroundColor: color.rgb,

      content: '" "',
    },
  });

type DotProps = {
  readonly children: ReactNode;
  readonly top?: number;
  readonly left?: number;
  readonly right?: number;
  readonly bottom?: number;
  readonly color?: OpaqueColor;
};

export const Dot = ({
  children,
  top,
  left,
  right,
  bottom,
  color = orange500,
}: DotProps) => (
  <span
    css={[styles(color), css({ '::before': { top, left, right, bottom } })]}
  >
    {children}
  </span>
);
