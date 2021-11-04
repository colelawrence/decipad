import { Config } from './config';

export function websocketURL(config: Config, docId: string): string {
  return `ws://localhost:${config.apiPort}/ws?doc=${docId}`;
}
