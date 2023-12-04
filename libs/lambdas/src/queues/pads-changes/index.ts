import assert from 'assert';
import {
  TableRecordChanges,
  TableRecordIdentifier,
  Pad,
} from '@decipad/backendtypes';
import tables, { allPages } from '@decipad/tables';
import handle from '../handle';
import {
  indexNotebookSnapshot,
  removeNotebookIndex,
} from '@decipad/backend-search';

export const handler = handle(padsChangesHandler);

async function padsChangesHandler(event: TableRecordChanges<Pad>) {
  const { table, action, args } = event;

  assert.strictEqual(table, 'pads');

  if (action === 'delete') {
    return handlePadDelete(args);
  }
  if (action === 'put') {
    return handlePadPut(args);
  }
}

async function handlePadPut({ id }: TableRecordIdentifier) {
  const data = await tables();
  const notebook = await data.pads.get({ id });
  if (!notebook) {
    return;
  }
  if (notebook.isTemplate) {
    return indexNotebookSnapshot(id);
  }
  return removeNotebookIndex(id);
}

async function handlePadDelete({ id }: TableRecordIdentifier) {
  const resource = `/pads/${id}`;
  const data = await tables();

  const query = {
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource_uri',
    ExpressionAttributeValues: {
      ':resource_uri': resource,
    },
  };

  for await (const perm of allPages(data.permissions, query)) {
    if (perm) {
      await data.permissions.delete({ id: perm.id }, true);
    }
  }

  for await (const attachment of allPages(data.fileattachments, query)) {
    if (attachment) {
      await data.fileattachments.delete({ id: attachment.id }, true);
    }
  }

  for await (const update of allPages(data.docsyncupdates, {
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      id: resource,
    },
    ConsistentRead: true,
  })) {
    if (update) {
      await data.docsyncupdates.delete(
        { id: update.id, seq: update.seq },
        true
      );
    }
  }

  for await (const snapshot of allPages(data.docsyncsnapshots, {
    IndexName: 'byDocsyncId',
    KeyConditionExpression: 'docsync_id = :id',
    ExpressionAttributeValues: {
      id,
    },
  })) {
    if (snapshot) {
      await data.docsyncsnapshots.delete({ id: snapshot.id }, true);
    }
  }

  await data.docsync.delete({ id });
}
