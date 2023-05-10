import { toSlateDoc } from '@decipad/slate-yjs';
import tables, { allPages } from '@decipad/tables';
import { Document } from '@decipad/editor-types';
import md5 from 'md5';
import { canonicalize } from 'json-canonicalize';
import { applyUpdate, Doc, mergeUpdates } from 'yjs';

export const snapshot = async (
  notebookId: string
): Promise<{ data: Buffer; version: string; value: Document }> => {
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
  const value = toSlateDoc(doc.getArray());
  const canonicalizedObj = canonicalize(value);

  return {
    value: { children: value },
    data: Buffer.from(mergedUpdates),
    version: md5(canonicalizedObj),
  };
};
