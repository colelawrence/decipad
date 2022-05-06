import { SerializedType, SerializedUnits, Time } from '@decipad/language';
import { createContext, FunctionComponent } from 'react';
import {
  All,
  Calendar,
  CheckboxSelected,
  Formula,
  Number,
  Text,
} from '../icons';
import type { TableCellType } from '../types';
import { AvailableSwatchColor } from './swatches';
import { UserIconKey } from './user-icons';

export function getTypeIcon(type: TableCellType): FunctionComponent {
  switch (type.kind) {
    case 'date':
      return Calendar;
    case 'boolean':
      return CheckboxSelected;
    case 'number':
      return type.unit == null ? Number : All;
    case 'table-formula':
      return Formula;
    default:
      return Text;
  }
}

export function getDateType(
  specificity: Time.Specificity
): Extract<SerializedType, { kind: 'date' }> {
  return { kind: 'date', date: specificity };
}

export function getNumberType(
  unit?: SerializedUnits
): Extract<SerializedType, { kind: 'number' }> {
  return { kind: 'number', unit: unit ?? null };
}

export function getBooleanType(): Extract<SerializedType, { kind: 'boolean' }> {
  return { kind: 'boolean' };
}

export function getFormulaType(): Extract<
  TableCellType,
  { kind: 'table-formula' }
> {
  return {
    kind: 'table-formula',
    // eslint-disable-next-line no-alert
    source: prompt('Pls write code') ?? '0',
  };
}

export function getStringType(): Extract<SerializedType, { kind: 'string' }> {
  return { kind: 'string' };
}

export function toTableHeaderType(
  type: SerializedType
): TableCellType | undefined {
  switch (type.kind) {
    case 'number':
    case 'string':
    case 'date':
      return type;
    default:
      return undefined;
  }
}

interface TableStyleContextValue {
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly setIcon: (newIcon: UserIconKey) => void;
  readonly setColor: (newColor: AvailableSwatchColor) => void;
}
export const TableStyleContext = createContext<TableStyleContextValue>({
  icon: 'Table',
  color: 'Catskill',
  setIcon: () => {
    throw new Error('No way to change the icon provided');
  },
  setColor: () => {
    throw new Error('No way to change the color provided');
  },
});
