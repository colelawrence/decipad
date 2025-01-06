import { Result } from '@decipad/remote-computer';

export const isRectangularTable = (
  result: Result.Result | undefined
): boolean => {
  if (result == null) {
    return false;
  }

  if (result.type.kind !== 'table') {
    return false;
  }

  const columnKinds = result.type.columnTypes.map((c) => c.kind);

  return columnKinds.every(
    (c) =>
      c !== 'column' &&
      c !== 'table' &&
      c !== 'materialized-column' &&
      c !== 'materialized-table'
  );
};
