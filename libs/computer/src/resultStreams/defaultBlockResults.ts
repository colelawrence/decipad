import { Unknown } from '@decipad/language-interfaces';
import type { IdentifiedResult } from '@decipad/computer-interfaces';

export const defaultBlockResults = (
  blockId: string,
  epoch = 1n
): IdentifiedResult => ({
  id: blockId,
  type: 'computer-result',
  result: {
    type: {
      kind: 'pending',
    },
    value: Unknown,
  },
  epoch,
});
