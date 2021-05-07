const arc = require('@architect/functions');
const tables = require('@architect/shared/tables');
let { nanoid } = require('nanoid');

/**
 * append a timestamp and echo the message back to the connectionId
 */
exports.handler = async function ws(event) {
  const [op, topic] = JSON.parse(event.body);

  const data = await tables();

  const connId = event.requestContext.connectionId;

  const connection = await data.connections.get({
    id: connId,
  });

  if (!connection) {
    return { statusCode: 403 };
  }

  switch (op) {
    case 'subscribe':
      await data.collabs.put({
        id: nanoid(),
        room: topic,
        user_id: connection.user_id,
        conn: connId,
      });

      await arc.ws.send({
        id: connId,
        payload: { o: 's', t: topic },
      });

      break;

    case 'unsubscribe':
      {
        const collabs = await data.collabs.query({
          IndexName: 'conn-index',
          KeyConditionExpression: 'conn = :conn',
          ExpressionAttributeValues: {
            ':conn': event.requestContext.connectionId,
          },
        });

        for (const collab of collabs.Items) {
          if (collab.room === topic) {
            await data.collabs.delete({ id: collab.id });
          }
        }

        await arc.ws.send({
          id: connId,
          payload: { o: 'u', t: topic },
        });
      }

      break;

    default:
      console.error(`Unknown operation ${op}`);
  }

  return { statusCode: 200 };
};
