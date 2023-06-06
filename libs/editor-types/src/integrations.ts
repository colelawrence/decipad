import {
  BaseElement,
  ELEMENT_INTEGRATION,
  PlainText,
  SimpleTableCellType,
} from '.';

export interface CodeBlockIntegration {
  type: 'codeconnection';
  code: string;
  /** Base64 encoded */
  latestResult: string;
}

type IntegrationTypes = CodeBlockIntegration;

export interface IntegrationBlock extends BaseElement {
  type: typeof ELEMENT_INTEGRATION;
  children: [PlainText];

  // Keeps the users desired result mappings.
  typeMappings: Array<SimpleTableCellType | undefined>;

  integrationType: IntegrationTypes;
}
