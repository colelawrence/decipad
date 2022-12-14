import type { SerializedType } from '@decipad/language';
import { zip } from '@decipad/utils';
import { formatUnit } from './formatUnit';
import { formatError } from './formatError';

export function formatType(
  locale: string,
  type: SerializedType,
  { isTableColumn = false }: { isTableColumn?: boolean } = {}
): string {
  // eslint-disable-next-line no-use-before-define
  const inner = formatTypeInner(locale, type, { isTableColumn });

  if (type.symbol) {
    return `${inner}:${type.symbol}`;
  }
  return inner;
}

export function formatTypeInner(
  locale: string,
  type: SerializedType,
  { isTableColumn }: { isTableColumn: boolean }
): string {
  switch (type.kind) {
    case 'boolean':
      return '<boolean>';
    case 'date':
      return type.date;
    case 'nothing':
      return 'nothing';
    case 'anything':
      return 'anything';
    case 'string':
      return '<string>';
    case 'function':
      return '<function>';
    case 'range':
      return `range of ${formatType(locale, type.rangeOf)}`;
    case 'number':
      return type.unit ? formatUnit(locale, type.unit) : '<number>';
    case 'table': {
      const columnStrings = zip(type.columnNames, type.columnTypes).map(
        ([name, col]) =>
          `${name} = ${formatType(locale, col, { isTableColumn: true })}`
      );

      return `table { ${columnStrings.join(', ')} }`;
    }
    case 'row': {
      const rowCellStrings = zip(type.rowCellNames, type.rowCellTypes).map(
        ([name, cell]) => `${name} = ${formatType(locale, cell)}`
      );

      return `row [ ${rowCellStrings.join(', ')} ]`;
    }
    case 'column': {
      const columnStr = `${formatType(locale, type.cellType)}[]`;

      if (!isTableColumn && type.indexedBy) {
        return `${columnStr} (${type.indexedBy})`;
      }
      return columnStr;
    }
    case 'type-error':
      return `Error: ${formatError(locale, type.errorCause)}`;
  }
}

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
    default:
      return type.kind;
  }
};
