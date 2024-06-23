import { type IdentifiedError } from '@decipad/computer-interfaces';

export const simpleArtifficialError = (
  id: string,
  message: string,
  derivedFromBlockId: Array<string>
): IdentifiedError => ({
  type: 'identified-error',
  errorKind: 'parse-error',
  id,
  error: { message },
  source: '',
  isArtificial: true,
  artificiallyDerivedFrom: derivedFromBlockId,
});
