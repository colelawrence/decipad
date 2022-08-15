import { stringify as encodeQuery } from 'querystring';
import { Table } from 'apache-arrow';
import { notAcceptable } from '@hapi/boom';
import { ExternalKeyRecord } from '@decipad/backendtypes';
import { thirdParty } from '@decipad/config';
import { request } from '../http/request';
import { toTable, Sheet } from '../converters/googlesheets';
import { Provider } from '.';
import { renewKey } from './renew-key';

interface SheetMeta {
  properties: {
    sheetId: number;
    title: string;
  };
}

interface SpreadsheetMeta {
  sheets: SheetMeta[];
}

interface SpreadsheetMetaResponse {
  body: SpreadsheetMeta;
}

type ErrorWithCode = Error & {
  code: number;
};

async function sheetNumericIdToSheetName(
  sheetId: number,
  spreadsheetId: string,
  key: ExternalKeyRecord
): Promise<string> {
  const metadataUrl = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`
  );
  const spreadsheet = (await request(
    metadataUrl,
    key,
    true
  )) as unknown as SpreadsheetMetaResponse;

  const sheet = spreadsheet.body.sheets.find(
    (s) => s.properties.sheetId === sheetId
  );
  if (!sheet) {
    throw notAcceptable(`Could not find sheet with id ${sheetId}`);
  }
  return sheet.properties.title;
}

async function getDataUrlFromSheetUrl(
  sheetUrl: URL,
  key: ExternalKeyRecord
): Promise<URL> {
  const match = sheetUrl.pathname.match(/^\/spreadsheets\/d\/([^/]+)\/edit/);
  if (!match) {
    throw notAcceptable(`Could not extract sheet id from ${sheetUrl}`);
  }
  const [, sheetId] = match;
  if (!sheetId) {
    throw notAcceptable(`Could not extract sheet id from ${sheetUrl}`);
  }

  const hashMatch = sheetUrl.hash.match(/gid=([0-9]+)/);
  const sheetNumericId = Number(hashMatch && hashMatch[1]);
  const sheetName = sheetNumericId
    ? await sheetNumericIdToSheetName(sheetNumericId, sheetId, key)
    : 'Sheet1';

  const qs = encodeQuery({
    majorDimension: 'COLUMNS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });

  return new URL(
    `https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?${qs}`
  );
}

async function fetch(
  sheetUrl: string,
  key: ExternalKeyRecord,
  provider: Provider
): Promise<Table> {
  const dataUrl = await getDataUrlFromSheetUrl(new URL(sheetUrl), key);

  try {
    const { body } = await request(dataUrl, key, true);
    return toTable(body as unknown as Sheet);
  } catch (err) {
    if ((err as ErrorWithCode).code === 401) {
      // try to renew the key and try again
      const newKey = await renewKey(key, provider);
      if (newKey) {
        return fetch(sheetUrl, newKey, provider);
      }
    }
    throw err;
  }
}

export const googlesheets = (): Provider => {
  const config = thirdParty();
  return {
    id: 'googlesheets',
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
    fetch,
  };
};
