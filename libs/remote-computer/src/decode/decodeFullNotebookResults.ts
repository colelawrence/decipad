// eslint-disable-next-line no-restricted-imports

import type {
  BlockResult,
  NotebookResults,
} from '@decipad/computer-interfaces';
import type { SerializedNotebookResults } from '../types/serializedTypes';
import { decodeString } from '@decipad/remote-computer-codec';
import { decodeFullBlockResult } from './decodeFullBlockResult';

const decodeBlockResults = async (
  buffer: ArrayBuffer
): Promise<NotebookResults['blockResults']> => {
  const dataView = new DataView(buffer);
  let offset = 0;

  const entryCount = dataView.getUint32(offset);
  offset += 4;

  const blockResults: {
    [blockId: string]: BlockResult;
  } = {};
  for (let entryIndex = 0; entryIndex < entryCount; entryIndex++) {
    const [key, newOffset] = decodeString(dataView, offset);
    offset = newOffset;
    // eslint-disable-next-line no-await-in-loop
    const [value, newOffset2] = await decodeFullBlockResult(dataView, offset);
    offset = newOffset2;
    blockResults[key] = value;
  }

  return blockResults;
};

export const decodeFullNotebookResults = async (
  results: SerializedNotebookResults
): Promise<NotebookResults> => {
  return {
    ...results,
    blockResults: await decodeBlockResults(results.blockResults),
  };
};
