import type {
  IdentifiedError,
  IdentifiedResult,
  Result,
} from '@decipad/remote-computer';
import { formatResult } from '@decipad/format';

const verbalizeIdentifiedResult = (result: Result.Result): string =>
  formatResult('en-US', result.value, result.type);

export const verbalizeResult = (
  result: IdentifiedError | IdentifiedResult
): string => {
  if (result.type === 'identified-error') {
    if (result.errorKind === 'dependency-cycle') {
      return 'dependency cycle error';
    }
    return result.error.message;
  }
  return verbalizeIdentifiedResult(result.result);
};
