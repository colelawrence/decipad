import { ComponentProps, ReactNode } from 'react';
import { deserializeUnit, stringifyUnits } from '@decipad/language';
import Fraction from '@decipad/fraction';
import { noop } from '@decipad/utils';
import { All, Number, Calendar, Shapes, Text, Trash } from '../../icons';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { MenuList, UnitMenuItem } from '../../molecules';
import { getDateType, getNumberType, getStringType } from '../../utils';
import { TableCellType } from '../../types';

interface TableColumnMenuProps
  extends Pick<ComponentProps<typeof MenuList>, 'open' | 'onChangeOpen'>,
    Pick<ComponentProps<typeof UnitMenuItem>, 'parseUnit'> {
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
  parseUnit,
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
      <UnitMenuItem
        onSelect={(unit) => {
          onChangeColumnType({ kind: 'number', unit });
        }}
        parseUnit={parseUnit}
      />
      {type.kind === 'number' && type.unit != null && (
        <MenuItem icon={<All />} selected>
          {stringifyUnits(deserializeUnit(type.unit), new Fraction(1))}
        </MenuItem>
      )}
      <MenuItem
        icon={<Number />}
        onSelect={() => onChangeColumnType(getNumberType())}
        selected={type.kind === 'number' && type.unit == null}
      >
        Number
      </MenuItem>
      <MenuItem
        icon={<Text />}
        onSelect={() => onChangeColumnType(getStringType())}
        selected={type.kind === 'string'}
      >
        Text
      </MenuItem>
      <MenuList
        itemTrigger={
          <TriggerMenuItem icon={<Calendar />}>
            <div css={{ minWidth: '116px' }}>Date</div>
          </TriggerMenuItem>
        }
      >
        <MenuItem
          icon={<Calendar />}
          onSelect={() => onChangeColumnType(getDateType('year'))}
          selected={type.kind === 'date' && type.date === 'year'}
        >
          Year
        </MenuItem>
        <MenuItem
          icon={<Calendar />}
          onSelect={() => onChangeColumnType(getDateType('month'))}
          selected={type.kind === 'date' && type.date === 'month'}
        >
          Month
        </MenuItem>
        <MenuItem
          icon={<Calendar />}
          onSelect={() => onChangeColumnType(getDateType('day'))}
          selected={type.kind === 'date' && type.date === 'day'}
        >
          Day
        </MenuItem>
        <MenuItem
          icon={<Calendar />}
          onSelect={() => onChangeColumnType(getDateType('minute'))}
          selected={type.kind === 'date' && type.date === 'minute'}
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
