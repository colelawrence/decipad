import {
  IntegrationTypes,
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
    timeOfLastRun: IntegrationTypes.NEW_INTEGRATION_TIME_OF_LAST_RUN,
    isFirstRowHeader:
      'isFirstHeaderRow' in runner.options.importer &&
      typeof runner.options.importer.isFirstHeaderRow === 'boolean'
        ? runner.options.importer.isFirstHeaderRow ?? false
        : false,
    integrationType: runner.intoIntegrationType(),
  };
}
