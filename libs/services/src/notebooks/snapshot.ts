import { toSlateDoc } from '@decipad/slate-yjs';
import tables, { allPages } from '@decipad/tables';
import md5 from 'md5';
import { applyUpdate, Doc, mergeUpdates } from 'yjs';
import '../utils/bigint';

export const snapshot = async (
  notebookId: string
): Promise<{ data: Buffer; version: string }> => {
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

  const mergedUpdates = mergeUpdates(updates) ?? new Uint8Array();
  const doc = new Doc();
  if (mergedUpdates.length) {
    applyUpdate(doc, mergedUpdates);
  }

  return {
    data: Buffer.from(mergedUpdates),
    version: md5(JSON.stringify(toSlateDoc(doc.getArray()))),
  };
};
