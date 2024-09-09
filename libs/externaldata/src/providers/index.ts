import type { ExternalDataSourceProvider } from '@decipad/backendtypes';
import { gsheets } from './gsheets';
import { notion } from './notion';
import type { Provider, AccessToken } from './types';

export * from './renew-key';

export const providers: Partial<
  Record<ExternalDataSourceProvider, () => Provider>
> = {
  gsheets,
  notion,
};

export type { Provider, AccessToken };
