import type { ExternalDataSourceProvider } from '@decipad/backendtypes';
import type { Provider } from './providers';
import { providers } from './providers';

export function provider(id: ExternalDataSourceProvider): Provider | undefined {
  return providers[id]?.();
}
