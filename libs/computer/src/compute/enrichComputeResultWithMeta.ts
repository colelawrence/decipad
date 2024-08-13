import { all, map } from '@decipad/generator-utils';
import { type Value as TValue } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { getResultGenerator, Value } from '@decipad/language-types';

export const enrichComputeResultWithMeta = <T extends TValue.Value>(
  value: T
): T => {
  if (Value.isTableValue(value)) {
    const table = Value.Table.fromNamedColumns(
      value.columns,
      value.columnNames,
      value.meta
    );
    const tableMeta = table.meta?.();
    if (tableMeta?.labels) {
      return value;
    }
    const columnZeroMeta = table.columns[0]?.meta?.bind(table.columns[0]);

    const meta = () => {
      const previousMeta = columnZeroMeta?.();
      if (previousMeta?.labels) {
        console.log('previousMeta.labels', previousMeta.labels);
        return previousMeta;
      }

      const [firstColumn] = table.columns;
      if (!firstColumn) {
        return previousMeta;
      }
      return {
        labels: Promise.all([
          firstColumn.getData().then(async (data) => {
            return all(
              map(getResultGenerator(data)(), (cell) => cell?.toString() ?? '')
            );
          }),
        ]),
      };
    };

    table.meta = meta;
    for (const column of table.columns) {
      column.meta = meta;
    }
    return table as unknown as T;
  }
  return value;
};
