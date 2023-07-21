import type { IdentifiedResult } from '../types';
import { Result } from '..';

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
    value: Result.Unknown,
  },
  epoch,
});
