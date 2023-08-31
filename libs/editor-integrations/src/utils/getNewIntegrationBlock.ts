import {
  ELEMENT_INTEGRATION,
  ImportElementSource,
  IntegrationTypes,
} from '@decipad/editor-types';
import {
  useCodeConnectionStore,
  useConnectionStore,
  useNotionConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { getDefined } from '@decipad/utils';
import { nanoid } from 'nanoid';

/**
 * Helper function to return the correct new integration,
 * with the correct state.
 *
 * Zustand stores can be accessed outside react so this makes the whole process
 * much nicer.
 */
export function getNewIntegration(
  type: ImportElementSource,
  varName: string
): IntegrationTypes.IntegrationBlock {
  switch (type) {
    case 'codeconnection': {
      const codeStore = useCodeConnectionStore.getState();
      const store = useConnectionStore.getState();

      return {
        id: nanoid(),
        type: ELEMENT_INTEGRATION,
        children: [{ text: varName }],
        typeMappings: store.resultTypeMapping,
        integrationType: {
          type: 'codeconnection',
          code: codeStore.code,
          latestResult: codeStore.latestResult,
          timeOfLastRun: codeStore.timeOfLastRun,
        },
      };
    }
    case 'mysql': {
      const sqlStore = useSQLConnectionStore.getState();
      const store = useConnectionStore.getState();

      return {
        id: nanoid(),
        type: ELEMENT_INTEGRATION,
        children: [{ text: varName }],
        typeMappings: store.resultTypeMapping,
        integrationType: {
          type: 'mysql',
          query: sqlStore.Query,
          latestResult: sqlStore.latestResult,
          timeOfLastRun: null,
          externalDataUrl: getDefined(sqlStore.ExternalDataId),
          externalDataName: getDefined(sqlStore.ExternalDataName),
        },
      };
    }

    case 'notion': {
      const notionStore = useNotionConnectionStore.getState();
      const store = useConnectionStore.getState();

      return {
        id: nanoid(),
        type: ELEMENT_INTEGRATION,
        children: [{ text: varName }],
        typeMappings: store.resultTypeMapping,
        integrationType: {
          type: 'notion',
          latestResult: notionStore.latestResult,
          timeOfLastRun: null,
          notionUrl: getDefined(notionStore.NotionDatabaseUrl),
        },
      };
    }

    default: {
      throw new Error('Integration type not supported yet');
    }
  }
}
