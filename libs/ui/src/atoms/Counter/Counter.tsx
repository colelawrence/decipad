import { css } from '@emotion/react';
import {
  black,
  normalOpacity,
  OpaqueColor,
  strongOpacity,
  transparency,
  weakOpacity,
} from '../../primitives';

const counterWrapperStyles = (
  color: string | OpaqueColor | undefined,
  variant: boolean
) =>
  css({
    padding: '4px 6px',
    aspectRatio: '1 / 1',
    background: color
      ? typeof color === 'string'
        ? color
        : transparency(color, variant ? normalOpacity : weakOpacity).rgba
      : transparency(black, weakOpacity).rgba,
    color: transparency(black, variant ? normalOpacity : strongOpacity).rgba,
    borderRadius: '6px',
  });

interface CounterProps {
  readonly n: number;
  readonly color?: OpaqueColor | string;
  readonly variant?: boolean;
}

export const Counter: React.FC<CounterProps> = ({
  n,
  color,
  variant = false,
}) => {
  return <span css={counterWrapperStyles(color, variant)}>{n}</span>;
};
