import type { IntegrationTypes } from '@decipad/editor-types';
import {
  ELEMENT_INTEGRATION,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { Runner } from '@decipad/notebook-tabs';
import { nanoid } from 'nanoid';

export function getNewIntegration(
  varName: string,
  runner: Runner
): IntegrationTypes.IntegrationBlock {
  return {
    id: runner.id,
    type: ELEMENT_INTEGRATION,
    children: [
      {
        type: ELEMENT_STRUCTURED_VARNAME,
        id: nanoid(),
        children: [{ text: varName }],
      },
    ],
    typeMappings: runner.types,
    timeOfLastRun: null,
    isFirstRowHeader:
      'isFirstHeaderRow' in runner.options.importer &&
      typeof runner.options.importer.isFirstHeaderRow === 'boolean'
        ? runner.options.importer.isFirstHeaderRow ?? false
        : false,
    integrationType: runner.intoIntegrationType(),
  };
}
