import { NotebookResults } from '@decipad/computer-interfaces';
import { SerializedNotebookResults } from '../types/serializedTypes';
// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { encodeString } from '@decipad/remote-computer-codec';
import { encodeFullBlockResult } from './encodeFullBlockResult';

const encodeBlockResults = async (
  blockResults: NotebookResults['blockResults']
): Promise<ArrayBuffer> => {
  const buffer = createResizableArrayBuffer(4096);
  const dataView = new Value.GrowableDataView(buffer);
  const entries = Object.entries(blockResults);
  let offset = 0;
  dataView.setUint32(offset, entries.length);
  offset += 4;
  for (const [key, value] of entries) {
    offset = encodeString(dataView, offset, key);
    // eslint-disable-next-line no-await-in-loop
    offset = await encodeFullBlockResult(dataView, offset, value);
  }
  return dataView.seal(offset);
};

export const encodeFullNotebookResults = async (
  results: NotebookResults
): Promise<SerializedNotebookResults> => {
  return {
    ...results,
    blockResults: await encodeBlockResults(results.blockResults),
  };
};
