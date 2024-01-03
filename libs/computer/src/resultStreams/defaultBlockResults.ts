// eslint-disable-next-line no-restricted-imports
import { Unknown } from '@decipad/language';
import type { IdentifiedResult } from '../types';

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
