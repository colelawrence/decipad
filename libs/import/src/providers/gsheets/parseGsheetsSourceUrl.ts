import { getSheetRequestDataFromUrl } from './getSheetRequestDataFromUrl';
import { SourceUrlParseResponse } from '../../types';

export const parseGsheetsSourceUrl = (url: string): SourceUrlParseResponse => {
  const { gid } = getSheetRequestDataFromUrl(new URL(url));
  const indexOfExclamationMark = gid.indexOf('!');
  const subsheetName = gid.substring(0, indexOfExclamationMark);
  const isRange = indexOfExclamationMark > 0;
  const ranges = decodeURIComponent(
    gid.slice(indexOfExclamationMark + 1) || ''
  );
  const range = ranges.split(':');
  return { isRange, range, subsheetName };
};
