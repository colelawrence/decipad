import { queues } from '@architect/functions';
import { ConnectionRecord } from '@decipad/backendtypes';

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
  message: unknown,
  isBase64Encoded: boolean
) => {
  const prompt = getBody(message, isBase64Encoded);
  await queues.publish({
    name: 'chat-agent-message',
    payload: {
      connectionId: conn.id,
      room: conn.room,
      message: prompt,
    },
  });
  return { statusCode: 200 };
};
