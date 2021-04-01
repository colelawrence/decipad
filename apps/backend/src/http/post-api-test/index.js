const { producer } = require('@architect/shared/kafka')
const handle = require('@architect/shared/handle')

exports.handler = handle(async (event) => {
  const p = await producer()
  const messages = Object.entries(event.queryStringParameters)
    .map(([key, value]) => ({ key, value }))

  return p.send({
    topic: 'topic1',
    messages
  })
})
