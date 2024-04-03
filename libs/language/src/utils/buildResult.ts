// eslint-disable-next-line no-restricted-imports
import type {
  Result,
  SerializedType,
  SerializedTypeKind,
} from '@decipad/language-types';
import { validateResult } from '../validateResult';

const VALIDATION_DISABLED_MESSAGE =
  'Validation has been disabled, which means a result is probably wrongly typed. Please fix this.';

let warnedAboutDisabledValidation = false;

export const buildResult = <TK extends SerializedTypeKind>(
  type: Extract<SerializedType, { kind: TK }>,
  _value: Result.OneResult,
  validate = true
): Result.Result<TK> => {
  let value = _value;
  if (validate) {
    const maybeNewValue = validateResult(type, _value);
    if (maybeNewValue != null) {
      value = maybeNewValue;
    }
  } else if (!warnedAboutDisabledValidation) {
    console.warn(VALIDATION_DISABLED_MESSAGE);
    warnedAboutDisabledValidation = true;
  }
  return { type, value } as Result.Result<TK>;
};
