import type { ImportElementSource } from '@decipad/editor-types';
import type { SourceUrlParseResponse } from './types';
import { gsheets } from './providers';

export const parseSourceUrl = (
  source: ImportElementSource,
  url: string
): SourceUrlParseResponse => {
  switch (source) {
    case 'gsheets': {
      if (gsheets.parseSourceUrl) {
        return gsheets.parseSourceUrl(url);
      }
    }
  }
  return {
    isRange: false,
    userUrl: url,
  };
};
