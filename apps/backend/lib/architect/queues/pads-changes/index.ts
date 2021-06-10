import assert from 'assert';
import tables from '../../../tables';
import allPages from '../../../tables/all-pages';
import handle from '../../../queues/handler';

export const handler = handle(padsChangesHandler);

async function padsChangesHandler(event: TableRecordChanges<Pad>) {
  const { table, action, args } = event;

  assert.equal(table, 'pads');

  if (action === 'delete') {
    await handlePadDelete(args);
  }
}

async function handlePadDelete({ id } : TableRecordIdentifier) {
  const resource = `/pads/${id}`;
  const data = await tables();

  const query = {
    IndexName: 'byResource',
    KeyConditionExpression:
      'resource_uri = :resource_uri',
    ExpressionAttributeValues: {
      ':resource_uri': resource,
    },
  };

  for await (const perm of allPages(data.permissions, query)) {
    await data.permissions.delete({ id: perm.id });
  }
}