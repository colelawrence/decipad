import type { Result } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';

export const errorResult = (message: string): Result.Result => {
  return {
    type: {
      kind: 'type-error',
      errorCause: {
        errType: 'free-form',
        message,
      },
    },
    value: Unknown,
    meta: undefined,
  };
};
