import type { ExternalDataSourceProvider } from '@decipad/backendtypes';
import type { Provider } from './providers';
import { providers } from './providers';
import { saveExternalKey } from './utils/save-keys';

export function provider(id: ExternalDataSourceProvider): Provider | undefined {
  return providers[id]?.();
}

export { saveExternalKey };
