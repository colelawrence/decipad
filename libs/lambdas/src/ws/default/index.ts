import { nanoid } from 'nanoid';
import { makeServer } from 'graphql-ws';
import arc, { HttpResponse } from '@architect/functions';
import { WSRequest, UserWithSecret } from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { isAuthorized } from '@decipad/services/authorization';
import { wrapHandler } from '@decipad/services/monitor';
import createSchema from '@decipad/graphqlserver/schema';
import graphqlResolvers from '@decipad/graphqlserver/resolvers';

const schema = createSchema();

export const handler = wrapHandler(async function ws(
  event: WSRequest
): Promise<HttpResponse> {
  const connId = event.requestContext.connectionId;
  if (!event.body) {
    return {
      statusCode: 401,
      body: 'need a body',
    };
  }
  const message = JSON.parse(event.body);
  if (message.type) {
    // this is a graphql message
    const ret = await handleGraphql(connId, event.body);
    return (
      ret || {
        statusCode: 200,
      }
    );
  }

  // this is an internal message
  const [op, args] = message;
  return handleCollab(connId, op, args);
});

async function handleGraphql(
  connId: string,
  message: any
): Promise<HttpResponse | void> {
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
    let timeout = setTimeout(() => resolve(), 5000);
    const reply = (r: HttpResponse | void) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(r), 2000);
    };
    function makeWebsocket() {
      return {
        protocol: 'graphql-transport-ws',
        async send(messageToSend: string) {
          const m = JSON.parse(messageToSend);
          if (m.type === 'complete') {
            // ignore complete messages, as pub-sub is longer-lived
            //   than the current process.
            return;
          }
          if (m.type === 'connection_ack') {
            if (connection!.gqlstate !== 'acknowledged') {
              connection!.gqlstate = 'acknowledged';
              await data.connections.put(connection!);

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
          reply();
        },
        async close(code: number, reason: string) {
          console.error(
            'graphql server asked to close websocket because',
            code,
            reason
          );
          reject();
        },
        async onMessage(cb: (m: string) => any) {
          try {
            const m = JSON.parse(message);
            if (m.type !== 'connection_init') {
              if (connection!.gqlstate !== 'acknowledged') {
                connection!.gqlstate = 'acknowledged';
                await data.connections.put(connection!);
              }

              // Sending connection init because already acknowledged.
              // We have to set the server into the same state
              //   as it was after receiving the connection_init message.
              const m3 = JSON.stringify({
                type: 'connection_init',
                payload: {},
              });
              await cb(m3);
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

function createContext(user: UserWithSecret, connectionId: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { secret: _, ...userWithoutSecret } = user;
  return (_conn: any, message: { id: string }) => {
    return {
      user: userWithoutSecret,
      subscriptionId: message.id,
      connectionId,
    };
  };
}

async function handleCollab(
  connId: string,
  op: 'subscribe' | 'unsubscribe',
  args: any
): Promise<HttpResponse> {
  const data = await tables();
  const connection = await data.connections.get({
    id: connId,
  });
  if (!connection) {
    return { statusCode: 403 };
  }

  const topic = args as string;

  if (
    !(await isAuthorized({
      resource: topic,
      user: { id: connection.user_id },
      permissionType: 'READ',
    }))
  ) {
    // The user is not autorized, but don't close the connection
    // He won't be able to fetch the resource through HTTP anyway
    return { statusCode: 200 };
  }

  switch (op) {
    case 'subscribe':
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

      break;

    case 'unsubscribe':
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

      break;

    default:
      console.error(`Unknown operation ${op}`);
      return { statusCode: 400 };
  }

  return { statusCode: 200 };
}
