/* eslint decipad/css-prop-named-variable: 0 */
import { useThemeFromStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { componentCssVars, transparencyHex } from 'libs/ui/src/primitives';
import { droppablePatternStyles } from 'libs/ui/src/styles/droppablePattern';
import { swatchesThemed } from 'libs/ui/src/utils';

const blockDropAreaStyles = css({
  position: 'fixed',
  background: 'red',
  pointerEvents: 'none',
  border: `2px solid ${componentCssVars('DropLineColor')}`,
  borderRadius: '0.5rem',
});

export interface BlockDropAreaProps {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}

export const BlockDropArea = ({
  xStart,
  xEnd,
  yStart,
  yEnd,
}: BlockDropAreaProps) => {
  const [darkTheme] = useThemeFromStore();
  const { Malibu } = swatchesThemed(darkTheme);

  const droppableStyles = droppablePatternStyles(
    transparencyHex(Malibu.hex, 0.16),
    transparencyHex(Malibu.hex, 0.3)
  );

  return (
    <div
      css={[blockDropAreaStyles, droppableStyles]}
      style={{
        left: xStart,
        width: xEnd - xStart,
        top: yStart,
        height: yEnd - yStart,
      }}
    />
  );
};
