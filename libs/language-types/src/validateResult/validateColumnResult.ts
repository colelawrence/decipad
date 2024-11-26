import type { Result, SerializedTypes } from '@decipad/language-interfaces';
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
  return value as Result.ResultGenerator;
};
