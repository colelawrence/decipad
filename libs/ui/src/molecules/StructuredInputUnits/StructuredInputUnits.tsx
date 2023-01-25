import { currencyUnits } from '@decipad/language';
import { FC, useCallback, useState } from 'react';
import { StructuredInputElement } from '@decipad/editor-types';
import { Computer } from '@decipad/computer';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import {
  Caret,
  DollarCircle,
  Number,
  Percentage,
  Sunrise,
  Trophy,
} from '../../icons';
import { cssVar } from '../../primitives';
import { MenuList } from '../MenuList/MenuList';
import { UnitMenuItem } from '../UnitMenuItem/UnitMenuItem';

export interface StructuredInputUnitsProps {
  readonly unit: StructuredInputElement['unit'];
  readonly onChangeUnit: (newType: StructuredInputElement['unit']) => void;
  readonly onParseUnit: Computer['getUnitFromText'];
  readonly formatUnit: Computer['formatUnit'];
}

type ExpandableColumns = 'distance' | 'currency' | 'weight' | 'time' | null;

const presentableCurrencyUnits = currencyUnits.filter((f) => {
  return !!f.pretty && f.pretty.length <= 3;
});

export const StructuredInputUnits: FC<StructuredInputUnitsProps> = ({
  unit,
  onChangeUnit,
  onParseUnit,
  formatUnit,
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

  return (
    <div
      css={{
        minWidth: '64px',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        borderRight: `1px solid ${cssVar('borderColor')}`,
      }}
      contentEditable={false}
    >
      <MenuList
        root
        dropdown
        open={open}
        onChangeOpen={setOpen}
        trigger={
          <div
            css={{
              width: '100%',
              height: '100%',
              borderRadius: '16px',
              display: 'flex',
              padding: '4px',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {unit && unit.length > 0 ? (
              typeof unit === 'string' ? (
                unit
              ) : (
                formatUnit(unit)
              )
            ) : (
              <div
                css={{
                  width: 18,
                  height: 18,
                  display: 'grid',
                  alignItems: 'center',
                }}
              >
                <Number />
              </div>
            )}
            <button
              css={{
                width: 18,
                height: 18,
                display: 'grid',
              }}
            >
              <Caret variant="down" />
            </button>
          </div>
        }
      >
        <MenuItem icon={<Number />} onSelect={() => onChangeUnit('')}>
          Number
        </MenuItem>
        <MenuItem icon={<Percentage />} onSelect={() => onChangeUnit('%')}>
          Percentage
        </MenuItem>
        <MenuList
          itemTrigger={
            <TriggerMenuItem icon={<DollarCircle />}>
              <div css={{ minWidth: '132px' }}>Currency</div>
            </TriggerMenuItem>
          }
          onChangeOpen={() => onColumnExpand('currency')}
          open={currentOpen === 'currency'}
        >
          {presentableCurrencyUnits.map((u, i) => (
            <MenuItem
              key={i}
              icon={<span>{u.pretty ?? u.name}</span>}
              onSelect={() => onChangeUnit(u.pretty ?? u.name)}
            >
              {u.baseQuantity}
            </MenuItem>
          ))}
        </MenuList>
        <MenuList
          itemTrigger={
            <TriggerMenuItem icon={<Number />}>Distance</TriggerMenuItem>
          }
          onChangeOpen={() => onColumnExpand('distance')}
          open={currentOpen === 'distance'}
        >
          <MenuItem onSelect={() => onChangeUnit('km')}>Kilometers</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('m')}>Meters</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('cm')}>Centimeters</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('miles')}>Miles</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('yards')}>Yards</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('inches')}>Inches</MenuItem>
        </MenuList>
        <MenuList
          itemTrigger={
            <TriggerMenuItem icon={<Trophy />}>Weight</TriggerMenuItem>
          }
          onChangeOpen={() => onColumnExpand('weight')}
          open={currentOpen === 'weight'}
        >
          <MenuItem onSelect={() => onChangeUnit('g')}>Grams</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('kg')}>Kilograms</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('ounces')}>Ounces</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('pounds')}>Pounds</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('ton')}>Ton</MenuItem>
        </MenuList>
        <MenuList
          itemTrigger={
            <TriggerMenuItem icon={<Sunrise />}>Time</TriggerMenuItem>
          }
          onChangeOpen={() => onColumnExpand('time')}
          open={currentOpen === 'time'}
        >
          <MenuItem onSelect={() => onChangeUnit('seconds')}>Seconds</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('minutes')}>Minutes</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('hours')}>Hours</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('days')}>Days</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('weeks')}>Weeks</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('months')}>Months</MenuItem>
          <MenuItem onSelect={() => onChangeUnit('years')}>Years</MenuItem>
        </MenuList>
        <UnitMenuItem
          placeholder="create custom"
          onSelect={(u) => {
            onChangeUnit(u ?? undefined);
          }}
          parseUnit={onParseUnit}
        />
      </MenuList>
    </div>
  );
};
