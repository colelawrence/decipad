import { css } from '@emotion/react';
import { FC, PropsWithChildren } from 'react';
import { MenuItem, TextAndIconButton, MenuList } from '../../../shared';
import {
  markTypeIcons,
  markTypeNames,
  markTypes,
  shapes,
} from '../PlotParams/PlotParams';
import { hideOnPrint } from '../../../styles/editor-layout';
import { Plot } from '../../../icons';

type CreateChartMenuProps = PropsWithChildren<{
  onAddChartViewButtonPress: (_type: typeof markTypes[number]) => void;
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
          <Plot />
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
