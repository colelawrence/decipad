import type { ExternalDataSourceProvider } from '@decipad/backendtypes';
import { gsheets } from './gsheets';

export interface ProviderOptions {
  useThirdPartyUrl?: string;
}

export interface Provider {
  id: string;
  accessTokenUrl: string;
  authorizationUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  authorizationParams: Record<string, string>;
  headers: Record<string, string>;
}

export const providers: Partial<
  Record<ExternalDataSourceProvider, () => Provider>
> = {
  gsheets,
};
