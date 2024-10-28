import type { Result } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
import type {
  IdentifiedError,
  IdentifiedResult,
} from '@decipad/computer-interfaces';

const errorMessage = (error?: IdentifiedError): string => {
  switch (error?.errorKind) {
    case 'parse-error':
      return 'Syntax error';
    case 'dependency-cycle': {
      const [first, ...rest] = error.explanation;
      return `Circular definition: ${first} since ${rest.join(', and ')}`;
    }
  }
  return 'Unknown error';
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
          message: errorMessage(blockResult),
        },
      },
      value: Unknown,
      meta: undefined,
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
