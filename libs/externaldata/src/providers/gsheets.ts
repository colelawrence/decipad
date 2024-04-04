import { thirdParty } from '@decipad/backend-config';
import type { GoogleSheetProvider } from './types';

export const gsheets = (): GoogleSheetProvider => {
  const config = thirdParty();
  return {
    id: 'gsheets',
    type: 'gsheets',
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
