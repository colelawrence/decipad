import { type IdentifiedError } from '@decipad/remote-computer';

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
