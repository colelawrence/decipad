/* eslint decipad/css-prop-named-variable: 0 */
import { useThemeFromStore } from '@decipad/react-contexts';
import { Swatch, swatchesThemed } from '@decipad/ui';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import {
  normalOpacity,
  strongOpacity,
  transparency,
  weakOpacity,
} from '../../primitives';
import { highlight } from '../../styles';

const styles = (baseSwatches: Swatch) => {
  return css(highlight.highlightStyles, {
    borderRadius: '0.9em 0.3em',
    margin: '0 -0.45em',
    padding: '0.15em 0.45em',
    background: 'transparent',
    boxDecorationBreak: 'clone',
    webkitBoxDecorationBreak: 'clone',
    backgroundImage: `linear-gradient(
    to right,
    ${transparency(baseSwatches.Sun, weakOpacity).rgba},
    ${transparency(baseSwatches.Sun, strongOpacity).rgba} 5%,
    ${transparency(baseSwatches.Sun, normalOpacity).rgba}
  )`,
  });
};

interface HighlightProps {
  readonly children: ReactNode;
}
export const Highlight = ({
  children,
}: HighlightProps): ReturnType<React.FC> => {
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);

  return <span css={styles(baseSwatches)}>{children}</span>;
};
