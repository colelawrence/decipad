import { IdentifiedError } from '@decipad/computer';

export const simpleArtifficialError = (
  id: string,
  message: string,
  derivedFromBlockId: string
): IdentifiedError => ({
  type: 'identified-error',
  errorKind: 'parse-error',
  id,
  error: { message },
  source: '',
  isArtificial: true,
  artificiallyDerivedFrom: derivedFromBlockId,
});
