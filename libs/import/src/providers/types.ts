import { ImportOptions, ImportParams } from '../import';
import { ImportResult, SourceUrlParseResponse } from '../types';

export interface Provider {
  name: string;
  matchUrl: (url: URL) => boolean;
  import: (
    args: ImportParams,
    options: ImportOptions
  ) => Promise<ImportResult[]>;
  parseSourceUrl?: (url: string) => SourceUrlParseResponse;
}
