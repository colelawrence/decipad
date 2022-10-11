import tables, { allPages } from '@decipad/tables';
import { Buffer } from 'buffer';
import { mergeUpdates } from 'yjs';
import { getDefined } from '@decipad/utils';

const fetchUpdates = async (padId: string): Promise<Uint8Array[]> => {
  const data = await tables();
  const updates: Uint8Array[] = [];
  for await (const docsyncUpdate of allPages(data.docsyncupdates, {
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': padId,
    },
    ConsistentRead: true,
  })) {
    if (docsyncUpdate && docsyncUpdate.data) {
      updates.push(Buffer.from(docsyncUpdate.data, 'base64'));
    }
  }

  return updates;
};

const fetchSnapshot = async (
  padId: string,
  version: string
): Promise<Uint8Array[]> => {
  const data = await tables();
  const updates: Uint8Array[] = [];
  for await (const snapshot of allPages(data.docsyncsnapshots, {
    IndexName: 'byDocsyncIdAndName',
    KeyConditionExpression: 'docsync_id = :docsync_id AND name = :name',
    ExpressionAttributeValues: {
      ':docsync_id': padId,
      ':name': getDefined(version),
    },
    ConsistentRead: true,
  })) {
    if (snapshot && snapshot.data) {
      updates.push(Buffer.from(snapshot.data, 'base64'));
    }
  }
  return updates;
};

export const getNotebookInitialState = async (
  padId: string,
  version?: string
): Promise<Uint8Array | undefined> => {
  const id = `/pads/${padId}`;

  const updates = await (version
    ? fetchSnapshot(id, version)
    : fetchUpdates(id));

  if (updates.length) {
    return mergeUpdates(updates);
  }
  return undefined;
};
