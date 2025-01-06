import { Time } from '@decipad/language-interfaces';
import type {
  BaseElement,
  SimpleTableCellType,
  ELEMENT_INTEGRATION,
  ImportElementSource,
  StructuredVarnameElement,
  TableColumnFormulaElement,
} from '.';

//
// Little hacky.
// When we first insert an integration into the notebook, we don't want the integration
// refreshing system to re-run our integration.
//
// So by having a special initial value, we can avoid this problem, and check for this.
//
export const NEW_INTEGRATION_TIME_OF_LAST_RUN = 'initial-value';

export type SerializedFilter = {
  id: string;
  filterName: string;
  columnId: string;
} & (
  | {
      type: 'string';
      value: string;
    }
  | {
      type: 'number';
      value: { n: bigint; d: bigint; s: bigint; infinite: boolean };
    }
  | {
      type: 'date';
      value: { time: number; specificity: Time.Specificity };
    }
);

export interface WithExternalData {
  externalDataId?: string;
}

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

export interface NotionBlockIntegration extends WithExternalData {
  type: 'notion';

  notionUrl: string;
}

export interface GoogleSheetIntegration extends WithExternalData {
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
  children: [StructuredVarnameElement, ...Array<TableColumnFormulaElement>];

  // Keeps the users desired result mappings.
  // THIS NEEDS TO BE MIGRATED.
  // typeMappings: Array<SimpleTableCellType | undefined>;

  typeMappings: TypeMap;

  // TODO: migration to make this present everytime.
  isFirstRowHeader: boolean;

  timeOfLastRun: string | undefined | null;

  integrationType: Extract<IntegrationTypes, { type: T }>;

  hideResult?: boolean;

  filters?: SerializedFilter[];
}
