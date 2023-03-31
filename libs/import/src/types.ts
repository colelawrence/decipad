import { Result } from '@decipad/computer';
import { ImportElementSource } from '@decipad/editor-types';

export interface Provider {
  name: ImportElementSource;
  matchUrl: (url: URL) => boolean;
  import: (url: URL) => Promise<ImportResult[]>;
}

export interface SheetMeta {
  spreadsheetId: string;
  properties: {
    sheetId: number;
    title: string;
  };
  sheets: SheetMeta[];
}

export type ErrorWithCode = Error & {
  code: number;
};

export type SpreadsheetValue = string | boolean | number;

export type SpreadsheetRow = SpreadsheetValue[];

export type SpreadsheetColumn = SpreadsheetValue[];

export interface Sheet {
  values: SpreadsheetColumn[];
}

export interface ImportResultMeta {
  title?: string;
  sourceUrl?: URL;
  importedAt?: Date;
  sheetId?: string | number;
  gid?: number | string;
  sourceMeta?: SheetMeta;
}

type JSON = Record<string, unknown>;

export interface ImportResult {
  meta?: ImportResultMeta;
  result?: Result.Result;
  rawResult?: string | JSON;
  loading?: boolean;
}

export type ImportResultWithMandatoryResult = ImportResult & {
  result: Result.Result;
};

export interface SourceUrlParseResponse {
  subsheetName?: string;
  isRange?: boolean;
  range?: string[];
  userUrl: string;
}
