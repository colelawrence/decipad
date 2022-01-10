import { ComponentProps, ReactNode } from 'react';
import { Number, Placeholder, Shapes, Text, Trash } from '../../icons';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { MenuList } from '../../molecules';
import { noop } from '../../utils';

export type TableCellType =
  | 'string'
  | 'number'
  | 'date/time'
  | 'date/day'
  | 'date/month'
  | 'date/year';

interface TableColumnMenuProps
  extends Pick<ComponentProps<typeof MenuList>, 'open' | 'onChangeOpen'> {
  readonly onChangeColumnType?: (type: TableCellType) => void;
  readonly onRemoveColumn?: () => void;
  readonly trigger: ReactNode;
  readonly type: TableCellType;
}

export const TableColumnMenu: React.FC<TableColumnMenuProps> = ({
  open,
  onChangeOpen,
  onChangeColumnType = noop,
  onRemoveColumn = noop,
  trigger,
  type,
}) => (
  <MenuList
    root
    dropdown
    open={open}
    onChangeOpen={onChangeOpen}
    trigger={trigger}
  >
    <MenuList
      itemTrigger={
        <TriggerMenuItem icon={<Shapes />}>
          <div css={{ minWidth: '132px' }}>Change type</div>
        </TriggerMenuItem>
      }
    >
      <MenuItem
        icon={<Number />}
        onSelect={() => onChangeColumnType('number')}
        selected={type === 'number'}
      >
        Number
      </MenuItem>
      <MenuItem
        icon={<Text />}
        onSelect={() => onChangeColumnType('string')}
        selected={type === 'string'}
      >
        Text
      </MenuItem>
      <MenuList
        itemTrigger={
          <TriggerMenuItem icon={<Placeholder />}>
            <div css={{ minWidth: '116px' }}>Date</div>
          </TriggerMenuItem>
        }
      >
        <MenuItem
          icon={<Placeholder />}
          onSelect={() => onChangeColumnType('date/year')}
          selected={type === 'date/year'}
        >
          Year
        </MenuItem>
        <MenuItem
          icon={<Placeholder />}
          onSelect={() => onChangeColumnType('date/month')}
          selected={type === 'date/month'}
        >
          Month
        </MenuItem>
        <MenuItem
          icon={<Placeholder />}
          onSelect={() => onChangeColumnType('date/day')}
          selected={type === 'date/day'}
        >
          Day
        </MenuItem>
        <MenuItem
          icon={<Placeholder />}
          onSelect={() => onChangeColumnType('date/time')}
          selected={type === 'date/time'}
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
