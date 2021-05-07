const tables = require('@architect/shared/tables');

exports.handler = async function ws(event) {
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

  return { statusCode: 200 };
};
