'use strict';
const arc = require('@architect/functions');
const tables = require('@architect/shared/tables');
const handle = require('@architect/shared/queues/handler');

const inTesting = !!process.env.JEST_WORKER_ID;

exports.handler = handle(notifySubscriptions);

async function notifySubscriptions({ userIds, type, changes }) {
  const data = await tables();

  for (const userId of userIds) {
    const subscriptions = (
      await data.subscriptions.query({
        IndexName: 'byUserAndType',
        KeyConditionExpression: 'user_id = :user_id and gqltype = :gqltype',
        ExpressionAttributeValues: {
          ':user_id': userId,
          ':gqltype': type,
        },
      })
    ).Items;

    if (subscriptions.length === 0) {
      return;
    }

    for (const sub of subscriptions) {
      const filter = sub.filter && JSON.parse(sub.filter);
      if (filter) {
        changes = applyFilter(changes, filter);
      }

      if (emptyChanges(changes)) {
        continue;
      }

      const payload = {
        data: {
          [sub.gqltype]: changes,
        },
      };
      await arc.ws.send({
        id: sub.connection_id,
        payload: { id: sub.id, type: 'next', payload },
      });

      if (process.env !== 'production' && !inTesting) {
        await arc.ws.send({
          id: sub.connection_id,
          payload: { id: sub.id, type: 'data', payload },
        });
      }
    }
  }
}

function applyFilter(changes, filterObject) {
  const filter = passesFilter(filterObject);
  return {
    added: changes.added.filter(filter),
    updated: changes.updated.filter(filter),
    removed: changes.removed,
  };
}

function passesFilter(filterObject) {
  return (o) => {
    for (const [key, value] of Object.entries(filterObject)) {
      if (o[key] !== value) {
        return false;
      }
    }
    return true;
  };
}

function emptyChanges(changes) {
  return (
    changes.added.length === 0 &&
    changes.updated.length === 0 &&
    changes.removed.length === 0
  );
}
