import { NotebookResults } from '@decipad/computer-interfaces';
import { decodeFromBuffer } from '@decipad/client-cache';
import { decodeFullNotebookResults } from '../decode/decodeFullNotebookResults';
import { SerializedNotebookResults } from '../types/serializedTypes';

export const decodeRemoteNotebookResults = async (
  buffer: DataView,
  offset: number
): Promise<NotebookResults> => {
  const partiallyDecoded = await decodeFromBuffer<SerializedNotebookResults>(
    buffer,
    offset
  );
  return decodeFullNotebookResults(partiallyDecoded);
};
