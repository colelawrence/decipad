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
  externalDataUrl: string;
  externalDataName: string;
}

export interface NotionBlockIntegration {
  type: 'notion';
  notionUrl: string;
  databaseName: string;

  externalDataId: string;
  externalDataName: string;
}

export interface GoogleSheetIntegration {
  type: 'gsheets';
  spreadsheetUrl: string;

  externalDataId: string;
  externalDataName: string;

  selectedSubsheet: { id: number; name: string } | undefined;
}

type IntegrationTypes =
  | CodeBlockIntegration
  | SQLBlockIntegration
  | NotionBlockIntegration
  | GoogleSheetIntegration;

export interface IntegrationBlock<
  T extends IntegrationTypes['type'] = IntegrationTypes['type']
> extends BaseElement {
  type: typeof ELEMENT_INTEGRATION;
  children: [PlainText];

  // Keeps the users desired result mappings.
  typeMappings: Array<SimpleTableCellType | undefined>;

  latestResult: string;
  timeOfLastRun: string | null;

  integrationType: Extract<IntegrationTypes, { type: T }>;
}
