import { providers, Provider } from './providers';

export * from './converters';
export * from './encode-table';

export function provider(id: keyof typeof providers): Provider {
  return providers[id]();
}
