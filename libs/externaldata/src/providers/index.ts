import { Table } from 'apache-arrow';
import { ExternalKeyRecord } from '@decipad/backendtypes';
import { googlesheets } from './googlesheets';
import { testdatasource } from './test';

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
  fetch: (
    id: string,
    key: ExternalKeyRecord,
    provider: Provider,
    options: ProviderOptions
  ) => Promise<Table>;
}

export const providers: Record<string, () => Provider> = {
  testdatasource,
  googlesheets,
};
