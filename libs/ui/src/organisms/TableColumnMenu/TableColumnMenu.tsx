import { ComponentProps, ReactNode, useState } from 'react';
import { css } from '@emotion/react';
import { ONE, N } from '@decipad/number';
import type {
  CellValueType,
  ColumnMenuDropdown,
  TableCellType,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { useComputer, useEditorTableContext } from '@decipad/react-contexts';
import { Unit, currencyUnits, UnitOfMeasure } from '@decipad/computer';
import { isFlagEnabled } from '@decipad/feature-flags';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import {
  AddToWorkspace,
  All,
  Calendar,
  CheckboxSelected,
  DollarCircle,
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
import {} from '@decipad/language';

const tableColumnMenuStyles = css({
  marginLeft: 'auto',
  mixBlendMode: 'luminosity',
});

const presentableCurrencyUnits = currencyUnits.filter((f) => {
  return !!f.pretty && f.pretty.length <= 3;
});

type ExpandableColumns = 'currency' | 'date' | 'series' | 'dropdowns' | null;

interface TableColumnMenuProps
  extends Pick<ComponentProps<typeof MenuList>, 'open' | 'onChangeOpen'>,
    Pick<ComponentProps<typeof UnitMenuItem>, 'parseUnit'> {
  readonly onChangeColumnType?: (type: TableCellType) => void;
  readonly onRemoveColumn?: () => void;
  readonly isFirst?: boolean;
  readonly isReadOnly?: boolean;
  readonly trigger: ReactNode;
  readonly type: CellValueType;
  readonly isForImportedColumn?: boolean;
  readonly dropdownNames?: ColumnMenuDropdown[];
}

const isCurrencyUnit = (unit?: Unit[]): boolean => {
  return (
    (unit && unit.length === 1 && unit[0].baseSuperQuantity === 'currency') ||
    false
  );
};

const sameUnits = (
  unit: Unit[] | null | undefined,
  um: UnitOfMeasure
): boolean => {
  if (!unit || unit.length !== 1) {
    return false;
  }
  const u = unit[0];
  return (
    u.unit === um.name &&
    N(u.exp).equals(ONE) &&
    N(u.multiplier).equals(ONE) &&
    u.baseSuperQuantity === um.superBaseQuantity
  );
};

export const TableColumnMenu: React.FC<TableColumnMenuProps> = ({
  open,
  onChangeOpen,
  onChangeColumnType = noop,
  onRemoveColumn = noop,
  parseUnit,
  isFirst = false,
  trigger,
  type,
  isForImportedColumn = false,
  dropdownNames = [],
}) => {
  const computer = useComputer();

  const editorTableContext = useEditorTableContext();
  const { length } = editorTableContext.cellTypes;

  const [currentOpen, setCurrentOpen] = useState<ExpandableColumns>(null);
  const onColumnExpand = (current: ExpandableColumns) => {
    if (current === currentOpen) {
      setCurrentOpen(null);
    } else {
      setCurrentOpen(current);
    }
  };

  return (
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
          {type.kind === 'number' &&
            type.unit != null &&
            !isCurrencyUnit(type.unit) && (
              <MenuItem icon={<All />} selected>
                {computer.formatUnit(type.unit, N(1))}
              </MenuItem>
            )}
          <MenuItem
            icon={<Number />}
            onSelect={() => onChangeColumnType(getNumberType())}
            selected={type.kind === 'number' && type.unit == null}
          >
            Number
          </MenuItem>
          <MenuList
            itemTrigger={
              <TriggerMenuItem icon={<DollarCircle />}>
                <div css={{ minWidth: '132px' }}>Currency</div>
              </TriggerMenuItem>
            }
            open={currentOpen === 'currency'}
            onChangeOpen={() => onColumnExpand('currency')}
          >
            {presentableCurrencyUnits.map((unit, index) => (
              <MenuItem
                key={index}
                icon={<span>{unit.pretty ?? unit.name}</span>}
                onSelect={() =>
                  onChangeColumnType(
                    getNumberType([
                      {
                        exp: ONE,
                        multiplier: ONE,
                        known: true,
                        unit: unit.name,
                        baseSuperQuantity: unit.superBaseQuantity,
                        baseQuantity: unit.name as Unit['baseQuantity'],
                      },
                    ])
                  )
                }
                selected={type.kind === 'number' && sameUnits(type.unit, unit)}
                itemAlignment="center"
              >
                <span css={{ marginLeft: '2px' }}>{unit.baseQuantity}</span>
              </MenuItem>
            ))}
          </MenuList>

          {!isForImportedColumn && !isFirst && (
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

          {!isFirst &&
            isFlagEnabled('DROPDOWN_TABLES') &&
            dropdownNames.length > 0 && (
              <MenuList
                itemTrigger={
                  <TriggerMenuItem
                    icon={<AddToWorkspace />}
                    selected={type.kind === 'date'}
                  >
                    <div css={{ minWidth: '116px' }}>Categories</div>
                  </TriggerMenuItem>
                }
                open={currentOpen === 'dropdowns'}
                onChangeOpen={() => onColumnExpand('dropdowns')}
              >
                {dropdownNames.map((d) => (
                  <MenuItem
                    icon={<AddToWorkspace />}
                    onSelect={() =>
                      onChangeColumnType({
                        kind: 'dropdown',
                        id: d.id,
                        type: d.type,
                      })
                    }
                    selected={false}
                  >
                    {d.value}
                  </MenuItem>
                ))}
              </MenuList>
            )}
          <MenuList
            itemTrigger={
              <TriggerMenuItem
                icon={<Calendar />}
                selected={type.kind === 'date'}
              >
                <div css={{ minWidth: '116px' }}>Date</div>
              </TriggerMenuItem>
            }
            open={currentOpen === 'date'}
            onChangeOpen={() => onColumnExpand('date')}
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
          {!isForImportedColumn && (
            <MenuList
              itemTrigger={
                <TriggerMenuItem
                  icon={<Leaf />}
                  selected={type.kind === 'series'}
                >
                  <div css={{ minWidth: '116px' }}>Series</div>
                </TriggerMenuItem>
              }
              open={currentOpen === 'series'}
              onChangeOpen={() => onColumnExpand('series')}
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
          <UnitMenuItem
            placeholder="create custom"
            onSelect={(unit) => {
              onChangeColumnType({ kind: 'number', unit });
            }}
            parseUnit={parseUnit}
          />
        </MenuList>
        {length > 1 ? (
          <MenuItem icon={<Trash />} onSelect={() => onRemoveColumn()}>
            Delete column
          </MenuItem>
        ) : null}
      </MenuList>
    </div>
  );
};
