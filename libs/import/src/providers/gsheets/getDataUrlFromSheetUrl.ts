import { thirdParty } from '@decipad/client-config';
import { stringify as encodeQuery } from 'querystring';
import { SheetMeta } from '../../types';

export const getDataUrlFromSheetMeta = (
  sheetId: string,
  gid: number | string,
  sheetMeta: SheetMeta
): URL => {
  const { googleSheets } = thirdParty();
  const qs = encodeQuery({
    majorDimension: 'COLUMNS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
    key: googleSheets.apiKey,
  });

  const subSheet =
    sheetMeta.sheets.find(
      (sheet) =>
        sheet.properties.sheetId === gid ||
        sheet.properties.sheetId === Number(gid)
    ) ?? sheetMeta.sheets[Number(gid)];

  const subSheetName =
    (subSheet?.properties.title &&
      encodeURIComponent(subSheet.properties.title)) ??
    gid;

  return new URL(
    `https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${subSheetName}?${qs}`
  );
};
