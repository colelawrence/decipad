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

export type Value = string | boolean | number;

export type Column = Value[];

export interface Sheet {
  values: Column[];
}
