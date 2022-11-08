import tables, { allPages } from '@decipad/tables';
import { applyUpdate, Doc, encodeStateVector, mergeUpdates } from 'yjs';

export const snapshot = async (
  notebookId: string
): Promise<{ data: string; version: string }> => {
  const data = await tables();

  const updates: Buffer[] = [];
  const resource = `/pads/${notebookId}`;
  for await (const update of allPages(data.docsyncupdates, {
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': resource,
    },
    ConsistentRead: true,
  })) {
    if (update) {
      updates.push(Buffer.from(update.data, 'base64'));
    }
  }

  const mergedUpdates = mergeUpdates(updates);
  const doc = new Doc();
  applyUpdate(doc, mergedUpdates);

  return {
    data: Buffer.from(mergedUpdates).toString('base64'),
    version: Buffer.from(encodeStateVector(doc)).toString('hex'),
  };
};
