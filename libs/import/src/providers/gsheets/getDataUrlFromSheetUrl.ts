import { thirdParty } from '@decipad/client-config';
import { stringify as encodeQuery } from 'querystring';
import { SheetMeta } from '../../types';

export const getDataUrlFromSheetMeta = (
  sheetId: string,
  gid: number | undefined,
  sheetMeta: SheetMeta
): URL => {
  const { googleSheets } = thirdParty();
  const qs = encodeQuery({
    majorDimension: 'COLUMNS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
    key: googleSheets.apiKey,
  });

  const subSheet = sheetMeta.sheets.find(
    (sheet) => sheet.properties.sheetId === gid
  );
  const subSheetName = subSheet?.properties.title ?? 'Sheet1';

  return new URL(
    `https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      subSheetName
    )}?${qs}`
  );
};
