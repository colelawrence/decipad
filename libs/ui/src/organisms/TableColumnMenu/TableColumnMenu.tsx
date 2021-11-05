import { css } from '@emotion/react';
import { Caret, Number, Placeholder, Shapes, Text } from '../../icons';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { MenuList } from '../../molecules';
import { noop } from '../../utils';

const iconWrapperStyles = css({
  display: 'grid',
  height: '16px',
  width: '16px',
});

type TableCellType =
  | 'string'
  | 'number'
  | 'date/time'
  | 'date/day'
  | 'date/month'
  | 'date/year';

interface TableColumnMenuProps {
  onChangeColumnType?: (type: TableCellType) => void;
}

export const TableColumnMenu: React.FC<TableColumnMenuProps> = ({
  onChangeColumnType = noop,
}) => (
  <MenuList
    trigger={
      <span css={iconWrapperStyles}>
        <Caret variant="down" />
      </span>
    }
  >
    <MenuList
      trigger={<TriggerMenuItem icon={<Shapes />}>Change type</TriggerMenuItem>}
    >
      <MenuItem icon={<Number />} onSelect={() => onChangeColumnType('number')}>
        Number
      </MenuItem>
      <MenuItem icon={<Text />} onSelect={() => onChangeColumnType('string')}>
        Text
      </MenuItem>
      <MenuList
        trigger={<TriggerMenuItem icon={<Placeholder />}>Date</TriggerMenuItem>}
      >
        <MenuItem
          icon={<Placeholder />}
          onSelect={() => onChangeColumnType('date/year')}
        >
          Year
        </MenuItem>
        <MenuItem
          icon={<Placeholder />}
          onSelect={() => onChangeColumnType('date/month')}
        >
          Month
        </MenuItem>
        <MenuItem
          icon={<Placeholder />}
          onSelect={() => onChangeColumnType('date/day')}
        >
          Day
        </MenuItem>
        <MenuItem
          icon={<Placeholder />}
          onSelect={() => onChangeColumnType('date/time')}
        >
          Time
        </MenuItem>
      </MenuList>
    </MenuList>
  </MenuList>
);
