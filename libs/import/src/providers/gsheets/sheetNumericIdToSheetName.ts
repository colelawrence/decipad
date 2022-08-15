import { request } from '../../http/request';
import { SpreadsheetMetaResponse } from './types';

export async function sheetNumericIdToSheetName(
  sheetId: number,
  spreadsheetId: string
): Promise<string> {
  const metadataUrl = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`
  );
  const spreadsheet = (await request(
    metadataUrl,
    true
  )) as unknown as SpreadsheetMetaResponse;

  const sheet = spreadsheet.body.sheets.find(
    (s) => s.properties.sheetId === sheetId
  );
  if (!sheet) {
    throw new Error(`Could not find sheet with id ${sheetId}`);
  }
  return sheet.properties.title;
}
