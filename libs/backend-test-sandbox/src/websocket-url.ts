import type { Config } from './config';

export function websocketURL(config: Config): string {
  return `ws://localhost:${config.apiPort}`;
}
