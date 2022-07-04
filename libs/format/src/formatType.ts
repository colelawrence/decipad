import { SerializedType } from '@decipad/language';
import { zip } from '@decipad/utils';
import { formatUnit } from './formatUnit';

export const formatType = (
  locale: string,
  type: SerializedType,
  { isTableColumn = false }: { isTableColumn?: boolean } = {}
): string => {
  switch (type.kind) {
    case 'boolean':
      return '<boolean>';
    case 'date':
      return type.date;
    case 'nothing':
      return 'nothing';
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

      return `table (${type.tableLength}) { ${columnStrings.join(', ')} }`;
    }
    case 'row': {
      const rowCellStrings = zip(type.rowCellNames, type.rowCellTypes).map(
        ([name, cell]) => `${name} = ${formatType(locale, cell)}`
      );

      return `row [ ${rowCellStrings.join(', ')} ]`;
    }
    case 'column': {
      const columnStr = `${formatType(locale, type.cellType)} x ${
        type.columnSize
      }`;

      if (!isTableColumn && type.indexedBy) {
        return `${columnStr} (${type.indexedBy})`;
      }
      return columnStr;
    }
    case 'type-error':
      return `Error: ${JSON.stringify(type.errorCause)}`;
  }
};

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
