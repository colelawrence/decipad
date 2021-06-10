'use strict';

const { Kafka } = require('kafkajs');

async function ensureTopics(topics, partitionsPerTopic) {
  const kafka = new Kafka({
    clientId: 'sandbox-client',
    brokers: ['localhost:9092'],
  });

  const admin = kafka.admin();

  const existingTopics = await admin.listTopics();

  const topicsToCreate = topics.filter((topic) => {
    return existingTopics.indexOf(topic) < 0;
  });

  console.log('Going to create topics', topicsToCreate);

  await admin.createTopics({
    topics: topicsToCreate.map((topic) => ({
      topic,
      numPartitions: partitionsPerTopic[topic],
    })),
  });
  await admin.disconnect();
}

module.exports = ensureTopics;
