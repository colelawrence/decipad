const Encoder = require('kafkajs/src/protocol/encoder');
const Decoder = require('kafkajs/src/protocol/decoder');

async function createTopics(request) {
  const { reply, payload, log } = request;

  const decoder = new Decoder(payload);

  const topicCount = decoder.readInt32();
  let topics = [];

  for (let topicIndex = 0; topicIndex < topicCount; topicIndex++) {
    const topicName = decoder.readString();
    const numPartitions = decoder.readInt32();
    const replicationFactor = decoder.readInt16();

    const assignments = [];
    const assignmentsCount = decoder.readInt32();
    for (
      let assignmentsIndex = 0;
      assignmentsIndex < assignmentsCount;
      assignmentsIndex++
    ) {
      const partitionIndex = decoder.readInt32();

      const brokerIdsCount = decoder.readInt32();
      const brokerIds = [];
      for (
        let brokerIdIndex = 0;
        brokerIdIndex < brokerIdsCount;
        brokerIdIndex++
      ) {
        brokerIds.push(decoder.readInt32());
      }

      assignments.push({
        partitionIndex,
        brokerIds,
      });
    }

    const configsCount = decoder.readInt32();
    const configs = [];
    for (let configsIndex = 0; configsIndex < configsCount; configsIndex++) {
      configs.push({
        name: decoder.readString(),
        value: decoder.readString(),
      });
    }

    const topic = {
      name: topicName,
      numPartitions,
      replicationFactor,
      assignments,
      configs,
    };

    topics.push(topic);
  }

  const topicsResponse = await log.createTopics(topics);

  const response = new Encoder();

  response.writeInt32(0); // throttle_time
  response.writeInt32(topicsResponse.length);

  for (const topic of topicsResponse) {
    response.writeString(topic.name);
    response.writeInt16(topic.errorCode);
    response.writeString(topic.errorMessage);
  }

  reply(response.buffer);
}

module.exports = createTopics;
