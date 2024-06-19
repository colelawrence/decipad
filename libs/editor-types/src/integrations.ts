import type {
  BaseElement,
  PlainText,
  SimpleTableCellType,
  ELEMENT_INTEGRATION,
} from '.';

export interface CodeBlockIntegration {
  type: 'codeconnection';
  code: string;
}

export interface SQLBlockIntegration {
  type: 'mysql';

  query: string;
  url: string;
}

export interface NotionBlockIntegration {
  type: 'notion';

  notionUrl: string;
}

export interface GoogleSheetIntegration {
  type: 'gsheets';
  spreadsheetUrl: string;
}

export interface CSVIntegration {
  type: 'csv';

  csvUrl: string;
}

type IntegrationTypes =
  | CodeBlockIntegration
  | SQLBlockIntegration
  | NotionBlockIntegration
  | GoogleSheetIntegration
  | CSVIntegration;

export interface IntegrationBlock<
  T extends IntegrationTypes['type'] = IntegrationTypes['type']
> extends BaseElement {
  type: typeof ELEMENT_INTEGRATION;
  children: [PlainText];

  // Keeps the users desired result mappings.
  typeMappings: Array<SimpleTableCellType | undefined>;

  // TODO: ADD MIGRATION TO EXISTING INTEGRATIONS, OTHERWISE KABOOM.
  columnsToHide: Array<string>;

  // TODO: migration to make this present everytime.
  isFirstRowHeader: boolean;

  timeOfLastRun: string | undefined | null;

  integrationType: Extract<IntegrationTypes, { type: T }>;
}
