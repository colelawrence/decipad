import { ImportElementSource } from '@decipad/editor-types';
import { SourceUrlParseResponse } from './types';
import { gsheets } from './providers';

export const parseSourceUrl = (
  source: ImportElementSource,
  url: string
): SourceUrlParseResponse => {
  switch (source) {
    case 'gsheets': {
      return gsheets.parseSourceUrl(url);
    }
    default:
      return {
        isRange: false,
      };
  }
};
