import { isEnabled } from '@decipad/feature-flags';
import Fraction from '@decipad/fraction';
import { deserializeUnit, stringifyUnits } from '@decipad/computer';
import type { TableCellType } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, ReactNode } from 'react';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import {
  All,
  Calendar,
  CheckboxSelected,
  Formula,
  Leaf,
  Number,
  Shapes,
  Text,
  Trash,
} from '../../icons';
import { MenuList, UnitMenuItem } from '../../molecules';
import {
  getBooleanType,
  getDateType,
  getNumberType,
  getStringType,
  getSeriesType,
} from '../../utils';
import { getFormulaType } from '../../utils/table';

const tableColumnMenuStyles = css({
  marginLeft: 'auto',
});

interface TableColumnMenuProps
  extends Pick<ComponentProps<typeof MenuList>, 'open' | 'onChangeOpen'>,
    Pick<ComponentProps<typeof UnitMenuItem>, 'parseUnit'> {
  readonly onChangeColumnType?: (type: TableCellType) => void;
  readonly onRemoveColumn?: () => void;
  readonly isFirst?: boolean;
  readonly trigger: ReactNode;
  readonly type: TableCellType;
}

export const TableColumnMenu: React.FC<TableColumnMenuProps> = ({
  open,
  onChangeOpen,
  onChangeColumnType = noop,
  onRemoveColumn = noop,
  parseUnit,
  isFirst = false,
  trigger,
  type,
}) => (
  <div contentEditable={false} css={tableColumnMenuStyles}>
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
        {!isFirst && isEnabled('FORMULA_COLUMNS') && (
          <MenuItem
            icon={<Formula />}
            onSelect={() => onChangeColumnType(getFormulaType())}
            selected={type.kind === 'table-formula'}
          >
            Formula
          </MenuItem>
        )}
        <MenuItem
          icon={<CheckboxSelected />}
          onSelect={() => onChangeColumnType(getBooleanType())}
          selected={type.kind === 'boolean'}
        >
          Checkbox
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
        {isEnabled('TABLE_COLUMN_SERIES') && (
          <MenuList
            itemTrigger={
              <TriggerMenuItem icon={<Leaf />}>
                <div css={{ minWidth: '116px' }}>Series</div>
              </TriggerMenuItem>
            }
          >
            <MenuItem
              icon={<Calendar />}
              onSelect={() => onChangeColumnType(getSeriesType('date'))}
              selected={type.kind === 'series' && type.seriesType === 'date'}
            >
              Date
            </MenuItem>
          </MenuList>
        )}
      </MenuList>
      <MenuItem icon={<Trash />} onSelect={() => onRemoveColumn()}>
        Remove column
      </MenuItem>
    </MenuList>
  </div>
);
