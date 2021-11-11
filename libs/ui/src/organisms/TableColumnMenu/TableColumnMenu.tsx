import { css } from '@emotion/react';
import { ComponentProps } from 'react';
import { grey400 } from '../../primitives';
import { Caret, Number, Placeholder, Shapes, Text, Trash } from '../../icons';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { MenuList } from '../../molecules';
import { noop } from '../../utils';

const buttonStyles = css({
  cursor: 'pointer',
  display: 'flex',
  padding: '4px',

  '&:focus': {
    borderRadius: '6px',
    boxShadow: `0 0 0 1.5px ${grey400.rgb}`,
  },
});

const iconWrapperStyles = css({
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

interface TableColumnMenuProps
  extends Pick<ComponentProps<typeof MenuList>, 'onOpenChange'> {
  readonly onChangeColumnType?: (type: TableCellType) => void;
  readonly onRemoveColumn?: () => void;
}

export const TableColumnMenu: React.FC<TableColumnMenuProps> = ({
  onChangeColumnType = noop,
  onOpenChange,
  onRemoveColumn = noop,
}) => (
  <MenuList
    onOpenChange={onOpenChange}
    trigger={
      <button css={buttonStyles}>
        <span css={iconWrapperStyles}>
          <Caret variant="down" />
        </span>
      </button>
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
    <MenuItem icon={<Trash />} onSelect={() => onRemoveColumn()}>
      Remove column
    </MenuItem>
  </MenuList>
);
