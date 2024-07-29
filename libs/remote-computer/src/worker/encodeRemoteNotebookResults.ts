// eslint-disable-next-line no-restricted-imports
import { createResizableArrayBuffer } from '@decipad/language-utils';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { NotebookResults } from '@decipad/computer-interfaces';
import { encodingToBuffer } from '@decipad/client-cache';
import { encodeFullNotebookResults } from '../encode/encodeFullNotebookResults';

export const encodeRemoteNotebookResults = async (
  results: NotebookResults
): Promise<ArrayBuffer> => {
  const partiallyEncoded = await encodeFullNotebookResults(results);
  const encode = encodingToBuffer({
    rootValueKeys: ['blockResults', 'indexLabels'],
  });
  const buffer = createResizableArrayBuffer(1024);
  const dataView = new Value.GrowableDataView(buffer);
  const offset = await encode(partiallyEncoded, buffer, dataView, 0);
  return dataView.seal(offset);
};
