import type {
  BaseElement,
  PlainText,
  SimpleTableCellType,
  ELEMENT_INTEGRATION,
  ImportElementSource,
  Filter,
} from '.';

export interface CodeBlockIntegration {
  type: 'codeconnection';
  code: string;
}

export interface SQLBlockIntegration {
  type: 'mysql';
  provider?: ImportElementSource;
  url: string;
  query: string;
}

export interface NotionBlockIntegration {
  type: 'notion';

  notionUrl: string;
}

export interface GoogleSheetIntegration {
  type: 'gsheets';
  spreadsheetUrl: string;
  range?: string;
}

export interface CSVIntegration {
  type: 'csv';

  csvUrl: string;
}

export type IntegrationTypes =
  | CodeBlockIntegration
  | SQLBlockIntegration
  | NotionBlockIntegration
  | GoogleSheetIntegration
  | CSVIntegration;

export type TypeObject =
  | {
      type?: SimpleTableCellType | undefined;
      desiredName?: string | undefined;
      isHidden?: boolean;
    }
  | undefined;

export type TypeMap = Record<string, TypeObject>;

export interface IntegrationBlock<
  T extends IntegrationTypes['type'] = IntegrationTypes['type']
> extends BaseElement {
  type: typeof ELEMENT_INTEGRATION;
  children: [PlainText];

  // Keeps the users desired result mappings.
  // THIS NEEDS TO BE MIGRATED.
  // typeMappings: Array<SimpleTableCellType | undefined>;

  typeMappings: TypeMap;

  // TODO: migration to make this present everytime.
  isFirstRowHeader: boolean;

  timeOfLastRun: string | undefined | null;

  integrationType: Extract<IntegrationTypes, { type: T }>;

  hideResult?: boolean;

  filters?: Filter[];
}
