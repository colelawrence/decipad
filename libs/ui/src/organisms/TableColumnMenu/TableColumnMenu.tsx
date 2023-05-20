import { currencyUnits, Unit, UnitOfMeasure } from '@decipad/computer';
import type {
  CellValueType,
  ColumnMenuDropdown,
  TableCellType,
} from '@decipad/editor-types';
import {} from '@decipad/language';
import { N, ONE } from '@decipad/number';
import { useComputer, useEditorTableContext } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, ReactNode, useCallback, useState } from 'react';
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
  getSeriesType,
  getStringType,
} from '../../utils';
import { getFormulaType } from '../../utils/table';
import { UnitsAction } from '../../molecules/UnitMenuItem/UnitMenuItem';
import { typeFromUnitsAction } from './typeFromUnitsAction';

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
  readonly onChangeColumnType?: (type: TableCellType | undefined) => void;
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

  const onTriggerClick = useCallback(
    () => onChangeOpen?.(true),
    [onChangeOpen]
  );

  return (
    <div contentEditable={false} css={tableColumnMenuStyles}>
      {open ? (
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
                <MenuItem key="all" icon={<All />} selected>
                  {computer.formatUnit(type.unit, N(1))}
                </MenuItem>
              )}
            <MenuItem
              key="number"
              icon={<Number />}
              onSelect={() => onChangeColumnType(getNumberType())}
              selected={type.kind === 'number' && type.unit == null}
            >
              Number
            </MenuItem>
            <MenuList
              key="currency"
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
                  selected={
                    type.kind === 'number' && sameUnits(type.unit, unit)
                  }
                  itemAlignment="center"
                >
                  <span css={{ marginLeft: '2px' }}>{unit.baseQuantity}</span>
                </MenuItem>
              ))}
            </MenuList>

            {!isForImportedColumn && !isFirst && (
              <MenuItem
                key="table-formula"
                icon={<Formula />}
                onSelect={() => onChangeColumnType(getFormulaType())}
                selected={type.kind === 'table-formula'}
              >
                Formula
              </MenuItem>
            )}
            <MenuItem
              key="boolean"
              icon={<CheckboxSelected />}
              onSelect={() => onChangeColumnType(getBooleanType())}
              selected={type.kind === 'boolean'}
            >
              Checkbox
            </MenuItem>
            <MenuItem
              key="string"
              icon={<Text />}
              onSelect={() => onChangeColumnType(getStringType())}
              selected={type.kind === 'string'}
            >
              Text
            </MenuItem>

            {!isFirst && dropdownNames.length > 0 && (
              <MenuList
                key="dropdown-tables"
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
                {dropdownNames.map((d, index) => (
                  <MenuItem
                    key={index}
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
              key="dates"
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
                key="year"
                icon={<Calendar />}
                onSelect={() => onChangeColumnType(getDateType('year'))}
                selected={type.kind === 'date' && type.date === 'year'}
              >
                Year
              </MenuItem>
              <MenuItem
                key="month"
                icon={<Calendar />}
                onSelect={() => onChangeColumnType(getDateType('month'))}
                selected={type.kind === 'date' && type.date === 'month'}
              >
                Month
              </MenuItem>
              <MenuItem
                key="day"
                icon={<Calendar />}
                onSelect={() => onChangeColumnType(getDateType('day'))}
                selected={type.kind === 'date' && type.date === 'day'}
              >
                Day
              </MenuItem>
              <MenuItem
                key="minute"
                icon={<Calendar />}
                onSelect={() => onChangeColumnType(getDateType('minute'))}
                selected={type.kind === 'date' && type.date === 'minute'}
              >
                Time
              </MenuItem>
            </MenuList>
            {!isForImportedColumn && (
              <MenuList
                key="series"
                itemTrigger={
                  <TriggerMenuItem
                    icon={<Leaf />}
                    selected={type.kind === 'series'}
                  >
                    <div css={{ minWidth: '116px' }}>Sequence</div>
                  </TriggerMenuItem>
                }
                open={currentOpen === 'series'}
                onChangeOpen={() => onColumnExpand('series')}
              >
                <MenuItem
                  icon={<Number />}
                  onSelect={() => onChangeColumnType(getSeriesType('number'))}
                  selected={
                    type.kind === 'series' && type.seriesType === 'number'
                  }
                >
                  Number
                </MenuItem>
                <MenuItem
                  icon={<Calendar />}
                  onSelect={() => onChangeColumnType(getSeriesType('date'))}
                  selected={
                    type.kind === 'series' && type.seriesType === 'date'
                  }
                >
                  Date
                </MenuItem>
              </MenuList>
            )}
            <UnitMenuItem
              placeholder="add custom unit"
              onSelect={(state: UnitsAction | undefined) => {
                onChangeColumnType(typeFromUnitsAction(state));
              }}
              parseUnit={parseUnit}
            />
          </MenuList>
          {length > 1 ? (
            <MenuItem
              key="delete column"
              icon={<Trash />}
              onSelect={() => onRemoveColumn()}
            >
              Delete column
            </MenuItem>
          ) : null}
        </MenuList>
      ) : (
        <div onClick={onTriggerClick}>{trigger}</div>
      )}
    </div>
  );
};
