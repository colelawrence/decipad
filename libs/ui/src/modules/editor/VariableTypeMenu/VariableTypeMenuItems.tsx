import { FC, useState } from 'react';

import { CellValueType, SimpleTableCellType } from '@decipad/editor-types';
import { ONE } from '@decipad/number';
import { currencyUnits } from '@decipad/remote-computer';
import { commonCurrencies } from '@decipad/language-units';

import {
  getBooleanType,
  getDateType,
  getNumberType,
  getStringType,
  sameUnits,
} from '../../../utils';
import { MenuItem, MenuList, TriggerMenuItem } from '../../../shared';
import {
  Calendar,
  CheckboxSelected,
  Dollar,
  Number,
  Text,
} from '../../../icons';

import * as S from './styles';
import { Prettify } from '@decipad/utils';
import { Unit } from '@decipad/language-interfaces';

type VariableTypeMenuItemsProps = Readonly<{
  type: CellValueType;
  onChangeType: (_: SimpleTableCellType) => void;
}>;

type ControlledVariableTypeMenuItemsProps = Prettify<
  VariableTypeMenuItemsProps &
    Readonly<{
      openSubmenu: 'none' | 'currency' | 'date';
      setOpenSubmenu: (
        _: ControlledVariableTypeMenuItemsProps['openSubmenu']
      ) => void;
    }>
>;

const presentableCurrencyUnits = currencyUnits.filter((unit) => {
  return commonCurrencies.includes(unit.name);
});

const ControlledVariableTypeMenu: FC<ControlledVariableTypeMenuItemsProps> = ({
  type,
  onChangeType,
  openSubmenu,
  setOpenSubmenu,
}) => (
  <>
    {/* Number Type */}

    <MenuItem
      key="number"
      icon={<Number />}
      onSelect={() => onChangeType(getNumberType())}
      selected={type.kind === 'number' && type.unit == null}
    >
      Number
    </MenuItem>

    {/* Currency Type */}

    <MenuList
      key="currency"
      itemTrigger={
        <TriggerMenuItem
          icon={<Dollar />}
          selected={type.kind === 'number' && type.unit != null}
        >
          <S.MenuItemWidth>Currency</S.MenuItemWidth>
        </TriggerMenuItem>
      }
      open={openSubmenu === 'currency'}
      onChangeOpen={() => setOpenSubmenu('currency')}
    >
      {presentableCurrencyUnits.map((unit, index) => (
        <MenuItem
          key={index}
          icon={<span>{unit.pretty ?? unit.name}</span>}
          onSelect={() =>
            onChangeType(
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
          <S.CurrencyItem>{unit.baseQuantity}</S.CurrencyItem>
        </MenuItem>
      ))}
    </MenuList>

    {/* Text Type */}

    <MenuItem
      key="string"
      icon={<Text />}
      onSelect={() => onChangeType(getStringType())}
      selected={type.kind === 'string'}
    >
      Text
    </MenuItem>

    {/* Date Type */}

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
          <S.MenuItemWidth>Date</S.MenuItemWidth>
        </TriggerMenuItem>
      }
      open={openSubmenu === 'date'}
      onChangeOpen={() => setOpenSubmenu('date')}
    >
      <MenuItem
        key="year"
        icon={<Calendar />}
        onSelect={() => onChangeType(getDateType('year'))}
        selected={type.kind === 'date' && type.date === 'year'}
      >
        Year
      </MenuItem>
      <MenuItem
        key="month"
        icon={<Calendar />}
        onSelect={() => onChangeType(getDateType('month'))}
        selected={type.kind === 'date' && type.date === 'month'}
      >
        Month
      </MenuItem>
      <MenuItem
        key="day"
        icon={<Calendar />}
        onSelect={() => onChangeType(getDateType('day'))}
        selected={type.kind === 'date' && type.date === 'day'}
      >
        Day
      </MenuItem>
      <MenuItem
        key="minute"
        icon={<Calendar />}
        onSelect={() => onChangeType(getDateType('minute'))}
        selected={type.kind === 'date' && type.date === 'minute'}
      >
        Time
      </MenuItem>
    </MenuList>

    {/* Checkbox Type */}

    <MenuItem
      key="boolean"
      icon={<CheckboxSelected />}
      onSelect={() => onChangeType(getBooleanType())}
      selected={type.kind === 'boolean'}
    >
      Checkbox
    </MenuItem>
  </>
);

const UncontrolledVariableTypeMenuItems: FC<VariableTypeMenuItemsProps> = (
  props
) => {
  const [openSubmenu, setOpenSubmenu] =
    useState<ControlledVariableTypeMenuItemsProps['openSubmenu']>('none');

  return (
    <ControlledVariableTypeMenu
      {...props}
      openSubmenu={openSubmenu}
      setOpenSubmenu={setOpenSubmenu}
    />
  );
};

/**
 * Simple values that are generic
 * - Number
 * - Percentage
 * - Text
 * - Date
 * - Checkbox
 *
 * Other things are specific to tables, and sometimes specific
 * to only user table, not imported ones.
 */
export const VariableTypeMenuItems: FC<
  VariableTypeMenuItemsProps | ControlledVariableTypeMenuItemsProps
> = (props) => {
  if ('openSubmenu' in props) {
    return <ControlledVariableTypeMenu {...props} />;
  }

  return <UncontrolledVariableTypeMenuItems {...props} />;
};
