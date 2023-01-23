import { currencyUnits } from '@decipad/language';
import { FC, useCallback, useState } from 'react';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { Caret, DollarCircle, Number } from '../../icons';
import { cssVar } from '../../primitives';
import { MenuList } from '../MenuList/MenuList';

export interface StructuredInputUnitsProps {
  readonly unit: string;
  readonly onChangeUnit: (newType: string) => void;
}

type ExpandableColumns = 'distance' | 'currency' | null;

const presentableCurrencyUnits = currencyUnits.filter((f) => {
  return !!f.pretty && f.pretty.length <= 3;
});

export const StructuredInputUnits: FC<StructuredInputUnitsProps> = ({
  unit,
  onChangeUnit,
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
            {unit.length > 0 ? (
              unit
            ) : (
              <div
                css={{
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Number />
              </div>
            )}
            <div
              css={{
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Caret variant="down" />
            </div>
          </div>
        }
      >
        <MenuItem icon={<Number />} onSelect={() => onChangeUnit('')}>
          Number
        </MenuItem>
        <MenuList
          itemTrigger={
            <TriggerMenuItem icon={<DollarCircle />}>
              <div>Currency</div>
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
      </MenuList>
    </div>
  );
};
