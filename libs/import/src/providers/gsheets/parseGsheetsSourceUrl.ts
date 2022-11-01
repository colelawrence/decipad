import { getSheetRequestDataFromUrl } from './getSheetRequestDataFromUrl';
import { SourceUrlParseResponse } from '../../types';

export const parseGsheetsSourceUrl = (url: string): SourceUrlParseResponse => {
  const { gid } = getSheetRequestDataFromUrl(new URL(url));
  const isRange = gid.indexOf('!') > 0;
  const ranges = decodeURIComponent(gid.slice(gid.indexOf('!') + 1) || '');
  const range = ranges.split(':');
  return { isRange, range };
};
