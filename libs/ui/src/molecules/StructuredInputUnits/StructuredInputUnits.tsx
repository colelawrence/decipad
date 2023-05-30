/* eslint decipad/css-prop-named-variable: 0 */
import { AST, currencyUnits, UnitOfMeasure } from '@decipad/language';
import { css } from '@emotion/react';
import { FC, useCallback, useState } from 'react';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import {
  Caret,
  DollarCircle,
  Number,
  Percentage,
  Ruler,
  Scale,
  Timer,
} from '../../icons';
import { p13Medium } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { ASTUnitMenuItem } from '../ASTUnitMenuItem/ASTUnitMenuItem';
import { MenuList } from '../MenuList/MenuList';

export interface StructuredInputUnitsProps {
  readonly unit: AST.Expression | '%' | undefined;
  readonly onChangeUnit: (unit?: AST.Expression | '%' | undefined) => void;
  readonly readOnly?: boolean;
}

const ExpandableColumnsArr = [
  ['Distance', Ruler],
  ['Weight', Scale],
  ['Time', Timer],
  ['Currency', DollarCircle],
] as const;
type ExpandableColumns = typeof ExpandableColumnsArr[number][0] | null;

const presentableCurrencyUnits = currencyUnits.filter((f) => {
  return !!f.pretty && f.pretty.length <= 3;
});

const unitCategories: Record<
  string,
  Exclude<ExpandableColumns, null> | 'Percentage'
> = {
  '%': 'Percentage',
  millimeter: 'Distance',
  centimeter: 'Distance',
  meter: 'Distance',
  kilometer: 'Distance',
  inch: 'Distance',
  foot: 'Distance',
  yard: 'Distance',
  mile: 'Distance',

  microsecond: 'Time',
  second: 'Time',
  minutes: 'Time',
  hour: 'Time',
  day: 'Time',
  week: 'Time',
  month: 'Time',
  year: 'Time',

  microgram: 'Weight',
  gram: 'Weight',
  kilogram: 'Weight',
  ounce: 'Weight',
  pound: 'Weight',
  stone: 'Weight',
  ton: 'Weight',

  ...presentableCurrencyUnits.reduce(
    (p, n) => ({
      ...p,
      [n.pretty || n.name]: 'Currency',
    }),
    {}
  ),
};
const categoryAndCaretStyles = css([
  hideOnPrint,
  {
    width: '100%',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'space-between',
    paddingLeft: '8px',
  },
]);

// We construct an object that we can render on the menu,
// from a map above so we can always have O(1) read.
const availableUnits = ExpandableColumnsArr.map(([c, icon]) => ({
  category: c,
  icon,
  units: Object.entries(unitCategories)
    .filter(([_, v]) => v === c)
    .map(([unit]) => unit),
}));

const u = (unit: string | UnitOfMeasure): AST.Expression | '%' | undefined => {
  if (unit === '') {
    return undefined;
  }
  if (unit === '%') {
    return '%';
  }
  if (typeof unit === 'string') {
    return { type: 'ref', args: [unit] };
  }
  return { type: 'ref', args: [unit.pretty || unit.name] };
};

export const StructuredInputUnits: FC<StructuredInputUnitsProps> = ({
  unit,
  onChangeUnit,
  readOnly = false,
}) => {
  // No sub menu can be open at the same time
  const [open, setOpen] = useState(false);

  const [currentOpen, setCurrentOpen] = useState<ExpandableColumns>(null);
  const onColumnExpand = useCallback(
    (current: ExpandableColumns) => {
      setCurrentOpen(current === currentOpen ? null : current);
    },
    [currentOpen]
  );

  const stringUnit = unit
    ? unit === '%'
      ? 'Percentage'
      : unitCategories[unit.args[0]?.toString() || 'Advanced Unit']
    : 'Number';

  return (
    <span
      css={{
        display: 'inline-flex',
        cursor: readOnly ? 'default' : 'pointer',
        userSelect: 'none',
      }}
      contentEditable={false}
    >
      {readOnly ? (
        <span css={categoryAndCaretStyles}>
          <span css={p13Medium}>{stringUnit}</span>
        </span>
      ) : (
        <MenuList
          root
          dropdown
          open={open}
          onChangeOpen={setOpen}
          trigger={
            <span css={categoryAndCaretStyles}>
              <span css={p13Medium}>
                {/* Without text the icon has no line height, and so floats
                upwards, hence the non-breaking space */}
                {'\uFEFF'}
                {stringUnit || 'Units'}
              </span>
              <span
                css={{
                  width: 18,
                  display: 'grid',
                }}
                data-testid="unit-picker-button"
              >
                <Caret variant="down" />
              </span>
            </span>
          }
        >
          <MenuItem icon={<Number />} onSelect={() => onChangeUnit(undefined)}>
            <span>Number</span>
          </MenuItem>
          <MenuItem icon={<Percentage />} onSelect={() => onChangeUnit('%')}>
            <span data-testid="unit-picker-percentage">Percentage</span>
          </MenuItem>
          <MenuList
            itemTrigger={
              <TriggerMenuItem icon={<DollarCircle />}>
                <div css={{ minWidth: '132px' }}>Currency</div>
              </TriggerMenuItem>
            }
            onChangeOpen={() => onColumnExpand('Currency')}
            open={currentOpen === 'Currency'}
          >
            {presentableCurrencyUnits.map((currency) => (
              <MenuItem
                key={currency.baseQuantity}
                icon={<span>{currency.pretty ?? currency.name}</span>}
                onSelect={() => onChangeUnit(u(currency))}
              >
                {currency.baseQuantity}
              </MenuItem>
            ))}
          </MenuList>
          {/* We show currencies seperately because they have nice icons */}
          {availableUnits
            .filter((a) => a.category !== 'Currency')
            .map((unitCategory) => (
              <MenuList
                key={unitCategory.category}
                itemTrigger={
                  <TriggerMenuItem icon={<unitCategory.icon />}>
                    <div
                      css={{ minWidth: '132px' }}
                      data-testid={`unit-picker-${unitCategory.category}`}
                    >
                      {unitCategory.category}
                    </div>
                  </TriggerMenuItem>
                }
                onChangeOpen={() => onColumnExpand(unitCategory.category)}
                open={currentOpen === unitCategory.category}
              >
                {unitCategory.units.map((myUnit) => (
                  <MenuItem
                    key={myUnit}
                    onSelect={() => onChangeUnit(u(myUnit))}
                  >
                    <span
                      data-testid={`unit-picker-${unitCategory.category}-${myUnit}`}
                    >
                      {myUnit}
                    </span>
                  </MenuItem>
                ))}
              </MenuList>
            ))}
          <ASTUnitMenuItem
            placeholder="add custom unit"
            onSelect={onChangeUnit}
          />
        </MenuList>
      )}
    </span>
  );
};
