import { thirdParty } from '@decipad/config';
import { Provider } from '.';

export const gsheets = (): Provider => {
  const config = thirdParty();
  return {
    id: 'gsheets',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
    accessTokenUrl: 'https://accounts.google.com/o/oauth2/token',
    clientId: config.google.sheets.clientId,
    clientSecret: config.google.sheets.clientSecret,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    authorizationParams: {
      response_type: 'code',
      access_type: 'offline',
    },
    headers: {},
  };
};
