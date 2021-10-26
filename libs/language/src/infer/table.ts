import { Type, build as t } from '../type';

const getLargestColumn = (columnTypes: Type[]) => {
  const columnSizes = new Set([...columnTypes].map((c) => c.columnSize));
  columnSizes.delete(null);
  columnSizes.delete('unknown');
  return Array.from(columnSizes)[0];
};

export const unifyColumnSizes = (
  indexName: string | null,
  types: Type[],
  columnNames: string[]
): Type => {
  const length = getLargestColumn(types) ?? 1;
  const columnTypes = types.map((colValue) => {
    if (colValue.columnSize === length || colValue.columnSize === 'unknown') {
      return colValue.reduced();
    } else if (colValue.columnSize != null) {
      return t.impossible('Incompatible column sizes');
    } else {
      // Because we're so very nice, allow `Column = 1` as syntax sugar.
      return colValue;
    }
  });

  return t.table({ indexName, length, columnTypes, columnNames });
};
