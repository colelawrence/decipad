import type { SerializedType } from '@decipad/language-interfaces';
import { formatUnit } from './formatUnit';

export const formatTypeToBasicString = (
  locale: string,
  type: SerializedType
): string => {
  switch (type.kind) {
    case 'type-error':
      throw new Error('toBasicString: errors not supported');
    case 'number':
      return type.unit ? formatUnit(locale, type.unit) : 'number';
    case 'date':
      return `date(${type.date})`;
    case 'column':
      return type.cellType.kind === 'anything'
        ? 'column'
        : `column<${formatTypeToBasicString(locale, type.cellType)}>`;
    case 'table':
      return `table<${type.columnNames
        .map(
          (colName, colIndex) =>
            `${colName}:${formatTypeToBasicString(
              locale,
              type.columnTypes[colIndex]
            )}`
        )
        .join(', ')}>`;
    default:
      return type.kind;
  }
};
