import { getDefined } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { Result, SerializedTypes } from '@decipad/language-types';
import { Validate } from './types';

export const validateColumnResult = (
  type: SerializedTypes.Column | SerializedTypes.MaterializedColumn,
  value: Result.ResultGenerator | null | undefined,
  getTrue: (v: boolean, message: string) => void,
  validate: Validate
): Result.ResultGenerator => {
  if (Array.isArray(value)) {
    value.forEach((cell) => validate(type.cellType, cell));
    return value;
  }

  getTrue(
    typeof value === 'function',
    `column value is not a function: ${value}`
  );
  const { cellType } = type;
  return async function* validateColumnResult(start?: number, end?: number) {
    for await (const v of getDefined(value)(start, end)) {
      const newValue = validate(cellType, v);
      yield newValue ?? v;
    }
  };
};
