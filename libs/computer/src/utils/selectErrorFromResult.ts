import { Result } from '..';
import { IdentifiedError, IdentifiedResult } from '../types';

const errorMessage = (message?: string): string => {
  if (message === 'No solutions') {
    return 'Syntax error';
  }
  return message ?? 'Unknown error';
};

export const selectErrorFromResult = (
  blockResult?: IdentifiedResult | IdentifiedError
): Result.Result | undefined => {
  if (blockResult?.type === 'identified-error') {
    return {
      type: {
        kind: 'type-error',
        errorCause: {
          errType: 'free-form',
          message: errorMessage(blockResult.error?.message),
        },
      },
      value: Result.Unknown,
    };
  }
  if (
    blockResult?.type === 'computer-result' &&
    blockResult?.result?.type.kind === 'type-error'
  ) {
    return blockResult.result;
  }
  return undefined;
};
