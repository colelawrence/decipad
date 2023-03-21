import { ExternalDataSourceProvider } from '@decipad/backendtypes';
import { providers, Provider } from './providers';

export function provider(id: ExternalDataSourceProvider): Provider | undefined {
  return providers[id]?.();
}
