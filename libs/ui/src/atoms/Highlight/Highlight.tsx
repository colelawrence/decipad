import { useThemeFromStore } from '@decipad/react-contexts';
import { AvailableSwatchColor, Swatch, swatchesThemed } from '@decipad/ui';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import {
  normalOpacity,
  strongOpacity,
  transparency,
  weakOpacity,
} from '../../primitives';
import { highlight } from '../../styles';

const styles = (color: AvailableSwatchColor, baseSwatches: Swatch) => {
  return css(highlight.highlightStyles, {
    borderRadius: '0.9em 0.3em',
    margin: '0 -0.45em',
    padding: '0.15em 0.45em',
    background: 'transparent',
    boxDecorationBreak: 'clone',
    webkitBoxDecorationBreak: 'clone',
    backgroundImage: `linear-gradient(
    to right,
    ${transparency(baseSwatches[color], weakOpacity).rgba},
    ${transparency(baseSwatches[color], strongOpacity).rgba} 5%,
    ${transparency(baseSwatches[color], normalOpacity).rgba}
  )`,
  });
};

interface HighlightProps {
  readonly children: ReactNode;
  readonly color?: AvailableSwatchColor;
}
export const Highlight = ({
  children,
  color = 'Sun',
}: HighlightProps): ReturnType<React.FC> => {
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);
  return <span css={styles(color, baseSwatches)}>{children}</span>;
};
