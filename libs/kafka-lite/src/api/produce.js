const Encoder = require('kafkajs/src/protocol/encoder');
const Decoder = require('kafkajs/src/protocol/decoder');
const RecordBatchDecoder = require('kafkajs/src/protocol/recordBatch/v0/decoder');

async function produce(request) {
  const { reply, payload, log } = request;

  let decoder = new Decoder(payload);

  decoder.readString(); // transactionalId
  decoder.readInt16(); // acks
  decoder.readInt32(); // timeout

  const topicCount = decoder.readInt32();
  const topics = [];

  for (let topicIndex = 0; topicIndex < topicCount; topicIndex++) {
    const topicName = decoder.readString();
    const topic = {
      name: topicName,
      partitions: [],
    };

    const dataCount = decoder.readInt32();

    for (let dataIndex = 0; dataIndex < dataCount; dataIndex++) {
      const partition = decoder.readInt32();

      decoder.readInt32(); // partitionSize
      const encodedRecordBatch = decoder.readAll();
      const recordBatchDecoder = new Decoder(encodedRecordBatch);
      const decodedRecordBatch = await RecordBatchDecoder(recordBatchDecoder);
      topic.partitions.push({
        partition,
        decodedRecordBatch,
        encodedRecordBatch,
      });

      decoder = new Decoder(recordBatchDecoder.readAll());
    }

    topics.push(topic);
  }

  const topicsResponse = await log.storeTopicsRecords(topics);

  const response = new Encoder();

  response.writeInt32(topicsResponse.length);

  for (const topic of topicsResponse) {
    response.writeString(topic.name);
    response.writeInt32(topic.partitions.length);
    for (const partition of topic.partitions) {
      response
        .writeInt32(partition.partition)
        .writeInt16(partition.errorCode)
        .writeInt64(partition.baseOffset)
        .writeInt64(partition.logAppendTime)
        .writeInt64(partition.logStartOffset);
    }
  }

  response.writeInt32(0); // throttle_time_ms

  reply(response.buffer);
}

module.exports = produce;
