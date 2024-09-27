import type {
  ImportElementSource,
  IntegrationTypes,
} from '@decipad/editor-types';
import { ELEMENT_INTEGRATION } from '@decipad/editor-types';
import { useConnectionStore } from '@decipad/react-contexts';
import {
  CodeRunner,
  CSVRunner,
  GenericContainerRunner,
  LegacyRunner,
} from '../runners';
import { assertInstanceOf } from '@decipad/utils';

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

function getDefaultBlock(
  runner: GenericContainerRunner
): IntegrationTypes.IntegrationBlock {
  const store = useConnectionStore.getState();

  return {
    id: store.blockId,
    type: ELEMENT_INTEGRATION,
    children: [{ text: store.varName }],
    typeMappings: runner.getTypes(),
    timeOfLastRun: store.timeOfLastRun,
    columnsToHide: store.columnsToHide,
    isFirstRowHeader: runner.getIsFirstRowHeader(),
    integrationType: {} as any, // we can do this because we are about to override this.
  };
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
  runner: GenericContainerRunner
): IntegrationTypes.IntegrationBlock {
  const defaultBlock = getDefaultBlock(runner);

  switch (type) {
    case 'codeconnection': {
      assertInstanceOf(runner, CodeRunner);

      defaultBlock.integrationType = {
        type: 'codeconnection',
        code: runner.code,
      };

      return defaultBlock;
    }
    case 'mysql': {
      assertInstanceOf(runner, LegacyRunner);

      defaultBlock.integrationType = {
        type: 'mysql',

        url: runner.getUrl(),
        query: runner.getQuery(),
      };

      return defaultBlock;
    }

    case 'notion': {
      assertInstanceOf(runner, LegacyRunner);

      defaultBlock.integrationType = {
        type: 'notion',
        notionUrl: runner.getUrl(),
      };

      return defaultBlock;
    }

    case 'gsheets': {
      assertInstanceOf(runner, LegacyRunner);

      defaultBlock.integrationType = {
        type: 'gsheets',
        spreadsheetUrl:
          runner.getProxy() != null
            ? `${runner.getProxy()!}?url=${runner.getUrl()}`
            : runner.getUrl(),
      };

      return defaultBlock;
    }

    case 'csv': {
      if (!(runner instanceof CSVRunner)) {
        throw new Error('Need CSVRunner');
      }

      defaultBlock.typeMappings = runner.getTypes();
      defaultBlock.integrationType = {
        type: 'csv',
        csvUrl: runner.getUrl(),
      };

      return defaultBlock;
    }

    default: {
      throw new Error('Integration type not supported yet');
    }
  }
}
