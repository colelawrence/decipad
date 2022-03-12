import { SerializedType, SerializedUnits, Time } from '@decipad/language';
import { FunctionComponent } from 'react';
import { All, Calendar, Number, Text } from '../icons';
import type { TableCellType } from '../types';

export function getTypeIcon(type: TableCellType): FunctionComponent {
  switch (type.kind) {
    case 'date':
      return Calendar;
    case 'number':
      return type.unit == null ? Number : All;
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
