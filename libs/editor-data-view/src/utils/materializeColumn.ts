import { all, slice } from '@decipad/generator-utils';
import { Interpreter } from '@decipad/computer';

export type AnyImmaterializedColumn = {
  value: Interpreter.ResultColumn;
};

export type AnyMaterializedColumn = {
  value: Interpreter.OneResult[];
};

export type AnyColumn = AnyImmaterializedColumn | AnyMaterializedColumn;

export type ResultingMaterializedColumn<T> = Omit<T, 'value'> &
  AnyMaterializedColumn;

const MAX_COLUMN_LENGTH = 100_000;

export const materializeColumn = async <
  T extends AnyColumn,
  R = ResultingMaterializedColumn<T>
>(
  column: T
): Promise<R> => {
  if (Array.isArray(column.value)) {
    return column as unknown as R;
  }
  const value = await all(slice(column.value(), 0, MAX_COLUMN_LENGTH + 1));
  if (value.length > MAX_COLUMN_LENGTH) {
    throw new Error(
      `Maximum column length of ${MAX_COLUMN_LENGTH} reached. Bailing.`
    );
  }
  return {
    ...column,
    value,
  } as R;
};
