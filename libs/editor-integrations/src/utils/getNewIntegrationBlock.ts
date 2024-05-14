import type {
  ImportElementSource,
  IntegrationTypes,
} from '@decipad/editor-types';
import { ELEMENT_INTEGRATION } from '@decipad/editor-types';
import {
  useCodeConnectionStore,
  useConnectionStore,
  useGSheetConnectionStore,
  useNotionConnectionStore,
  useSQLConnectionStore,
} from '@decipad/react-contexts';
import { getDefined } from '@decipad/utils';
import { nanoid } from 'nanoid';

export function getNotionDbLink(url: string): string | undefined {
  const parsedUrl = url.match(/notion.so\/.*\?v=/);
  if (parsedUrl == null || parsedUrl.length !== 1) {
    return undefined;
  }

  return parsedUrl[0].slice(
    'notion.so/'.length,
    parsedUrl[0].length - '?v='.length
  );
}

export function getNotionDataLink(notionDatabaseId: string): string {
  return `${window.location.origin}/api/externaldatasources/notion/${notionDatabaseId}/data`;
}

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
        latestResult: store.rawResult!,
        timeOfLastRun: store.timeOfLastRun,

        integrationType: {
          type: 'codeconnection',
          code: codeStore.code,
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
        latestResult: store.rawResult!,
        timeOfLastRun: store.timeOfLastRun,
        integrationType: {
          type: 'mysql',
          query: sqlStore.Query,
          externalDataUrl: getDefined(sqlStore.ExternalDataId),
          externalDataName: getDefined(sqlStore.ExternalDataName),
        },
      };
    }

    case 'notion': {
      const notionStore = useNotionConnectionStore.getState();
      const store = useConnectionStore.getState();

      const notionIntegration: IntegrationTypes.IntegrationBlock = {
        id: nanoid(),
        type: ELEMENT_INTEGRATION,
        children: [{ text: varName }],
        typeMappings: store.resultTypeMapping,
        latestResult: store.rawResult!,
        timeOfLastRun: store.timeOfLastRun,
        integrationType: {
          type: 'notion',
          notionUrl: notionStore.NotionDatabaseUrl!,
          externalDataId: notionStore.ExternalDataId!,
          externalDataName: notionStore.ExternalDataName!,
          databaseName: notionStore.DatabaseName!,
        },
      };

      return notionIntegration;
    }

    case 'gsheets': {
      const gsheetStore = useGSheetConnectionStore.getState();
      const store = useConnectionStore.getState();

      const gsheetIntegration: IntegrationTypes.IntegrationBlock = {
        id: nanoid(),
        type: ELEMENT_INTEGRATION,
        children: [{ text: varName }],
        typeMappings: store.resultTypeMapping,
        latestResult: store.rawResult!,
        timeOfLastRun: store.timeOfLastRun,
        integrationType: {
          type: 'gsheets',
          externalDataId: gsheetStore.ExternalDataId!,
          externalDataName: gsheetStore.ExternalDataName!,
          spreadsheetUrl: gsheetStore.SpreadsheetURL!,
          selectedSubsheet: gsheetStore.SelectedSubsheet,
        },
      };

      return gsheetIntegration;
    }

    default: {
      throw new Error('Integration type not supported yet');
    }
  }
}
