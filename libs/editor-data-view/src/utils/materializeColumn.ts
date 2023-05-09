import { all } from '@decipad/generator-utils';
import { Interpreter } from '@decipad/computer';

export type AnyImmaterializedColumn = {
  value: Interpreter.ResultColumn;
};

export type AnyMaterializedColumn = {
  value: Interpreter.OneResult[];
};

export type ResultingMaterializedColumn<T> = Omit<T, 'value'> &
  AnyMaterializedColumn;

export const materializeColumn = async <
  T extends AnyImmaterializedColumn,
  R = ResultingMaterializedColumn<T>
>(
  column: T
): Promise<R> => {
  const value = await all(column.value());
  return {
    ...column,
    value,
  } as R;
};
