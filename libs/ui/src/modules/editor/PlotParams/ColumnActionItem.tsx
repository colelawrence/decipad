import { List } from 'libs/ui/src/icons';
import { MenuItem } from 'libs/ui/src/shared';
import {
  buttonInMenuStyles,
  chartMenuButtonStyles,
  constMenuMinWidth,
  menuItemWithIconOnEnd,
} from './styles';
import { ColumnActionBaseButton, ColumnActionItemProps } from './types';

export const ColumnActionItem = ({
  columnNames,
  onSelect,
  testIdPrefix = 'column-action-item',
  preventDefault = true,
  getButtons,
}: ColumnActionItemProps) => {
  const handleClick = (
    event: React.MouseEvent,
    button: ColumnActionBaseButton
  ) => {
    preventDefault && event.preventDefault();
    typeof button.onSelect === 'function' && button.onSelect();
  };

  return (
    <>
      {columnNames.map((columnNameOption) => {
        const buttons = getButtons(columnNameOption);
        return (
          <MenuItem
            key={columnNameOption}
            onSelect={(ev) => {
              ev.preventDefault();
              onSelect && onSelect();
            }}
            icon={<List />}
            data-testid={`${testIdPrefix}__${columnNameOption}`}
          >
            <div css={menuItemWithIconOnEnd}>
              <div css={constMenuMinWidth}>{columnNameOption} 𝑦</div>
              <div css={chartMenuButtonStyles}>
                {buttons.map((button, index) => {
                  if (button.type === 'simple') {
                    return (
                      <div
                        key={`simple-${index}`}
                        onClick={(event) => handleClick(event, button)}
                        css={buttonInMenuStyles}
                      >
                        {button.icon}
                      </div>
                    );
                  }
                  if (button.type === 'combo') {
                    const isSelected = button.selected;
                    const selectedButton =
                      button.options.find(
                        (option) => option.label === isSelected
                      ) || button.options?.[0];
                    return (
                      <div
                        key={`submenu-${index}`}
                        onClick={(event) => handleClick(event, selectedButton)}
                        css={buttonInMenuStyles}
                      >
                        {selectedButton.icon}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </MenuItem>
        );
      })}
    </>
  );
};
