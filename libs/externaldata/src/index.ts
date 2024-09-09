import type { ExternalDataSourceProvider } from '@decipad/backendtypes';
import type { Provider, AccessToken } from './providers';
import { providers, renewKey } from './providers';
import { saveExternalKey } from './utils/save-keys';

export function provider(id: ExternalDataSourceProvider): Provider | undefined {
  return providers[id]?.();
}

export { saveExternalKey, renewKey };
export type { Provider, AccessToken };
