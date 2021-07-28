import { HttpResponse } from '@architect/functions';
import { WSRequest } from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { wrapHandler } from '@decipad/services/monitor';

export const handler = wrapHandler(async function ws(
  event: WSRequest
): Promise<HttpResponse> {
  const data = await tables();

  const collabs = await data.collabs.query({
    IndexName: 'conn-index',
    KeyConditionExpression: 'conn = :conn',
    ExpressionAttributeValues: {
      ':conn': event.requestContext.connectionId,
    },
  });

  for (const collab of collabs.Items) {
    await data.collabs.delete({ id: collab.id });
  }

  await data.connections.delete({
    id: event.requestContext.connectionId,
  });

  const subscriptions = await data.subscriptions.query({
    IndexName: 'byConnection',
    KeyConditionExpression: 'connection_id = :connection_id',
    ExpressionAttributeValues: {
      ':connection_id': event.requestContext.connectionId,
    },
  });

  for (const subscription of subscriptions.Items) {
    await data.subscriptions.delete({ id: subscription.id });
    console.log(
      'removed 1 subscription for %s for user %s',
      subscription.gqltype,
      subscription.user_id
    );
  }

  return { statusCode: 200 };
});
