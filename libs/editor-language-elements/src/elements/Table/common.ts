import { IdentifiedError } from '@decipad/computer';

export const simpleError = (id: string, message: string): IdentifiedError => ({
  type: 'identified-error',
  errorKind: 'parse-error',
  id,
  error: { message },
  source: '',
});
