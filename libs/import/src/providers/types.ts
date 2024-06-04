import type {
  ImportOptions,
  ImportParams,
  ImportResult,
  SourceUrlParseResponse,
} from '../types';

export interface Provider {
  name: string;
  matchUrl: (url: URL) => boolean;
  import: (
    args: ImportParams,
    options: ImportOptions
  ) => Promise<ImportResult[]>;
  parseSourceUrl?: (url: string) => SourceUrlParseResponse;
}
