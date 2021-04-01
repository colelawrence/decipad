const Encoder = require('kafkajs/src/protocol/encoder');
const Decoder = require('kafkajs/src/protocol/decoder');
const errorCodes = require('../error-codes');

const MAGIC_BYTE = 2;

function fetch(request) {
  const { reply, payload, log } = request;

  const decoder = new Decoder(payload);

  const replicaId = decoder.readInt32();
  const maxWaitMs = decoder.readInt32();
  const minBytes = decoder.readInt32();
  const maxBytes = decoder.readInt32();
  const isolationLevel = decoder.readInt8();
  const sessionId = decoder.readInt32();
  const sessionEpoch = decoder.readInt32();

  const topicCount = decoder.readInt32();
  const topics = [];
  const partitionsByTopicName = {};
  for (let topicIndex = 0; topicIndex < topicCount; topicIndex++) {
    const topic = decoder.readString();

    const partitionCount = decoder.readInt32();
    const partitions = [];
    const partitionIndexes = [];
    for (
      let partitionIndex = 0;
      partitionIndex < partitionCount;
      partitionIndex++
    ) {
      const partitionIndex = decoder.readInt32();
      partitions.push({
        partition: partitionIndex,
        currentLeaderEpoch: decoder.readInt32(),
        fetchOffset: decoder.readInt64(),
        logStartOffset: decoder.readInt64(),
        partitionMaxBytes: decoder.readInt32(),
      });
      partitionIndexes.push(partitionIndex);
    }

    topics.push({
      topic,
      partitions,
    });
    partitionsByTopicName[topic] = partitionIndexes;
  }

  let replied = false;
  let lastResult;

  return new Promise((resolve, reject) => {
    (async () => {
      try {
        await tryFetch();

        if (!resultHasData(lastResult)) {
          const onNewTopicData = async (topic, partition) => {
            const waitingForTopicPartitions = partitionsByTopicName[topic];
            if (
              waitingForTopicPartitions &&
              waitingForTopicPartitions.indexOf(partition) >= 0
            ) {
              await tryFetch();
              if (resultHasData(lastResult)) {
                log.events.off('new topic data', onNewTopicData);
                clearTimeout(timeout);
                sendFetchReply();
              }
            }
          };

          const timeout = setTimeout(() => {
            log.events.off('new topic data', onNewTopicData);
            sendFetchReply();
          }, maxWaitMs);

          log.events.on('new topic data', onNewTopicData);
        } else {
          sendFetchReply();
        }
      } catch (err) {
        reject(err);
      }
    })();

    async function tryFetch() {
      lastResult = await log.fetch({
        replicaId,
        maxWaitMs,
        minBytes,
        maxBytes,
        isolationLevel,
        sessionId,
        sessionEpoch,
        topics,
      });
    }

    function sendFetchReply() {
      if (replied) {
        return;
      }
      replied = true;
      const response = new Encoder();

      response.writeInt32(0); // throttle_time_ms
      response.writeInt16(errorCodes.NONE);
      response.writeInt32(sessionId);

      response.writeInt32(lastResult.topics.length);
      for (const topicResponse of lastResult.topics) {
        const { topic, partitions } = topicResponse;
        response.writeString(topic);

        response.writeInt32(partitions.length);
        for (const partition of partitions) {
          response.writeInt32(partition.partition);
          response.writeInt16(partition.errorCode);
          response.writeInt64(partition.highWatermark);
          response.writeInt64(partition.lastStableOffset);
          response.writeInt64(partition.logStartOffset);

          response.writeInt32(partition.abortedTransactions.length);
          for (const abortedTransaction of partition.abortedTransactions) {
            response.writeInt64(abortedTransaction.producerId);
            response.writeInt64(abortedTransaction.firstOffset);
          }

          // messages
          const { recordBatch } = partition;
          const recordBatchEncoder = new Encoder();
          recordBatchEncoder.writeInt64(recordBatch.firstOffset);

          const innerRecordEncoder = new Encoder();
          innerRecordEncoder.writeInt32(recordBatch.partitionLeaderEpoch);
          innerRecordEncoder.writeInt8(MAGIC_BYTE);
          innerRecordEncoder.writeInt32(recordBatch.crc);
          innerRecordEncoder.writeInt16(recordBatch.attributes);
          innerRecordEncoder.writeInt32(recordBatch.lastOffsetDelta);
          innerRecordEncoder.writeInt64(recordBatch.firstTimestamp);
          innerRecordEncoder.writeInt64(recordBatch.maxTimestamp);
          innerRecordEncoder.writeInt64(recordBatch.producerId);
          innerRecordEncoder.writeInt16(recordBatch.producerEpoch);
          innerRecordEncoder.writeInt32(recordBatch.firstSequence);

          const { records } = recordBatch;
          innerRecordEncoder.writeInt32(records.length);
          for (const record of records) {
            const recordEncoder = new Encoder();
            recordEncoder.writeInt8(record.attributes);
            recordEncoder.writeVarLong(record.timestampDelta);
            recordEncoder.writeVarInt(record.offsetDelta);
            recordEncoder.writeVarIntBytes(record.key);
            recordEncoder.writeVarIntBytes(record.value);
            recordEncoder.writeInt32(record.headers.length);
            for (const header of record.headers) {
              recordEncoder.writeVarIntString(header.key);
              recordEncoder.writeVarIntBytes(header.value);
            }

            innerRecordEncoder.writeVarIntBytes(recordEncoder.buffer);
          }

          const innerRecordBuffer = innerRecordEncoder.buffer;
          recordBatchEncoder.writeInt32(innerRecordBuffer.length);
          recordBatchEncoder.writeBuffer(innerRecordBuffer);

          const recordBatchBuffer = recordBatchEncoder.buffer;
          response.writeInt32(recordBatchBuffer.length);
          response.writeBuffer(recordBatchBuffer);
        }
      }

      reply(response.buffer);
      resolve();
    }
  });
}

function resultHasData(result) {
  return result.topics.some((topic) => {
    return topic.partitions.some((partition) => {
      return partition.recordBatch.records.length > 0;
    });
  });
}

module.exports = fetch;
