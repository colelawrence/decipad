import assert from 'assert';
import tables from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { ChatCompletionMessage } from 'openai/resources';
import { resourceFromRoomName } from './roomName';
import { engageAssistant } from '../notebookAssistant/engageAssistant';
import { boomify, badRequest } from '@hapi/boom';
import { tryWSSend } from '@decipad/backend-utils';
import { captureException } from '@decipad/backend-trace';

export interface ChatAgentMessage {
  connectionId: string;
  room: string;
  message: string;
}

export const onQueueMessage = async (
  { connectionId, room, message }: ChatAgentMessage,
  event: APIGatewayProxyEventV2
) => {
  try {
    let messages: ChatCompletionMessage[];
    let forceMode: string;
    try {
      const parsedMessage = JSON.parse(message);
      messages = parsedMessage.messages;
      forceMode = parsedMessage.forceMode;
    } catch (err) {
      throw badRequest('invalid message');
    }
    const resource = resourceFromRoomName(room);
    // eslint-disable-next-line no-console
    console.log('resource', resource);
    assert(resource.type === 'pads');

    const data = await tables();
    const conn = await data.connections.get({ id: connectionId });
    if (!conn) {
      return;
    }
    const user = await data.users.get({
      id: getDefined(conn.user_id, 'connection with no user id'),
    });
    if (!user) {
      return;
    }

    const response = await engageAssistant({
      user,
      event,
      messages,
      forceMode,
      notebookId: resource.id,
    });

    await tryWSSend(connectionId, response);
  } catch (err) {
    const bErr = boomify(err as Error);
    await tryWSSend(connectionId, bErr.output.payload);
    if (bErr.isBoom) {
      // eslint-disable-next-line no-console
      console.error(bErr);
      await captureException(bErr);
    }
  }
};
