'use strict';

const arc = require('@architect/functions');
const tables = require('../tables');

async function subscribe({ subscriptionId, connectionId, user, type }) {
  const data = await tables();
  const newSubscription = {
    id: subscriptionId,
    connection_id: connectionId,
    user_id: user.id,
    gqltype: type,
  };
  await data.subscriptions.put(newSubscription);

  // We return a fake async iterator because, in reality,
  // updates are sent through another process.
  return fakeAsyncIterator();
}

async function notifyOne(user, type, changes) {
  await notifyMany([user.id], type, changes);
}

async function notifyMany(userIds, type, changes) {
  changes = canonifyChanges(changes);
  await arc.queues.publish({
    name: `notify-subscriptions`,
    payload: {
      userIds,
      type,
      changes
    },
  });
}

async function notifyAllWithAccessTo(resource, type, changes) {
  changes = canonifyChanges(changes);
  const data = await tables();

  let lastKey;
  do {
    const q = {
      IndexName: 'byResource',
      KeyConditionExpression:
        'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': resource,
      }
    };

    if (lastKey) {
      q.ExclusiveStartKey = lastKey;
    }

    const permissionsQueryResult = await data.permissions.query(q);
    lastKey = permissionsQueryResult.LastEvaluatedKey;

    const userIds = permissionsQueryResult.Items
      .filter((p) => p.user_id && p.user_id !== 'null')
      .map((p) => p.user_id);

    await notifyMany(userIds, type, changes);
  } while (lastKey);
}

module.exports.subscribe = subscribe;
module.exports.notifyOne = notifyOne;
module.exports.notifyMany = notifyMany;
module.exports.notifyAllWithAccessTo = notifyAllWithAccessTo;

function fakeAsyncIterator() {
  return {
    async *[Symbol.asyncIterator]() {
      // do nothing
    },
  };
}

function canonifyChanges(changes) {
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