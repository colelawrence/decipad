const Encoder = require('kafkajs/src/protocol/encoder')
const Decoder = require('kafkajs/src/protocol/decoder')

async function offsetCommit (request) {
  const {
    // clientId,
    reply,
    // log,
    payload,
    groupManager
  } = request

  const decoder = new Decoder(payload)

  const groupId = decoder.readString()
  decoder.readInt32() // generation_id
  decoder.readString() // member_id

  const topicCount = decoder.readInt32()
  const topics = {}
  for (let topicIndex = 0; topicIndex < topicCount; topicIndex++) {
    const topicName = decoder.readString()
    const partitionIndexCount = decoder.readInt32()
    const partitions = []
    for (let partitionIndexIndex = 0; partitionIndexIndex < partitionIndexCount; partitionIndexIndex++) {
      partitions.push({
        partitionIndex: decoder.readInt32(),
        committedOffset: decoder.readInt64(),
        committedMetadata: decoder.readString()
      })
    }
    topics[topicName] = partitions
  }

  const result = await groupManager.offsetCommit(groupId, topics)

  const response = new Encoder()

  response.writeInt32(0) // throttle_time_ms

  const entries = Object.entries(result)
  response.writeInt32(entries.length)
  for (const [topicName, partitions] of entries) {
    response.writeString(topicName)
    response.writeInt32(partitions.length)
    for (const partition of partitions) {
      const { partitionIndex, errorCode } = partition
      response.writeInt32(partitionIndex)
      response.writeInt16(errorCode)
    }
  }

  reply(response.buffer)
}

module.exports = offsetCommit
