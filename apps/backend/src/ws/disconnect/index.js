const arc = require('@architect/functions')

exports.handler = async function ws(event) {
  const tables = await arc.tables()

  const collabs = await tables.collabs.query({
    IndexName: 'conn-index',
    KeyConditionExpression: 'conn = :conn',
    ExpressionAttributeValues: {
      ':conn': event.requestContext.connectionId
    }
  })

  for (const collab of collabs.Items) {
    await tables.collabs.delete({ id: collab.id })
  }

  await tables.connections.delete({
    id: event.requestContext.connectionId
  })

  return { statusCode: 200 }
}