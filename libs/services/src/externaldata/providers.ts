import { thirdParty } from '@decipad/config';

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

const providers: Record<string, () => Provider> = {
  testdatasource: () => ({
    id: 'testdatasource',
    authorizationUrl: 'https://foo/testdatasource/authorization',
    accessTokenUrl: 'https://foo/testdatasource/token',
    clientId: 'testdatasourceclientid',
    clientSecret: 'testdatasourceclientsecret',
    scope: 'testdatasourcescope',
    authorizationParams: {},
    headers: {},
  }),

  googlesheets: () => {
    const config = thirdParty();
    return {
      id: 'googlesheets',
      authorizationUrl:
        'https://accounts.google.com/o/oauth2/auth?response_type=code',
      accessTokenUrl: 'https://accounts.google.com/o/oauth2/token',
      clientId: config.google.sheets.clientId,
      clientSecret: config.google.sheets.clientSecret,
      scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
      authorizationParams: {},
      headers: {},
    };
  },
};

export function provider(id: keyof typeof providers): Provider {
  return providers[id]();
}
