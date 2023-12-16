import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from 'openai/resources';
import { AiUsage } from '@decipad/interfaces';
import { Message } from '@decipad/react-contexts';
import { mapChatHistoryToGPTChat } from './helpers';
import { connect } from './connect';
import { Subject } from 'rxjs';
import stringify from 'json-stringify-safe';
import { Payload } from '@hapi/boom';

export interface RemoteAgentParams {
  notebookId: string;
}

export interface RemoteAgentResponse {
  mode: 'conversation' | 'creation' | 'fetch_data';
  message: ChatCompletionMessage;
  usage: AiUsage;
}

type ConnectState = 'disconnected' | 'connecting' | 'connected';

type MessageWrapper = {
  messages: ChatCompletionMessageParam[];
  forceMode: 'creation' | 'conversation' | undefined;
};

type InputMessageWrapper = {
  messages: Message[];
  forceMode: 'creation' | 'conversation' | undefined;
};

export interface UseRemoteAgentResult {
  setMessage: (
    messages: InputMessageWrapper,
    abortSignal: AbortSignal
  ) => Promise<RemoteAgentResponse>;
  connectionState: ConnectState;
}

const IDLE_TIMEOUT_MS = 600_000; // 10 minutes

export const useRemoteAgent = ({
  notebookId,
}: RemoteAgentParams): UseRemoteAgentResult => {
  const ws = useRef<WebSocket | undefined>();
  const [connectState, setConnectState] =
    useState<ConnectState>('disconnected');
  const responseListener = useRef(new Subject<RemoteAgentResponse | Payload>());
  const [pendingMessage, setPendingMessage] = useState<
    MessageWrapper | undefined
  >();

  // connect and disconnect
  useEffect(() => {
    let websocket: WebSocket | undefined;
    (async () => {
      if (connectState === 'disconnected' && !ws.current && pendingMessage) {
        try {
          setConnectState('connecting');
          websocket = await connect(notebookId);

          websocket.addEventListener('open', () => {
            setConnectState('connected');
          });

          websocket.addEventListener('close', () => {
            ws.current = undefined;
            setConnectState('disconnected');
          });

          websocket.addEventListener('message', (event: MessageEvent) => {
            const { data } = event;
            const messageString =
              typeof data === 'string'
                ? data
                : Buffer.from(data).toString('utf-8');
            responseListener.current.next(JSON.parse(messageString));
          });

          websocket.addEventListener('error', (event) => {
            console.error('Error on websocket', event);
          });

          ws.current = websocket;
        } catch (err) {
          console.error('Error connecting', err);
          setConnectState('disconnected');
        }
      }
    })();
  }, [connectState, notebookId, pendingMessage]);

  // send messages
  useEffect(() => {
    if (connectState === 'connected' && pendingMessage) {
      ws.current?.send(stringify(pendingMessage));
      setPendingMessage(undefined);
    }
  }, [connectState, pendingMessage]);

  // close connection on idle
  useEffect(() => {
    const timeout = setTimeout(() => {
      ws.current?.close();
    }, IDLE_TIMEOUT_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [pendingMessage]);

  return {
    connectionState: connectState,
    setMessage: useCallback(async (message, abortSignal) => {
      // eslint-disable-next-line no-console
      console.debug('set message', message);
      setPendingMessage({
        ...message,
        messages: mapChatHistoryToGPTChat(
          message.messages.filter(
            (m) => !(m.type === 'event' && m.status === 'ui-only-error')
          )
        ),
      });

      const onAbort = () => {
        abortSignal.removeEventListener('abort', onAbort);
        ws.current?.close();
        const error: Payload = {
          statusCode: 418,
          error: "I'm a teapot",
          message: 'Aborted',
        };
        responseListener.current.next(error);
      };

      abortSignal.addEventListener('abort', onAbort);
      return new Promise((resolve, reject) => {
        const sub = responseListener.current.subscribe((response) => {
          sub.unsubscribe();
          if ((response as Payload).error) {
            const error = response as Payload;
            if (error.message === 'Aborted') {
              reject(new DOMException('Aborted', 'AbortError'));
            }
            reject(new Error((response as Payload).message));
          } else {
            resolve(response as RemoteAgentResponse);
          }
        });
      });
    }, []),
  };
};
