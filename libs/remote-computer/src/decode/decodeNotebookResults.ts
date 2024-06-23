// eslint-disable-next-line no-restricted-imports

import type { NotebookResults } from '@decipad/computer-interfaces';
import { decodeBlockResult } from './decodeBlockResut';
import type { ClientWorkerContext } from '@decipad/remote-computer-worker/client';
import type { SerializedNotebookResults } from '../types/serializedTypes';

export const decodeNotebookResults = async (
  context: ClientWorkerContext,
  results: SerializedNotebookResults
): Promise<NotebookResults> => {
  return {
    ...results,
    blockResults: Object.fromEntries(
      await Promise.all(
        Object.entries(results.blockResults).map(async ([key, value]) => {
          return [key, await decodeBlockResult(context, value)];
        })
      )
    ),
  };
};
