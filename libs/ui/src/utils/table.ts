import { SerializedType, SerializedTypes, Unit, Time } from '@decipad/computer';
import type {
  SeriesType,
  CellValueType,
  TableCellType,
} from '@decipad/editor-types';
import { createContext, FunctionComponent, ElementType } from 'react';
import {
  All,
  Calendar,
  CheckboxSelected,
  Code,
  DollarCircle,
  Formula,
  Number,
  Text,
  Warning,
} from '../icons';
import { AvailableSwatchColor } from './swatches';
import { UserIconKey } from './user-icons';

const isCurrencyUnit = (unit: Unit[] | null | undefined): boolean =>
  unit?.length === 1 && unit[0].baseSuperQuantity === 'currency';

export function getTypeIcon(
  type: CellValueType,
  onExpressionEditor = false
): FunctionComponent | ElementType {
  switch (type.kind) {
    case 'date':
      return Calendar;
    case 'boolean':
      return CheckboxSelected;
    case 'number':
      return type.unit == null
        ? Number
        : isCurrencyUnit(type.unit)
        ? DollarCircle
        : All;
    case 'table-formula':
      return Formula;
    case 'series':
      return Calendar; // only calendar for now
    case 'dropdown':
      return type.type === 'number' ? Number : Text;
    case 'anything':
      return onExpressionEditor ? Code : 'span';
    case 'type-error':
      return Warning;
    default:
      return Text;
  }
}

export function getDateType(
  specificity: Time.Specificity
): SerializedTypes.Date {
  return { kind: 'date', date: specificity };
}

export function getSeriesType(type: SeriesType): TableCellType {
  return { kind: 'series', seriesType: type };
}

export function getNumberType(unit?: Unit[]): SerializedTypes.Number {
  return { kind: 'number', unit: unit ?? null };
}

export function getBooleanType(): SerializedTypes.Boolean {
  return { kind: 'boolean' };
}

export function getFormulaType(): Extract<
  TableCellType,
  { kind: 'table-formula' }
> {
  return {
    kind: 'table-formula',
  };
}

export function getStringType(): SerializedTypes.String {
  return { kind: 'string' };
}

export function toTableHeaderType(
  type: SerializedType
): TableCellType | undefined {
  switch (type.kind) {
    case 'number':
    case 'string':
    case 'date':
    case 'boolean':
      return type;
    default:
      return undefined;
  }
}

interface TableStyleContextValue {
  readonly icon: UserIconKey;
  readonly color?: AvailableSwatchColor;
  readonly isCollapsed?: boolean;
  readonly hideFormulas?: boolean;

  readonly setIcon: (newIcon: UserIconKey) => void;
  readonly setColor: (newColor: AvailableSwatchColor) => void;
  readonly setCollapsed?: (collapsed: boolean) => void;
  readonly setHideFormulas?: (isHidden: boolean) => void;

  readonly hideAddDataViewButton?: boolean;
}
export const TableStyleContext = createContext<TableStyleContextValue>({
  icon: 'Table',
  color: undefined,
  hideAddDataViewButton: false,
  isCollapsed: false,
  hideFormulas: false,
  setIcon: () => {
    throw new Error('No way to change the icon provided');
  },
  setColor: () => {
    throw new Error('No way to change the color provided');
  },
  setCollapsed: () => {
    throw new Error('No way to set collapsed');
  },
  setHideFormulas: () => {
    throw new Error('No way to set hide formulas');
  },
});
