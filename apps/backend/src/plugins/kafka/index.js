const invokeLambda = require('@architect/sandbox/src/invoke-lambda');
const path = require('path');
const { readFileSync } = require('fs');
const assert = require('assert');
const kafkaServer = require('../../../../../libs/kafka-lite/src/server');
const createKafkaListeners = require('./kafka-listeners');
const ensureTopics = require('./ensure-topics');

console.log('loading kafka plugin...');

function extendCloudFormation({ cloudformation }) {
  return cloudformation; // do nothing for now
}

let kafka;
let listeners;

function pluginFunctions({ arc }) {
  const consumers = getConsumers(arc);
  const lambdas = consumers.map((topic) => {
    const src = lambdaSourceFromTopic(topic.consumerGroup, topic.topic);
    const indexFile = path.join(src, 'index.js');
    return {
      src,
      body: readFileSync(indexFile, { encoding: 'utf8' }),
      config: {
        runtime: 'nodejs',
        timeout: 30,
      },
    };
  });

  return lambdas;
}

function start({ arc, inventory, services }, callback) {
  console.log('inventiry:', JSON.stringify(inventory, null, '\t'));
  console.log('starting kafka-lite...');
  if (services.kafka) {
    throw new Error('kafka service already defined');
  }
  if (services.kafka_listeners) {
    throw new Error('kafka listeners already defined');
  }

  const consumers = getConsumers(arc);

  const topics = consumers.reduce((topics, consumer) => {
    const topic = consumer.topic;
    if (topics.indexOf(topic) < 0) {
      topics.push(topic);
    }
    return topics;
  }, []);

  const partitionsPerTopic = consumers.reduce((topics, consumer) => {
    const topic = consumer.topic;
    if (!topics[topic]) {
      topics[topic] = consumer.numPartitions;
    } else {
      const expectedNumPartitions = consumer.numPartitions;
      if (topics[topic].numPartitions !== expectedNumPartitions) {
        throw new Error(
          `expected partition count for topic ${topic} to be ${expectedNumPartitions} (instead of ${topics[topic].numPartitions}) as declared before`
        );
      }
    }
    return topics;
  }, {});

  const topicsByGroup = consumers.reduce((topicsByGroup, consumer) => {
    assert(consumer.consumerGroup);
    let consumerGroup = topicsByGroup[consumer.consumerGroup];
    if (!consumerGroup) {
      topicsByGroup[consumer.consumerGroup] = consumerGroup = new Set();
    }

    consumerGroup.add(consumer.topic);

    return topicsByGroup;
  }, {});

  return kafkaServer({
    nodeId: 0,
    clusterId: 'sandbox',
  })
    .then((server) => {
      return new Promise((resolve, reject) => {
        kafka = services.kafka = server;
        server.on('error', reject);
        server.listen(9092, 'localhost', () => {
          server.off('error', reject);
          resolve();
        });
      });
    })
    .then(async () => {
      if (topics) {
        return ensureTopics(topics, partitionsPerTopic);
      }
    })
    .then(async () => {
      if (topics) {
        services.kafka_listeners = listeners = [];

        const config = {
          runtime: 'nodejs',
          timeout: 30,
        };

        for (const groupName in topicsByGroup) {
          const topics = Array.from(topicsByGroup[groupName]);
          const topicHandlers = topics.reduce((topicHandlers, topic) => {
            const src = lambdaSourceFromTopic(groupName, topic, inventory);
            const handlerFile = path.join(src, 'index.js');

            topicHandlers[topic] = (event) => {
              return new Promise((resolve, reject) => {
                console.log('INVOKING LAMBDA TO HANDLE TOPIC', topic);
                invokeLambda(
                  { inventory, lambda: { src, config, handlerFile }, event },
                  (err) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve();
                    }
                  }
                );
              });
            };
            return topicHandlers;
          }, {});

          listeners.push(await createKafkaListeners(groupName, topicHandlers));
        }
        return Promise.all(listeners.map((l) => l.start()));
      }
    })
    .then(() => {
      console.log('KAFKA SANDBOX STARTED');
      if (callback) {
        callback();
      }
    })
    .catch((err) => {
      if (callback) {
        callback(err);
      } else {
        throw err;
      }
    });
}

async function end({ services }, callback) {
  console.log('ENDING KAFKA PLUGIN');
  const k = services.kafka || kafka;
  if (!k) {
    throw new Error('kafka service is not defined');
  }
  const ls = services._kafka_listeners || listeners || [];
  if (!ls) {
    throw new Error('kafka listeners is not defined');
  }
  await k.close();
  console.log('closed server');
  for (const l of ls) {
    await l.stop();
  }
  console.log('stopped all listeners');
  if (callback) {
    callback();
  }
}

function getConsumers(arc) {
  const directive = arc['kafka-consumer-groups'] || [];
  return directive.map((consumer) => {
    if (!Array.isArray(consumer)) {
      consumer = [consumer];
    }

    const [consumerGroup, topicName, numPartitions = 1] = consumer;
    return {
      consumerGroup,
      topic: topicName,
      numPartitions,
    };
  });
}

function lambdaSourceFromTopic(consumerGroup, topic) {
  // const cwd = inventory.inv._project.src
  return path.join('src', 'kafka-consumers', `${consumerGroup}-${topic}`);
}

const sandbox = {
  start,
  end,
};

module.exports = {
  package: extendCloudFormation,
  pluginFunctions,
  sandbox,
};
