import assert from 'assert';
import {
  TableRecordChanges,
  TableRecordIdentifier,
  Pad,
} from '@decipad/backendtypes';
import tables, { allPages } from '@decipad/services/tables';
import handle from '../handle';

export const handler = handle(padsChangesHandler);

async function padsChangesHandler(event: TableRecordChanges<Pad>) {
  const { table, action, args } = event;

  assert.strictEqual(table, 'pads');

  if (action === 'delete') {
    await handlePadDelete(args);
  }
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
      await data.permissions.delete({ id: perm.id });
    }
  }

  for await (const attachment of allPages(data.fileattachments, query)) {
    if (attachment) {
      await data.fileattachments.delete({ id: attachment.id });
    }
  }

  for await (const update of allPages(data.docsyncupdates, {
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      id: resource,
    },
  })) {
    if (update) {
      await data.docsyncupdates.delete({ id: update.id, seq: update.seq });
    }
  }

  await data.docsync.delete({ id });
}
