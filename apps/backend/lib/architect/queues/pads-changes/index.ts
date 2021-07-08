import assert from 'assert';
import tables from '../../../tables';
import allPages from '../../../tables/all-pages';
import handle from '../../../queues/handler';
import { remove } from '../../../s3/pads';

export const handler = handle(padsChangesHandler);

async function padsChangesHandler(event: TableRecordChanges<Pad>) {
  const { table, action, args } = event;

  assert.equal(table, 'pads');

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

  await remove(id);
}
