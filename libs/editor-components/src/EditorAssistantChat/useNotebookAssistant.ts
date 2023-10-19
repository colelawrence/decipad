/* eslint-disable no-console */
import { TOperation } from '@udecode/plate';
import { NotebookAssistantEvent } from './useNotebookAssistantTypes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetch } from '@decipad/fetch';
import { noop } from '@decipad/utils';
import stringify from 'json-stringify-safe';
import { humanizeMotebookAssistantProgressMessage } from './notebookAssistantProgressMessages';

export interface UseNotebookAssistantOptions {
  onEvent?: (event: NotebookAssistantEvent) => unknown;
  onProgress?: (progress: string) => unknown;
  onOperations: (operations: TOperation[]) => unknown;
  onSummary: (summary: string) => unknown;
  onError: (error: string) => unknown;
}

export interface UseNotebookAssistantResult {
  sendPrompt: (prompt: string) => void;
}

const RECONNECT_MS = 3000;

async function wsAddress(notebookId: string): Promise<string> {
  return `${await (await fetch('/api/ws'))?.text()}?doc=${encodeURIComponent(
    notebookId
  )}&protocol=agent-chat-1`;
}

async function fetchToken(): Promise<string> {
  const resp = await fetch(`/api/auth/token?for=pubsub`);
  if (!resp?.ok) {
    throw new Error(
      `Error fetching token: response code was ${resp.status}: ${
        resp.statusText
      }. response was ${(await resp?.text()) || stringify(resp)}`
    );
  }
  return resp?.text();
}

export const useNotebookAssistant = (
  notebookId: string,
  {
    onEvent = noop,
    onProgress = noop,
    onOperations,
    onSummary,
    onError,
  }: UseNotebookAssistantOptions
): UseNotebookAssistantResult => {
  const [started, setStarted] = useState(false);
  const connecting = useRef(false);
  const connected = useRef(false);
  const disconnecting = useRef(false);
  const disconnected = useRef(false);
  const ws = useRef<WebSocket | undefined>();

  const disconnect = useCallback(() => {
    disconnecting.current = true;
    connecting.current = false;
    try {
      ws.current?.close();
    } catch (err) {
      // don't care
    }
  }, []);

  const stop = useCallback(() => {
    disconnect();
    setStarted(false);
  }, [disconnect]);

  const handleEvent = useCallback(
    (event: NotebookAssistantEvent) => {
      console.debug('notebook assistant event', event);
      onEvent(event);

      switch (event.type) {
        case 'operations': {
          console.debug('have operations', event.operations);
          onOperations(event.operations);
          break;
        }
        case 'summary': {
          console.debug('have summary', event.summary);
          onSummary(event.summary);
          break;
        }
        case 'progress': {
          onProgress(humanizeMotebookAssistantProgressMessage(event));
          break;
        }
        case 'error': {
          onError(event.message);
          stop();
          break;
        }
        case 'end': {
          stop();
        }
      }
    },
    [onError, onEvent, onOperations, onProgress, onSummary, stop]
  );

  const handleMessage = useCallback(
    (message: unknown) => {
      if (typeof message === 'string') {
        try {
          handleEvent(JSON.parse(message));
        } catch (err) {
          console.error(err);
          onError('Error parsing message from assistant');
          stop();
        }
      }
    },
    [handleEvent, onError, stop]
  );

  const connect = useCallback(
    (firstMessage?: string) => {
      if (connecting.current || connected.current) {
        return;
      }
      disconnecting.current = false;
      connecting.current = true;
      (async () => {
        const websocket = new WebSocket(
          await wsAddress(notebookId),
          await fetchToken()
        );

        websocket.addEventListener('error', (ev) => {
          console.error(ev);
          onError('Connection error');
        });

        websocket.addEventListener('message', (ev) => {
          handleMessage(ev.data);
        });

        websocket.addEventListener('close', () => {
          connected.current = false;
          disconnected.current = true;
          stop();
          // eslint-disable-next-line no-console
          console.debug('Connection to assistant closed');
        });

        websocket.addEventListener('open', () => {
          connecting.current = false;
          connected.current = true;
          disconnected.current = false;

          console.debug('Connection to assistant opened');

          if (firstMessage) {
            websocket.send(firstMessage);
          }
        });
        ws.current = websocket;
      })();
    },
    [handleMessage, notebookId, onError, stop]
  );

  const start = useCallback(
    (prompt: string) => {
      setStarted(true);
      connect(prompt);
      console.debug('sent prompt', prompt);
    },
    [connect]
  );

  useEffect(() => {
    // disconnect or reconnect logic
    if (
      started &&
      !connected.current &&
      !connecting.current &&
      !disconnecting.current
    ) {
      connecting.current = true;
      setTimeout(() => {
        connecting.current = false;
        connect();
      }, RECONNECT_MS);
    }
  }, [started, connect, disconnect]);

  return {
    sendPrompt: start,
  };
};
