const Encoder = require('kafkajs/src/protocol/encoder')
const Decoder = require('kafkajs/src/protocol/decoder')

async function metadata (request) {
  const {
    reply,
    payload,
    log,
    conf
  } = request

  const decoder = new Decoder(payload)

  const topicCount = decoder.readInt32()
  let topics = []

  for (let topicIndex = 0; topicIndex < topicCount; topicIndex++) {
    const topicName = decoder.readString()
    topics.push(topicName)
  }

  decoder.readBoolean() // allowTopicCreation, not used

  const response = new Encoder()

  response.writeInt32(0) // throttle_time_ms

  response.writeInt32(1) // brokers.length
  response.writeInt32(conf.nodeId) // node_id
  response.writeString(conf.host)
  response.writeInt32(conf.port)
  response.writeString(null)

  response.writeString(conf.clusterId)
  response.writeInt32(conf.controllerId || 0)

  topics = await log.topics()

  response.writeInt32(topics.length)
  for (const topic of topics) {
    response.writeInt16(topic.errorCode)
    response.writeString(topic.name)
    response.writeBoolean(topic.isInternal)

    const partitions = topic.partitions
    response.writeInt32(partitions.length)
    for (const partition of partitions) {
      response.writeInt16(partition.errorCode)
      response.writeInt32(partition.partitionIndex)
      response.writeInt32(partition.leaderId)

      response.writeInt32(partition.replicaNodes.length)
      for (const replicaNode of partition.replicaNodes) {
        response.writeInt32(replicaNode)
      }

      response.writeInt32(partition.isrNodes.length)
      for (const isrNode of partition.isrNodes) {
        response.writeInt32(isrNode)
      }

      response.writeInt32(partition.offlineReplicas.length)
      for (const offlineReplica of partition.offlineReplicas) {
        response.writeInt32(offlineReplica)
      }
    }
  }

  reply(response.buffer)
}

module.exports = metadata
