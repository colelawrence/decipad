'use strict'

const { readdir, mkdir } = require('fs/promises')
const path = require('path')
const EventEmitter = require('events')
const serverError = require('./server-error')
const errorCodes = require('./error-codes')
const byPartitionIndex = require('./utils/by-partition-index')
const createLogTopicPartitionActor = require('./log-topic-partition-actor')

async function createLog (conf) {
  // const topics: Array<{error_code: int_16, name: string, is_internal: boolean, partitions: Array<Partition>}>

  const log = {
    createTopics,
    topics,
    storeTopicsRecords,
    fetch,
    listOffsets,
    close,
    events: new EventEmitter()
  }

  const topicsByName = new Map()

  async function init () {
    await mkdir(conf.dataDir, {
      recursive: true,
      mode: 0o700
    })

    const fileNames = await readdir(conf.dataDir)
    for (const fileName of fileNames) {
      const partitionSeparatorPos = fileName.lastIndexOf('_')
      if (partitionSeparatorPos <= 0) {
        continue
      }
      const topicName = fileName.substring(0, partitionSeparatorPos)
      const partitionIndex = parseInt(fileName.substring(partitionSeparatorPos + 1))
      let topic
      if (!topicsByName.has(topicName)) {
        topic = {
          name: topicName,
          errorCode: errorCodes.NONE,
          isInternal: false,
          numPartitions: 0,
          partitions: [],
          replicationFactor: 0,
          assignments: [],
          configs: []
        }
        topicsByName.set(topicName, topic)
      } else {
        topic = topicsByName.get(topicName)
      }
      topic.numPartitions++
      topic.partitions.push({
        errorCode: errorCodes.NONE,
        partitionIndex,
        leaderId: conf.nodeId,
        leaderEpoch: 1,
        replicaNodes: [conf.nodeId],
        isrNodes: [],
        offlineReplicas: []
      })

      topic.partitions.sort(byPartitionIndex)

      topic.assignments.push({
        partitionIndex: partitionIndex,
        brokerId: conf.nodeId
      })
    }
  }

  async function createTopic (topic) {
    const { name } = topic
    if (topicsByName.has(name)) {
      throw serverError('topic already exists', errorCodes.TOPIC_ALREADY_EXISTS)
    }

    const numPartitions = topic.numPartitions || 1
    const partitions = []
    for (let partitionIndex = 0; partitionIndex < numPartitions; partitionIndex++) {
      const partitionPath = path.join(conf.dataDir, `${name}_${partitionIndex}`)
      await mkdir(partitionPath, {
        recursive: true,
        mode: 0o700
      })

      partitions.push({
        errorCode: errorCodes.NONE,
        partitionIndex,
        leaderId: conf.nodeId,
        leaderEpoch: 1,
        replicaNodes: [conf.nodeId],
        isrNodes: [],
        offlineReplicas: []
      })
    }

    const assignments = topic.assignments && topic.assignments.length
      ? topic.assignments
      : partitions.map((partition, partitionIndex) => ({
        partitionIndex,
        brokerId: conf.nodeId
      }))

    const newTopic = {
      name: topic.name,
      errorCode: errorCodes.NONE,
      errorMessage: null,
      isInternal: false,
      numPartitions,
      partitions,
      replicationFactor: 0,
      assignments: assignments.map((assignment) => ({
        partitionIndex: assignment.partitionIndex,
        brokerId: assignment.brokerId
      })),
      configs: (topic.configs || []).map((config) => ({
        name: config.name,
        value: config.value
      }))
    }

    topicsByName.set(newTopic.name, newTopic)

    return newTopic
  }

  async function createTopics (topics) {
    const replyTopics = []
    for (const topic of topics) {
      replyTopics.push(await createTopic(topic))
    }

    log.events.emit('topics changed')

    return replyTopics
  }

  function topics (topics) {
    let retTopics = Array.from(topicsByName.values())
    if (topics) {
      retTopics = retTopics.filter((topic) => topics.indexOf(topic.name) >= 0)
    }

    return retTopics
  }

  async function storeTopicsRecords (topics) {
    const result = []
    for (const topic of topics) {
      result.push(await storeTopicRecords(topic))
    }

    return result
  }

  async function storeTopicRecords (topic) {
    const { name, partitions } = topic

    const topicRecord = topicsByName.get(name)
    if (!topicRecord) {
      throw serverError(`No topic named ${name}`, errorCodes.UNKNOWN_TOPIC_OR_PARTITION)
    }

    const topicReply = {
      name,
      partitions: []
    }
    for (const partitionRecords of partitions) {
      const { partition, decodedRecordBatch, encodedRecordBatch } = partitionRecords
      const partitionSaveResult = await save(topicRecord, partition, decodedRecordBatch, encodedRecordBatch)
      topicReply.partitions.push(partitionSaveResult)
    }

    return topicReply
  }

  async function save (topicRecord, partition, decodedRecordBatch, encodedRecordBatch) {
    const partitionRecord = topicRecord.partitions[partition]
    if (!partitionRecord) {
      throw serverError(
        `could not find partition with index ${partition} on topic ${topicRecord.name}`,
        errorCodes.UNKNOWN_TOPIC_OR_PARTITION)
    }
    if (!partitionRecord.actor) {
      partitionRecord.actor = await createLogTopicPartitionActor(conf, topicRecord.name, partition)
    }

    const result = await partitionRecord.actor.save(decodedRecordBatch, encodedRecordBatch)

    log.events.emit('new topic data', topicRecord.name, partition)

    return result
  }

  async function fetch (fetchReq) {
    const {
      maxWaitMs,
      // minBytes,
      // maxBytes,
      topics
    } = fetchReq

    const responseTopics = []

    for (const topicRequest of topics) {
      const { topic, partitions } = topicRequest
      const topicRecord = topicsByName.get(topic)
      if (!topicRecord) {
        throw serverError(`No topic named ${topic}`, errorCodes.UNKNOWN_TOPIC_OR_PARTITION)
      }

      const responsePartitions = []
      for (const partition of partitions) {
        const partitionIndex = partition.partition
        const partitionRecord = topicRecord.partitions[partitionIndex]
        if (!partitionRecord) {
          throw serverError(
            `could not find partition with index ${partitionIndex} on topic ${topicRecord.name}`,
            errorCodes.UNKNOWN_TOPIC_OR_PARTITION)
        }
        if (!partitionRecord.actor) {
          partitionRecord.actor = await createLogTopicPartitionActor(conf, topicRecord.name, partitionIndex)
        }

        const partitionResponse = await partitionRecord.actor.fetch(
            partition.fetchOffset,
            partition.partitionMaxBytes,
            maxWaitMs)

        responsePartitions.push(partitionResponse)
      }

      responseTopics.push({
        topic,
        partitions: responsePartitions
      })
    }

    return {
      topics: responseTopics
    }
  }

  async function listOffsets (topics) {
    const reply = {}

    for (const { topicName, partitions } of topics) {
      const replyPartitions = []

      const topicRecord = topicsByName.get(topicName)
      if (!topicRecord) {
        throw serverError(`No topic named ${topicName}`, errorCodes.UNKNOWN_TOPIC_OR_PARTITION)
      }

      for (const partition of partitions) {
        const { partitionIndex } = partition
        const partitionRecord = topicRecord.partitions[partitionIndex]
        if (!partitionRecord) {
          throw serverError(`No partition ${partitionIndex} in topic ${topicName}`, errorCodes.UNKNOWN_TOPIC_OR_PARTITION)
        }
        if (!partitionRecord.actor) {
          partitionRecord.actor = await createLogTopicPartitionActor(conf, topicRecord.name, partitionIndex)
        }
        replyPartitions.push({
          partitionIndex,
          timestamp: Date.now(),
          errorCode: errorCodes.NONE,
          offset: partitionRecord.actor.committedOffset()
        })
      }
      reply[topicName] = replyPartitions
    }

    return reply
  }

  function close () {
    // TODO
  }

  await init()

  return log
}

module.exports = createLog
