/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import * as icons from '../../icons';
import { cssVar, mediumShadow, useThemeColor } from '../../primitives';
import { AvailableSwatchColor } from '../../utils';
import { UserIconKey } from '@decipad/editor-types';

export interface NotebookIconProps {
  readonly icon: UserIconKey;
  readonly color?: AvailableSwatchColor;
}

export const NotebookIcon = ({
  icon,
  color = 'Catskill',
}: NotebookIconProps): ReturnType<FC> => {
  const Icon = icons[icon];
  const theme = useThemeColor(color);

  return (
    <div
      css={[
        notebookIconStyles,
        {
          backgroundColor:
            color !== 'Catskill'
              ? theme.Background.Default
              : cssVar('backgroundHeavy'),
        },
      ]}
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
  backgroundColor: cssVar('backgroundMain'),

  boxShadow: `0px 2px 24px -4px ${mediumShadow.rgba}`,
});
