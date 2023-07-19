import {
  BaseElement,
  ELEMENT_INTEGRATION,
  PlainText,
  SimpleTableCellType,
} from '.';

interface BlockIntegration {
  latestResult: string;
  timeOfLastRun: string | null;
}

export interface CodeBlockIntegration extends BlockIntegration {
  type: 'codeconnection';
  code: string;
}

export interface SQLBlockIntegration extends BlockIntegration {
  type: 'mysql';
  query: string;
  externalDataUrl: string;
  externalDataName: string;
}

type IntegrationTypes = CodeBlockIntegration | SQLBlockIntegration;

export interface IntegrationBlock extends BaseElement {
  type: typeof ELEMENT_INTEGRATION;
  children: [PlainText];

  // Keeps the users desired result mappings.
  typeMappings: Array<SimpleTableCellType | undefined>;

  integrationType: IntegrationTypes;
}
