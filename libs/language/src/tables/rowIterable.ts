import { Value } from '@decipad/language-interfaces';

export const rowIterableFromColumns = (
  otherColumns: Map<string, Value.ColumnLikeValue>
) => {
  return async function* rowIterable() {
    const otherColumnsIterable = Object.fromEntries(
      await Promise.all(
        [...otherColumns.entries()].map(
          async ([columnName, columnValue]) =>
            [columnName, columnValue.values()] as const
        )
      )
    );

    // eslint-disable-next-line no-labels
    outerLoop: while (true) {
      const acc = new Map<string | symbol, Value.Value>();

      for (const [columnName, rowValue] of Object.entries(
        otherColumnsIterable
      )) {
        // eslint-disable-next-line no-await-in-loop
        const value = await rowValue.next();

        if (value.done) {
          // eslint-disable-next-line no-labels
          break outerLoop;
        } else {
          acc.set(columnName, value.value);
        }
      }

      yield acc;
    }
  };
};
