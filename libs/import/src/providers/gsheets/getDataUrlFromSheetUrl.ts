import { thirdParty } from '@decipad/client-config';
import { stringify as encodeQuery } from 'querystring';
import { sheetNumericIdToSheetName } from './sheetNumericIdToSheetName';

export async function getDataUrlFromSheetUrl(sheetUrl: URL): Promise<URL> {
  const { googleSheets } = thirdParty();
  const match = sheetUrl.pathname.match(/^\/spreadsheets\/d\/([^/]+)\/edit/);
  if (!match) {
    throw new Error(`Could not extract sheet id from ${sheetUrl}`);
  }
  const [, sheetId] = match;
  if (!sheetId) {
    throw new Error(`Could not extract sheet id from ${sheetUrl}`);
  }

  const hashMatch = sheetUrl.hash.match(/gid=([0-9]+)/);
  const sheetNumericId = Number(hashMatch && hashMatch[1]);
  const sheetName = sheetNumericId
    ? await sheetNumericIdToSheetName(sheetNumericId, sheetId)
    : 'Sheet1';

  const qs = encodeQuery({
    majorDimension: 'COLUMNS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
    key: googleSheets.apiKey,
  });

  return new URL(
    `https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?${qs}`
  );
}
