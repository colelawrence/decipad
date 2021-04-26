const Encoder = require('kafkajs/src/protocol/encoder');
const Decoder = require('kafkajs/src/protocol/decoder');
const errorCodes = require('../error-codes');

async function offsetFetch(request) {
  const {
    // clientId,
    reply,
    // log,
    payload,
    groupManager,
  } = request;

  const decoder = new Decoder(payload);

  const groupId = decoder.readString();
  const topicCount = decoder.readInt32();
  const topics = {};
  for (let topicIndex = 0; topicIndex < topicCount; topicIndex++) {
    const topicName = decoder.readString();
    const partitionIndexCount = decoder.readInt32();
    const partitionIndexes = [];
    for (
      let partitionIndexIndex = 0;
      partitionIndexIndex < partitionIndexCount;
      partitionIndexIndex++
    ) {
      partitionIndexes.push(decoder.readInt32());
    }
    topics[topicName] = partitionIndexes;
  }

  const result = await groupManager.offsetFetch(groupId, topics);

  const response = new Encoder();

  response.writeInt32(0); // throttle_time_ms

  const entries = Object.entries(result);
  response.writeInt32(entries.length);
  for (const [topicName, partitions] of entries) {
    response.writeString(topicName);
    response.writeInt32(partitions.length);
    for (const partition of partitions) {
      const { partitionIndex, committedOffset } = partition;
      response.writeInt32(partitionIndex);
      response.writeInt64(committedOffset);
      response.writeString(null);
      response.writeInt16(errorCodes.NONE);
    }
  }

  response.writeInt16(errorCodes.NONE); // error_code

  reply(response.buffer);
}

module.exports = offsetFetch;
