import { FunctionComponent } from 'react';
import { SerializedType, Time, SerializedUnits } from '@decipad/language';
import { All, Number, Placeholder, Text } from '../icons';
import { TableCellType } from '../types';

export function getTypeIcon(type: TableCellType): FunctionComponent {
  switch (type.kind) {
    case 'date':
      return Placeholder;
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
