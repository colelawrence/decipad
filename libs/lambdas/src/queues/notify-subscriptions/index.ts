import arc from '@architect/functions';
import { Changes, TableRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import handle from '../handle';

type NotifySubscriptionsArgs = {
  userIds: string[];
  type: string;
  changes: Changes<TableRecord>;
};

const inTesting = !!process.env.JEST_WORKER_ID;

export const handler = handle(notifySubscriptions);

async function notifySubscriptions(args: NotifySubscriptionsArgs) {
  const { userIds, type, changes } = args;
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
      let sendChanges = changes;
      if (filter) {
        sendChanges = applyFilter(sendChanges, filter);
      }

      if (emptyChanges(sendChanges)) {
        continue;
      }

      const payload = {
        data: {
          [sub.gqltype]: sendChanges,
        },
      };
      await arc.ws.send({
        id: sub.connection_id,
        payload: { id: sub.id, type: 'next', payload },
      });

      if (process.env.NODE_ENV !== 'production' && !inTesting) {
        await arc.ws.send({
          id: sub.connection_id,
          payload: { id: sub.id, type: 'data', payload },
        });
      }
    }
  }
}

function applyFilter(
  changes: Changes<any>,
  filterObject: Record<string, any>
): Changes<any> {
  const filter = passesFilter(filterObject);
  return {
    added: changes.added?.filter(filter),
    updated: changes.updated?.filter(filter),
    removed: changes.removed,
  };
}

function passesFilter(filterObject: Record<string, any>) {
  return (o: any): boolean => {
    for (const [key, value] of Object.entries(filterObject)) {
      if (o[key] !== value) {
        return false;
      }
    }
    return true;
  };
}

function emptyChanges(changes: Changes<any>) {
  return (
    (!changes.added || changes.added.length === 0) &&
    (!changes.updated || changes.updated.length === 0) &&
    (!changes.removed || changes.removed.length === 0)
  );
}
