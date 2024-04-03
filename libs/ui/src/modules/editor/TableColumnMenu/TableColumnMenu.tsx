/* eslint decipad/css-prop-named-variable: 0 */
/* eslint-disable complexity */
import type {
  CellValueType,
  ColumnMenuDropdown,
  TableCellType,
} from '@decipad/editor-types';
import { formatUnit } from '@decipad/format';
import { commonCurrencies } from '@decipad/language-units';
import { N, ONE } from '@decipad/number';
import { useComputer, useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { Unit, UnitOfMeasure, currencyUnits } from '@decipad/remote-computer';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { cssVar, p12Medium } from 'libs/ui/src/primitives';
import {
  ComponentProps,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  AddToWorkspace,
  AlignArrowLeft,
  AlignArrowRight,
  All,
  BulletList,
  Calendar,
  CheckboxSelected,
  Delete,
  DollarCircle,
  Formula,
  Magic,
  Number,
  NumberedList,
  Text,
} from '../../../icons';
import { MenuItem, MenuList, TriggerMenuItem } from '../../../shared';
import {
  getBooleanType,
  getDateType,
  getNumberType,
  getSeriesType,
  getStringType,
} from '../../../utils';
import { getFormulaType } from '../../../utils/table';
import { UnitMenuItem, UnitsAction } from '../UnitMenuItem/UnitMenuItem';
import { typeFromUnitsAction } from './typeFromUnitsAction';

const tableColumnMenuStyles = css({
  mixBlendMode: 'luminosity',
});

const presentableCurrencyUnits = currencyUnits.filter((unit) => {
  return commonCurrencies.includes(unit.name);
});

type ExpandableColumns = 'currency' | 'date' | 'series' | 'dropdowns' | null;

interface TableColumnMenuProps
  extends Pick<ComponentProps<typeof MenuList>, 'open' | 'onChangeOpen'>,
    Pick<ComponentProps<typeof UnitMenuItem>, 'parseUnit'> {
  readonly onChangeColumnType?: (type: TableCellType | undefined) => void;
  readonly isFirst?: boolean;
  readonly isReadOnly?: boolean;
  readonly trigger: ReactNode;
  readonly type: CellValueType;
  readonly isForImportedColumn?: boolean;
  readonly isLiveResult?: boolean;
  readonly dropdownNames?: ColumnMenuDropdown[];
  readonly onRemoveColumn?: () => void;
  readonly onAddColRight?: () => void;
  readonly onPopulateColumn?: () => void;
  readonly onAddColLeft?: () => void;
}

const sameUnits = (
  unit: Unit.Unit[] | null | undefined,
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

const dividerLabel = css({
  ...p12Medium,
  color: cssVar('textSubdued'),
  padding: '6px',
});

export const TableColumnMenu: React.FC<TableColumnMenuProps> = ({
  open,
  onChangeOpen,
  onChangeColumnType = noop,
  isFirst = false,
  trigger,
  type,
  isForImportedColumn = false,
  isLiveResult = false,
  dropdownNames = [],
  onAddColLeft,
  onAddColRight,
  onRemoveColumn,
  onPopulateColumn,
}) => {
  const computer = useComputer();
  const parseUnit = useMemo(
    () => computer.getUnitFromText.bind(computer),
    [computer]
  );

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
  const {
    workspaceInfo: { queryCount, quotaLimit },
  } = useCurrentWorkspaceStore();
  const shouldDisableAI = useMemo(() => {
    return !!quotaLimit && !!queryCount && queryCount >= quotaLimit;
  }, [quotaLimit, queryCount]);
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
          <h3 css={dividerLabel}>Type</h3>
          <MenuList
            key="number-list"
            itemTrigger={
              <TriggerMenuItem
                icon={<Number />}
                selected={
                  type.kind === 'number' ||
                  (type.kind === 'series' && type.seriesType === 'number')
                }
              >
                <div css={{ minWidth: '116px' }}>Numbers</div>
              </TriggerMenuItem>
            }
          >
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
                <TriggerMenuItem
                  icon={<DollarCircle />}
                  selected={type.kind === 'number' && type.unit != null}
                >
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
                          baseQuantity: unit.name as Unit.Unit['baseQuantity'],
                        },
                      ])
                    )
                  }
                  selected={
                    type.kind === 'number' && sameUnits(type.unit, unit)
                  }
                  itemAlignment="center"
                >
                  <span css={{ marginLeft: '6px' }}>{unit.baseQuantity}</span>
                </MenuItem>
              ))}
            </MenuList>
            {!isForImportedColumn && (
              <MenuItem
                icon={<NumberedList />}
                onSelect={() => onChangeColumnType(getSeriesType('number'))}
                selected={
                  type.kind === 'series' && type.seriesType === 'number'
                }
              >
                Number Sequence
              </MenuItem>
            )}
          </MenuList>
          <MenuList
            key="text-list"
            itemTrigger={
              <TriggerMenuItem
                icon={<Text />}
                selected={type.kind === 'string' || type.kind === 'category'}
              >
                <div css={{ minWidth: '116px' }}>Text</div>
              </TriggerMenuItem>
            }
          >
            <MenuItem
              key="string"
              icon={<Text />}
              onSelect={() => onChangeColumnType(getStringType())}
              selected={type.kind === 'string'}
            >
              Text
            </MenuItem>
            <MenuItem
              key="category"
              icon={<BulletList />}
              onSelect={() => onChangeColumnType({ kind: 'category' })}
              selected={type.kind === 'category'}
            >
              Category
            </MenuItem>
          </MenuList>
          <MenuList
            key="dates"
            itemTrigger={
              <TriggerMenuItem
                icon={<Calendar />}
                selected={
                  type.kind === 'date' ||
                  (type.kind === 'series' && type.seriesType === 'date')
                }
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
            {!isForImportedColumn && (
              <MenuItem
                icon={<Calendar />}
                onSelect={() => onChangeColumnType(getSeriesType('date'))}
                selected={type.kind === 'series' && type.seriesType === 'date'}
              >
                Date Sequence
              </MenuItem>
            )}
          </MenuList>
          <MenuItem
            key="boolean"
            icon={<CheckboxSelected />}
            onSelect={() => onChangeColumnType(getBooleanType())}
            selected={type.kind === 'boolean'}
          >
            Checkbox
          </MenuItem>

          {!isFirst && dropdownNames.length > 0 && (
            <MenuList
              key="dropdown-tables"
              itemTrigger={
                <TriggerMenuItem
                  icon={<AddToWorkspace />}
                  selected={type.kind === 'date'}
                >
                  <div css={{ minWidth: '116px' }}>From Dropdown</div>
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
                  selected={type.kind === 'dropdown' && type.id === d.id}
                >
                  {d.value}
                </MenuItem>
              ))}
            </MenuList>
          )}

          {!isForImportedColumn && (
            <MenuItem
              key="table-formula"
              icon={<Formula />}
              onSelect={() => onChangeColumnType(getFormulaType())}
              selected={type.kind === 'table-formula'}
            >
              Formula
            </MenuItem>
          )}
          <h3 css={dividerLabel}>Custom unit</h3>
          {type.kind === 'number' && type.unit != null && (
            <MenuItem key="all" icon={<All />} selected>
              {formatUnit('en-US', type.unit, ONE)}
            </MenuItem>
          )}
          <UnitMenuItem
            placeholder="add custom unit"
            onSelect={(state: UnitsAction | undefined) => {
              onChangeColumnType(typeFromUnitsAction(state));
            }}
            parseUnit={parseUnit}
          />
          {!isLiveResult && (
            <>
              <h3 css={dividerLabel}>Column Actions</h3>
              <MenuItem
                key="populate-column"
                icon={<Magic />}
                onSelect={onPopulateColumn}
                disabled={shouldDisableAI}
              >
                Populate with AI
              </MenuItem>
              <MenuItem
                key="add-column-left"
                icon={<AlignArrowLeft />}
                onSelect={onAddColLeft}
              >
                Add column left
              </MenuItem>
              <MenuItem
                key="add-column-right"
                icon={<AlignArrowRight />}
                onSelect={onAddColRight}
              >
                Add column right
              </MenuItem>
              <MenuItem
                key="remove-column"
                icon={<Delete />}
                onSelect={onRemoveColumn}
              >
                Remove column
              </MenuItem>
            </>
          )}
        </MenuList>
      ) : (
        <div onClick={onTriggerClick}>{trigger}</div>
      )}
    </div>
  );
};
