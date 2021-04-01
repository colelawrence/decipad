const Encoder = require('kafkajs/src/protocol/encoder')
const Decoder = require('kafkajs/src/protocol/decoder')

async function listOffsets (request) {
  const {
    // clientId,
    reply,
    log,
    payload
    // groupManager
  } = request

  const decoder = new Decoder(payload)

  decoder.readInt32() // replicaId
  decoder.readInt8() // isolationLevel
  const topicCount = decoder.readInt32()

  const topics = []
  for (let topicIndex = 0; topicIndex < topicCount; topicIndex++) {
    const topicName = decoder.readString()
    const partitionCount = decoder.readInt32()
    const partitions = []
    for (let partitionIndex = 0; partitionIndex < partitionCount; partitionIndex++) {
      partitions.push({
        partitionIndex: decoder.readInt32(),
        timestamp: decoder.readInt64()
      })
    }
    topics.push({
      topicName,
      partitions
    })
  }

  const partitionOffsetsByTopic = await log.listOffsets(topics)

  const response = new Encoder()

  response.writeInt32(0) // throttle_time_ms

  const partitionOffsetsByTopicEntries = Object.entries(partitionOffsetsByTopic)
  response.writeInt32(partitionOffsetsByTopicEntries.length)
  for (const [topicName, partitions] of partitionOffsetsByTopicEntries) {
    response.writeString(topicName)
    response.writeInt32(partitions.length)
    for (const partition of partitions) {
      const { partitionIndex, errorCode, timestamp, offset } = partition
      response.writeInt32(partitionIndex)
      response.writeInt16(errorCode)
      response.writeInt64(timestamp)
      response.writeInt64(offset)
    }
  }

  reply(response.buffer)
}

module.exports = listOffsets
