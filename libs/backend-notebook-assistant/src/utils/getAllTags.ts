import type { DocumentVerbalization } from '@decipad/doc-verbalizer';
import { unique } from '@decipad/utils';

export const getAllTags = (
  verbalizedDocument: DocumentVerbalization
): Array<string> => {
  return unique(
    verbalizedDocument.verbalized.flatMap((vEl) => Array.from(vEl.tags))
  );
};
