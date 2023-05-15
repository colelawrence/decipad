import { useThemeFromStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC } from 'react';
import * as icons from '../../icons';
import { cssVar, offBlack, setCssVar, transparency } from '../../primitives';
import { AvailableSwatchColor, swatchesThemed, UserIconKey } from '../../utils';

export interface NotebookIconProps {
  readonly icon: UserIconKey;
  readonly color?: AvailableSwatchColor;
}

export const NotebookIcon = ({
  icon,
  color = 'Catskill',
}: NotebookIconProps): ReturnType<FC> => {
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);
  const Icon = icons[icon];

  return (
    <div
      css={[notebookIconStyles, { backgroundColor: baseSwatches[color].hex }]}
    >
      <Icon />
    </div>
  );
};

const notebookIconStyles = css({
  gridArea: 'icon',
  height: '32px',
  width: '32px',
  cursor: 'move',

  display: 'grid',
  placeItems: 'center',
  justifyContent: 'center',
  alignContent: 'center',
  gridTemplateColumns: '18px',

  '> svg': {
    height: '18px',
    width: '18px',
  },

  borderRadius: '4px',
  backgroundColor: cssVar('backgroundColor'),
  ...setCssVar('currentTextColor', cssVar('iconColorDark')),

  boxShadow: `0px 2px 24px -4px ${transparency(offBlack, 0.08).rgba}`,
});
