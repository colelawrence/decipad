import { type SerializedType, Format } from '@decipad/remote-computer';
import { zip } from '@decipad/utils';

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
    case 'pending':
      return 'pending';
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
      return type.unit ? Format.formatUnit(locale, type.unit) : '<number>';
    case 'materialized-table':
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
    case 'materialized-column':
    case 'column': {
      const columnStr = `${formatType(locale, type.cellType)}[]`;

      if (!isTableColumn && type.indexedBy) {
        return `${columnStr} (${type.indexedBy})`;
      }
      return columnStr;
    }
    case 'tree':
      return '<tree>';
    case 'type-error':
      return `Error: ${Format.formatError(locale, type.errorCause)}`;
  }
}
