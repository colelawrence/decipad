import { Config } from './config';
import { websocketURL } from './websocket-url';

export function createWebsocket(
  docId: string,
  config: Config,
  token: string
): WebSocket {
  return new WebSocket(websocketURL(config, docId), [token]);
}
