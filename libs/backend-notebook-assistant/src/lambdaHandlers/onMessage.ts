import { queues } from '@architect/functions';
import type { ConnectionRecord } from '@decipad/backendtypes';

const getBody = (message: unknown, isBase64Encoded: boolean) => {
  if (Buffer.isBuffer(message)) {
    return message.toString('utf-8');
  }
  if (typeof message === 'string') {
    if (isBase64Encoded) {
      return Buffer.from(message, 'base64').toString('utf-8');
    }
    return message;
  }
  throw new Error(`Invalid body ${typeof message}`);
};

export const onMessage = async (
  conn: ConnectionRecord,
  _message: unknown,
  isBase64Encoded: boolean
) => {
  const message = getBody(_message, isBase64Encoded);
  // eslint-disable-next-line no-console
  console.log('backend notebook assistant: message:', message);
  await queues.publish({
    name: 'chat-agent-message',
    payload: {
      connectionId: conn.id,
      room: conn.room,
      message,
    },
  });
  return { statusCode: 200 };
};
