import { Config } from './config';
import { websocketURL } from './websocket-url';

export function createWebsocket(config: Config, token: string): WebSocket {
  return new WebSocket(websocketURL(config), [token]);
}
