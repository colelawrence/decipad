import { Result } from '@decipad/remote-computer';

export const errorResult = (message: string): Result.Result => {
  return {
    type: {
      kind: 'type-error',
      errorCause: {
        errType: 'free-form',
        message,
      },
    },
    value: Result.Unknown,
  };
};
