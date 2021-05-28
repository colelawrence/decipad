'use strict';

const arc = require('@architect/functions');
require('graphql');
const { gql, makeExecutableSchema } = require('apollo-server-lambda');
const tables = require('@architect/shared/tables');
const { nanoid } = require('nanoid');
const { isAuthorized } = require('@architect/shared/authorization');
const { makeServer } = require('graphql-ws');
const createSchema = require('@architect/shared/graphql/schema');
const graphqlResolvers = require('@architect/shared/graphql/resolvers');

exports.handler = async function ws(event) {
  const connId = event.requestContext.connectionId;
  const message = JSON.parse(event.body);
  if (message.type) {
    // this is a graphql message
    await handleGraphql(connId, event.body);
    return {
      statusCode: 200,
    };
  }

  // this is an internal message
  const [op, args] = message;
  return await handleCollab(connId, op, args);
};

async function handleGraphql(connId, message) {
  const data = await tables();
  const connection = await data.connections.get({
    id: connId,
  });
  if (!connection) {
    return { statusCode: 403 };
  }

  const user = await data.users.get({ id: connection.user_id });
  if (!user) {
    return { statusCode: 403 };
  }

  const schema = createSchema({ gql, makeExecutableSchema });
  const context = createContext(user, connId);
  const roots = graphqlResolvers;

  const server = makeServer({
    schema,
    context,
    roots,
  });

  return new Promise((resolve, reject) => {
    const websocket = makeWebsocket();
    server.opened(websocket, context);
    function makeWebsocket() {
      return {
        protocol: 'graphql-transport-ws',
        async send(message) {
          const m = JSON.parse(message);
          if (m.type === 'complete') {
            // ignore complete messages, as pub-sub is longer-lived
            //   than the current process.
            return;
          }
          if (m.type === 'connection_ack') {
            if (connection.gqlstate !== 'acknowledged') {
              connection.gqlstate = 'acknowledged';
              await data.connections.put(connection);

              await arc.ws.send({
                id: connId,
                payload: m,
              });
            }
          } else {
            await arc.ws.send({
              id: connId,
              payload: m,
            });

            if (m.type === 'next') {
              const m2 = { ...m, type: 'data' };
              await arc.ws.send({
                id: connId,
                payload: m2,
              });
            }
          }
          resolve();
        },
        async close(code, reason) {
          console.error(
            'graphql server asked to close websocket because',
            code,
            reason
          );
          reject();
        },
        async onMessage(cb) {
          try {
            const m = JSON.parse(message);
            if (m.type !== 'connection_init') {
              if (connection.gqlstate !== 'acknowledged') {
                connection.gqlstate = 'acknowledged';
                await data.connections.put(connection);
              }

              // Sending connection init because already acknowledged.
              // We have to set the server into the same state
              //   as it was after receiving the connection_init message.
              await cb(
                JSON.stringify({ type: 'connection_init', payload: {} })
              );
            }

            if (m.type === 'start') {
              // this is a legacy message type.
              // let's try to fix this
              m.type = 'subscribe';
              message = JSON.stringify(m);
            }

            cb(message);
          } catch (err) {
            console.error(err);
            reject(err);
          }
        },
      };
    }
  });
}

function createContext(user, connectionId) {
  delete user.secret;
  return (_conn, message) => {
    return { user, subscriptionId: message.id, connectionId };
  };
}

async function handleCollab(connId, op, args) {
  const data = await tables();
  const connection = await data.connections.get({
    id: connId,
  });
  if (!connection) {
    return { statusCode: 403 };
  }

  const topic = args;
  if (!(await isAuthorized(topic, { id: connection.user_id }))) {
    // The user is not autorized, but don't close the connection
    // He won't be able to fetch the resource through HTTP anyway
    return { statusCode: 200 };
  }

  switch (op) {
    case 'subscribe':
      {
        await data.collabs.put({
          id: nanoid(),
          room: topic,
          user_id: connection.user_id,
          conn: connId,
        });

        await arc.ws.send({
          id: connId,
          payload: { o: 's', t: topic },
        });
      }
      break;

    case 'unsubscribe':
      {
        const collabs = await data.collabs.query({
          IndexName: 'conn-index',
          KeyConditionExpression: 'conn = :conn',
          ExpressionAttributeValues: {
            ':conn': connId,
          },
        });

        for (const collab of collabs.Items) {
          if (collab.room === topic) {
            await data.collabs.delete({ id: collab.id });
          }
        }

        await arc.ws.send({
          id: connId,
          payload: { o: 'u', t: topic },
        });
      }
      break;

    default:
      console.error(`Unknown operation ${op}`);
      return { statusCode: 400 };
  }

  return { statusCode: 200 };
}
