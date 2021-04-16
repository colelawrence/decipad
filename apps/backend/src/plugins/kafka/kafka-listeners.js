const { Kafka } = require('kafkajs')
const assert = require('assert')

async function createListeners(group, topics) {
  console.log('CREATE LISTENERS, topics:', topics)
  const kafka = new Kafka({
    clientId: 'sandbox-client',
    brokers: ['localhost:9092']
  })

  const consumer = kafka.consumer({
    groupId: group,
    allowAutoTopicCreation: true
  })

  async function start() {
    await consumer.connect()

    for (let topic in topics) {
      await consumer.subscribe({ topic })
    }

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const handler = topics[topic]
        assert(handler, `unexpected topic ${topic}`)
        const payload = {
          Records: [{
            topic,
            partition,
            key: message.key.toString(),
            value: message.value.toString(),
            offset: message.offset,
            timestamp: message.timestamp
          }]
        }
        await handler(payload)
      }
    })
  }

  function stop() {
    return consumer.disconnect()
  }

  return {
    start,
    stop
  }

}

module.exports = createListeners
