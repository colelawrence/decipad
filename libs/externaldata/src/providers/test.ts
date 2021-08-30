import { Table } from '@apache-arrow/es5-cjs';
import { ExternalKeyRecord } from '@decipad/backendtypes';
import { ProviderOptions, Provider } from '.';
import { request } from '../http/request';
import { toTable } from '../to-table';

async function fetch(
  id: string,
  key: ExternalKeyRecord,
  _provider: Provider,
  options: ProviderOptions
): Promise<Table> {
  const dataUrl = options.useThirdPartyUrl ? options.useThirdPartyUrl : id;

  const { contentType, body } = await request(new URL(dataUrl), key);
  return toTable(contentType, body as string);
}

export const testdatasource = (): Provider => ({
  id: 'testdatasource',
  authorizationUrl: 'https://foo/testdatasource/authorization',
  accessTokenUrl: 'https://foo/testdatasource/token',
  clientId: 'testdatasourceclientid',
  clientSecret: 'testdatasourceclientsecret',
  scope: 'testdatasourcescope',
  authorizationParams: {},
  headers: {},
  fetch,
});
