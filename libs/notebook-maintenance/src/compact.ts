/* eslint-disable no-console */
import { Doc as YDoc } from 'yjs';
import { DynamodbPersistence } from '@decipad/y-dynamodb';

export const compact = async (notebookId: string) => {
  const doc = new YDoc();
  const provider = new DynamodbPersistence(notebookId, doc);
  try {
    await provider.compact();
  } catch (err) {
    console.error(err);
  }
};
