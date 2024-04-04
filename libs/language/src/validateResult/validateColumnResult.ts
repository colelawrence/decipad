import { getDefined } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Result, SerializedTypes } from '@decipad/language-types';
import type { Validate } from './types';

export const validateColumnResult = (
  type: SerializedTypes.Column | SerializedTypes.MaterializedColumn,
  value: Result.OneResult | null | undefined,
  getTrue: (v: boolean, message: string) => void,
  validate: Validate
): Result.OneResult => {
  if (Array.isArray(value)) {
    value.forEach((cell) => validate(type.cellType, cell));
    return value;
  }

  if (typeof value !== 'function' && value != null) {
    return validateColumnResult(type, [value], getTrue, validate);
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
