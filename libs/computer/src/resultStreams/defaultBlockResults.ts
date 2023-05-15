import type { IdentifiedResult } from '../types';
import { Result } from '..';

export const defaultBlockResults = (blockId: string): IdentifiedResult => ({
  id: blockId,
  type: 'computer-result',
  result: {
    type: {
      kind: 'pending',
    },
    value: Result.Unknown,
  },
});
