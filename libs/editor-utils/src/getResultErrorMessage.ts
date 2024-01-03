import { Result } from '@decipad/remote-computer';
import { formatError } from '@decipad/format';

export const getResultErrorMessage = (
  result: Result.Result<'type-error'>
): string => formatError('en-US', result.type.errorCause);
