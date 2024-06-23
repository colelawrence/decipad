// eslint-disable-next-line no-restricted-imports

import type { SerializedNotebookResults } from '../types/serializedTypes';
import { encodeBlockResult } from './encodeBlockResult';
import type { NotebookResults } from '@decipad/computer-interfaces';
import type { RemoteValueStore } from '@decipad/remote-computer-worker/client';

export const encodeNotebookResults = async (
  results: NotebookResults,
  store: RemoteValueStore
): Promise<SerializedNotebookResults> => {
  return {
    ...results,
    blockResults: Object.fromEntries(
      await Promise.all(
        Object.entries(results.blockResults).map(async ([key, value]) => {
          return [key, await encodeBlockResult(value, store)];
        })
      )
    ),
  };
};
