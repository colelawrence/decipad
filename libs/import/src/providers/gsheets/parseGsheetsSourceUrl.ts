import { getSheetRequestDataFromUrl } from './getSheetRequestDataFromUrl';
import { SourceUrlParseResponse } from '../../types';

const getUserUrl = (sheetId: string, gid: string): string =>
  `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    sheetId
  )}/edit#gid=${encodeURIComponent(gid)}`;

export const parseGsheetsSourceUrl = (url: string): SourceUrlParseResponse => {
  const { sheetId, gid } = getSheetRequestDataFromUrl(new URL(url));
  const indexOfExclamationMark = gid.indexOf('!');
  const subsheetName = gid.substring(0, indexOfExclamationMark) || '0';
  const isRange = indexOfExclamationMark > 0;
  const ranges = decodeURIComponent(
    gid.slice(indexOfExclamationMark + 1) || ''
  );
  const range = ranges.split(':');
  const userUrl = getUserUrl(sheetId, subsheetName);
  return { isRange, range, subsheetName, userUrl };
};
