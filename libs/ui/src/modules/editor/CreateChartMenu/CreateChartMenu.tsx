import { markTypes } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { FC, PropsWithChildren } from 'react';
import { BarChart } from '../../../icons';
import { MenuItem, MenuList, TextAndIconButton } from '../../../shared';
import { hideOnPrint } from '../../../styles/editor-layout';
import { markTypeIcons, markTypeNames } from '../PlotParams/types';

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
          <BarChart />
        </TextAndIconButton>
      </button>
    }
  >
    {markTypes.map((mark) => {
      return (
        <MenuItem
          key={mark}
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
