/* eslint-disable no-await-in-loop */
import arc from '@architect/functions';
import {
  ID,
  URI,
  DynamoDbQuery,
  Changes,
  TableRecord,
  TableRecordIdentifier,
} from '@decipad/backendtypes';
import tables from '../tables';

type SubscribeArguments = {
  subscriptionId: ID;
  connectionId: ID;
  user: TableRecordIdentifier;
  type: string;
  filter?: string;
};

async function subscribe<T extends TableRecord>({
  subscriptionId,
  connectionId,
  user,
  type,
  filter,
}: SubscribeArguments): Promise<AsyncIterable<Changes<T>>> {
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

async function notifyOne<T extends TableRecord>(
  user: TableRecordIdentifier,
  type: string,
  changes: Changes<T>
) {
  await notifyMany([user.id], type, changes);
}

async function notifyMany<T extends TableRecord>(
  userIds: ID[],
  type: string,
  changes: Changes<T>
) {
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

async function notifyAllWithAccessTo<T extends TableRecord>(
  resource: URI,
  type: string,
  _changes: Changes<T>
) {
  const changes = canonifyChanges(_changes);
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

function fakeAsyncIterable<T extends TableRecord>(): AsyncIterable<Changes<T>> {
  return {
    [Symbol.asyncIterator]() {
      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        next(): Promise<any> {
          return new Promise(() => {
            // do nothing
          });
        },
      };
    },
  };
}

function canonifyChanges<T extends TableRecord>(
  changes: Changes<T>
): Changes<T> {
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
