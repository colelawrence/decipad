import assert from 'assert';
import { streamingNotebookAssistant } from '../notebookAssistant/notebookAssistant';
import { resourceFromRoomName } from './roomName';
import { ws } from '@architect/functions';
import type { NotebookAssistantEvent } from '../types';
import { Subscription } from 'rxjs';
import { fnQueue } from '@decipad/fnqueue';

export interface ChatAgentMessage {
  connectionId: string;
  room: string;
  message: string;
}

export const onQueueMessage = async (event: ChatAgentMessage) => {
  // eslint-disable-next-line no-console
  console.log('onQueueMessage', event);
  const resource = resourceFromRoomName(event.room);
  // eslint-disable-next-line no-console
  console.log('resource', resource);
  assert(resource.type === 'pads');
  const assistant = await streamingNotebookAssistant(
    resource.id,
    event.message,
    event.connectionId
  );
  return new Promise<void>((resolve) => {
    let subscription: undefined | Subscription;

    const close = () => {
      subscription?.unsubscribe();
      resolve();
    };

    const messageQueue = fnQueue();
    const sendMessage = (assistantEvent: NotebookAssistantEvent) => {
      messageQueue.push(async () => {
        try {
          await ws.send({
            id: event.connectionId,
            payload: assistantEvent,
          });
        } catch (err) {
          // ws connection is gone
          // eslint-disable-next-line no-console
          console.error(err);
          close();
        }
      });
    };

    subscription = assistant.subscribe((assistantEvent) => {
      switch (assistantEvent.type) {
        case 'new-doc':
          // ignore this one
          break;
        case 'error':
        case 'end':
          sendMessage(assistantEvent);
          messageQueue.flush().finally(close);
          break;
        default: {
          sendMessage(assistantEvent);
        }
      }
    });
  });
};
