import { useThemeFromStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import {
  black,
  normalOpacity,
  OpaqueColor,
  strongOpacity,
  transparency,
  weakOpacity,
  white,
} from '../../primitives';

const counterWrapperStyles = (
  color: string | OpaqueColor | undefined,
  variant: boolean,
  darkTheme: boolean
) =>
  css({
    padding: '4px 6px',
    aspectRatio: '1 / 1',
    background: color
      ? typeof color === 'string'
        ? color
        : transparency(color, variant ? normalOpacity : weakOpacity).rgba
      : transparency(darkTheme ? black : white, normalOpacity).rgba,
    color: transparency(
      darkTheme ? white : black,
      variant ? normalOpacity : strongOpacity
    ).rgba,
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
  const [darkTheme] = useThemeFromStore();
  return <span css={counterWrapperStyles(color, variant, darkTheme)}>{n}</span>;
};
