import type { Result } from '@decipad/language-interfaces';
import type {
  ImportElementSource,
  ColIndex,
  TableCellType,
} from '@decipad/editor-types';
import type { Computer } from '@decipad/computer-interfaces';

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
  sourceUrl?: string;
  importedAt?: Date;
  sheetId?: string | number;
  gid?: number | string;
  sourceMeta?: SheetMeta;
}

export interface ImportResult {
  meta?: ImportResultMeta;
  result?: Result.AnyResult;
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

export interface ImportParams {
  computer: Computer;
  url: URL;
  proxy?: URL;
  provider?: ImportElementSource;
}
export interface ImportOptions {
  identifyIslands?: boolean;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions?: Record<ColIndex, TableCellType>;
  doNotTryExpressionNumbersParse?: boolean;
  maxCellCount?: number;
  subId?: number | string;

  jsonPath?: string;
  delimiter?: string;
  provider?: ImportElementSource;

  columnsToIgnore?: Set<string>;
  query?: string;
}

export interface Island {
  sheetName: string;
  firstCol: number;
  firstRow: number;
  lastCol: number;
  lastRow: number;
}
