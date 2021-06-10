import arc from '@architect/functions';
import tables from '../tables';

type SubscribeArguments = {
  subscriptionId: ID
  connectionId: ID
  user: TableRecordIdentifier,
  type: string,
  filter?: string
};

async function subscribe({subscriptionId, connectionId, user, type, filter }: SubscribeArguments): Promise<AsyncIterable<TableRecordChanges<any>>> {
  const data = await tables();
  const newSubscription = {
    id: subscriptionId,
    connection_id: connectionId,
    user_id: user.id,
    gqltype: type,
    filter,
  };
  await data.subscriptions.put(newSubscription);

  // We return a fake async iterator because, in reality,
  // updates are sent through another process.
  return fakeAsyncIterable();
}

async function notifyOne(user: TableRecordIdentifier, type: string, changes: TableRecordChanges<any>) {
  await notifyMany([user.id], type, changes);
}

async function notifyMany(userIds: ID[], type: string, changes: TableRecordChanges<any>) {
  changes = canonifyChanges(changes);
  await arc.queues.publish({
    name: `notify-subscriptions`,
    payload: {
      userIds,
      type,
      changes,
    },
  });
}

async function notifyAllWithAccessTo(resource: URI, type: string, changes: TableRecordChanges<any>) {
  changes = canonifyChanges(changes);
  const data = await tables();

  let lastKey;
  do {
    const q: DynamoDbQuery = {
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': resource,
      },
    };

    if (lastKey) {
      q.ExclusiveStartKey = lastKey;
    }

    const permissionsQueryResult = await data.permissions.query(q);
    lastKey = permissionsQueryResult.LastEvaluatedKey;

    const userIds = permissionsQueryResult.Items.filter(
      (p) => p.user_id && p.user_id !== 'null'
    ).map((p) => p.user_id);

    await notifyMany(userIds, type, changes);
  } while (lastKey);
}

function fakeAsyncIterable(): AsyncIterable<TableRecordChanges<any>> {
  return {
    [Symbol.asyncIterator]() {
      return {
        next(): Promise<any> {
          return new Promise(() => {
            // do nothing
          });
        },
      }
    }
  };
}

function canonifyChanges(changes: TableRecordChanges<any>): TableRecordChanges<any> {
  if (!changes.added) {
    changes.added = [];
  }
  if (!changes.removed) {
    changes.removed = [];
  }
  if (!changes.updated) {
    changes.updated = [];
  }

  return changes;
}

export { subscribe, notifyOne, notifyMany, notifyAllWithAccessTo };
