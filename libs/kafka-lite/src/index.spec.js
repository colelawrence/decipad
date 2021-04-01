'use strict';

/* eslint-env jest */

const { Kafka } = require('kafkajs');
const { join } = require('path');
const rimraf = require('rimraf');
const process = require('process');
const createServer = require('./server');

const conf = { clusterId: 'test-cluster', nodeId: 0 };

describe('kafka lite', () => {
  let kafka;
  let server;
  let producer;
  let consumer;

  beforeAll((done) => {
    rimraf(join(process.cwd(), '.kafka_lite_data'), done);
  });

  beforeAll(async (done) => {
    server = await createServer(conf);
    server.listen(2181, 'localhost', () => {
      console.log('server listening...');
      done();
    });
  });

  beforeAll(async () => {
    kafka = new Kafka({
      clientId: 'DEF',
      brokers: ['localhost:2181'],
    });

    producer = kafka.producer();

    await producer.connect();
  });

  afterAll(async () => {
    if (producer) {
      await producer.disconnect();
    }
  });

  afterAll(async () => {
    if (consumer) {
      await consumer.disconnect();
    }
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    }
  });

  it('can produce topic', async () => {
    const admin = kafka.admin();
    await admin.createTopics({
      topics: [
        {
          topic: 'test-topic',
        },
      ],
    });
    await admin.disconnect();
  });

  it('can produce', async () => {
    await producer.send({
      topic: 'test-topic',
      messages: [
        { key: 'abcd', value: 'ABCD' },
        { key: 'efgh', value: 'EFGH' },
      ],
    });
  });

  it('can connect consumer', async () => {
    consumer = kafka.consumer({
      groupId: 'test-group',
    });

    await consumer.connect();
  });

  it('consumer can subscribe', async () => {
    await consumer.subscribe({
      topic: 'test-topic',
    });
  });

  it('can receive messages', (done) => {
    const expectedMessages = [
      { key: 'abcd', value: 'ABCD' },
      { key: 'efgh', value: 'EFGH' },
    ];

    consumer.run({
      eachMessage: async ({ message }) => {
        const expectedMessage = expectedMessages.shift();
        expect(message.key.toString()).toEqual(expectedMessage.key);
        expect(message.value.toString()).toEqual(expectedMessage.value);
        if (expectedMessages.length === 0) {
          done();
        }
      },
    });
  });

  it('can stop the consumer', () => {
    return consumer.stop();
  });

  it('consumer can disconnect', async () => {
    await consumer.disconnect();
    consumer = null;
  });

  it('producer can disconnect', async () => {
    await producer.disconnect();
    producer = null;
  });

  it('producer can reconnect again', () => {
    producer = kafka.producer();
    return producer.connect();
  });

  it('can produce more messages', async () => {
    const result = await producer.send({
      topic: 'test-topic',
      messages: [
        { key: 'ijkl', value: 'IJKL' },
        { key: 'mnop', value: 'MNOP' },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0].baseOffset).toBe('2');
  });

  it('consumer can reconnect again', async () => {
    consumer = kafka.consumer({
      groupId: 'test-group',
    });

    await consumer.connect();
  });

  it('consumer can subscribe', async () => {
    await consumer.subscribe({
      topic: 'test-topic',
    });
  });

  it('new messages can be consumed', (done) => {
    const expectedMessages = [
      { key: 'ijkl', value: 'IJKL' },
      { key: 'mnop', value: 'MNOP' },
    ];
    consumer.run({
      eachMessage: async ({ message }) => {
        const expectedMessage = expectedMessages.shift();
        expect(message.key.toString()).toEqual(expectedMessage.key);
        expect(message.value.toString()).toEqual(expectedMessage.value);
        if (expectedMessages.length === 0) {
          done();
        }
      },
    });
  });
});

function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
