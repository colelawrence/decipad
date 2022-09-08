import { stringify as encodeQuery } from 'querystring';
import { thirdParty } from '@decipad/client-config';
import { request } from '../../http/request';
import { SheetMeta } from '../../types';

export interface SpreadsheetMetaResponse {
  body: SheetMeta;
}

export const getSheetMeta = async (
  spreadsheetId: string
): Promise<SheetMeta> => {
  const { googleSheets } = thirdParty();
  const qs = encodeQuery({
    key: googleSheets.apiKey,
  });

  const metadataUrl = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?${qs}`
  );

  const spreadsheet = (await request(
    metadataUrl,
    true
  )) as unknown as SpreadsheetMetaResponse;

  return spreadsheet.body;
};
