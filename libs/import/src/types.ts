import { Result } from '@decipad/computer';
import { ImportElementSource } from '@decipad/editor-types';

export interface Provider {
  name: ImportElementSource;
  matchUrl: (url: URL) => boolean;
  import: (url: URL) => Promise<Result.Result>;
}

export interface SheetMeta {
  properties: {
    sheetId: number;
    title: string;
  };
}

export interface SpreadsheetMeta {
  sheets: SheetMeta[];
}

export interface SpreadsheetMetaResponse {
  body: SpreadsheetMeta;
}

export type ErrorWithCode = Error & {
  code: number;
};

export type SpreadsheetValue = string | boolean | number;

export type SpreadsheetColumn = SpreadsheetValue[];

export interface Sheet {
  values: SpreadsheetColumn[];
}
