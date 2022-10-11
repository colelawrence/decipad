import tables, { allPages } from '@decipad/tables';
import { mergeUpdates } from 'yjs';

export const snapshot = async (notebookId: string): Promise<string> => {
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

  return Buffer.from(mergeUpdates(updates)).toString('base64');
};
