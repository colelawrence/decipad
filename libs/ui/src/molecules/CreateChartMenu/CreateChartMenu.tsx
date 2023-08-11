import { icons } from '@decipad/ui';
import { css } from '@emotion/react';
import { FC, PropsWithChildren } from 'react';
import { MenuItem, TextAndIconButton } from '../../atoms';
import {
  markTypeIcons,
  markTypeNames,
  markTypes,
  shapes,
} from '../../organisms/PlotParams/PlotParams';
import { hideOnPrint } from '../../styles/editor-layout';
import { MenuList } from '../MenuList/MenuList';

type CreateChartMenuProps = PropsWithChildren<{
  onAddChartViewButtonPress: (type: typeof markTypes[number]) => void;
}>;

export const CreateChartMenu: FC<CreateChartMenuProps> = ({
  onAddChartViewButtonPress,
}) => (
  <MenuList
    root
    dropdown
    trigger={
      <button data-testid="create-chart-from-table-button" css={buttonStyles}>
        <TextAndIconButton text="Chart" iconPosition="left">
          <icons.Plot />
        </TextAndIconButton>
      </button>
    }
  >
    {markTypes.map((mark) => {
      const type = shapes.includes(mark) ? 'point' : mark;

      return (
        <MenuItem
          key={type}
          onSelect={() => {
            onAddChartViewButtonPress(mark);
          }}
          icon={markTypeIcons[mark]}
        >
          <div css={minWidthChartMenu} data-testid={`create-chart:${mark}`}>
            {markTypeNames[mark]}
          </div>
        </MenuItem>
      );
    })}
  </MenuList>
);

const minWidthChartMenu = css({ minWidth: '160px' });

const buttonStyles = css(hideOnPrint, {
  height: '100%',
});
