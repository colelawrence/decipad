import { WebSocket } from 'mock-socket';

export interface DeciWebsocketServer {
  socketHandler(socket: WebSocket): void;
  notify(topic: string, message: string): void;
}

export function createWebsocketServer(): DeciWebsocketServer {
  const subscriptions = new Map<string, WebSocket[]>();

  function socketHandler(socket: WebSocket) {
    socket.on('message', (message) => {
      let topicSubscriptions: WebSocket[] | undefined = [];
      const m = JSON.parse(message.toString());
      let op: string;
      let topic: string | undefined;
      if (Array.isArray(m)) {
        [op, topic] = m as [string, string];
        if (topic) {
          topicSubscriptions = subscriptions.get(topic) || [];
          subscriptions.set(topic, topicSubscriptions);
        }
      } else {
        op = m.type;
      }

      switch (op) {
        case 'subscribe':
          topicSubscriptions.push(socket);
          socket.send(JSON.stringify({ o: 's', t: topic }));
          break;

        case 'unsubscribe':
          {
            const index = topicSubscriptions.indexOf(socket);
            if (index >= 0) {
              topicSubscriptions.splice(index, 1);
            }
            socket.send(JSON.stringify({ o: 'u', t: topic }));
          }

          break;

        case 'ping':
          socket.send(JSON.stringify({ type: 'pong' }));
          break;

        default:
          throw new Error(`unrecognized operation: ${op}`);
      }
    });

    socket.on('close', () => {
      for (const sockets of subscriptions.values()) {
        const index = sockets.indexOf(socket);
        if (index >= 0) {
          sockets.splice(index, 1);
        }
      }
    });
  }

  function notify(topic: string, message: string) {
    const sockets = subscriptions.get(topic) || [];
    // console.log(`notifying ${sockets.length} sockets on topic`, topic);
    for (const socket of sockets) {
      try {
        socket.send(message);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error sending message:', err);
      }
    }
  }

  return {
    socketHandler,
    notify,
  };
}
