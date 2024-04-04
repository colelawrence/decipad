// eslint-disable-next-line no-restricted-imports
import type { Result } from '@decipad/language';
// eslint-disable-next-line no-restricted-imports
import { Unknown } from '@decipad/language';
import type { IdentifiedError, IdentifiedResult } from '../types';

const errorMessage = (message?: IdentifiedError['errorKind']): string => {
  switch (message) {
    case 'parse-error':
      return 'Syntax error';
    case 'dependency-cycle':
      return 'Circular definition';
  }
  return message ?? 'Unknown error';
};

export const selectErrorFromResult = (
  blockResult?: IdentifiedResult | IdentifiedError
): Result.Result<'type-error'> | undefined => {
  if (blockResult?.type === 'identified-error') {
    return {
      type: {
        kind: 'type-error',
        errorCause: {
          errType: 'free-form',
          message: errorMessage(blockResult.errorKind),
        },
      },
      value: Unknown,
    };
  }
  if (
    blockResult?.type === 'computer-result' &&
    blockResult?.result?.type.kind === 'type-error'
  ) {
    return blockResult.result as Result.Result<'type-error'>;
  }
  return undefined;
};
