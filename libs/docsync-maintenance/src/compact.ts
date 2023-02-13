/* eslint-disable no-console */
import { Doc as YDoc } from 'yjs';
import { DynamodbPersistence } from '@decipad/y-dynamodb';

export const compact = async (notebookId: string) => {
  const doc = new YDoc();
  const provider = new DynamodbPersistence(notebookId, doc);
  try {
    console.log('started compaction of', notebookId);
    await provider.compact();
    console.log('finished compaction of', notebookId);
  } catch (err) {
    console.error(err);
  }
};
