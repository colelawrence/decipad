import { thirdParty } from '@decipad/client-config';
import { stringify as encodeQuery } from 'querystring';
import { SheetMeta } from '../../types';
import { sheetColumnName } from '../../utils/sheetColumnName';
import { Island } from '../../utils/sheetIslands';

const islandToRange = (sheetName: string, island: Island): string => {
  return `${sheetName}!${sheetColumnName(island.firstCol + 1)}${
    island.firstRow + 1
  }:${sheetColumnName(island.lastCol + 1)}${island.lastRow + 1}`;
};

export const getDataRangeUrlFromSheet = (
  sheetId: string,
  gid: string | undefined,
  sheetMeta: SheetMeta,
  island: Island
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

  const range = islandToRange(subSheetName, island);

  return new URL(
    `https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
      range
    )}?${qs}`
  );
};
