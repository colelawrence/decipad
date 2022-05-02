import { SerializedType, SerializedUnits, Time } from '@decipad/language';
import { FunctionComponent } from 'react';
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

export const defaultTableColor: AvailableSwatchColor = 'Catskill';
