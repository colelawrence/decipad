import stringify from 'json-stringify-safe';
import { fetch } from '@decipad/fetch';

let wsAddressCache: string | undefined;

const wsAddress = async (): Promise<string> => {
  if (!wsAddressCache) {
    wsAddressCache = await (await fetch('/api/ws')).text();
  }
  return wsAddressCache;
};

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

const maybeFetchWsAddress = async (notebookId: string): Promise<string> =>
  `${await wsAddress()}?doc=${encodeURIComponent(
    notebookId
  )}&protocol=agent-chat-1`;

export const connect = async (notebookId: string): Promise<WebSocket> => {
  const serverUrl = await maybeFetchWsAddress(notebookId);

  return new WebSocket(serverUrl, await fetchToken());
};
