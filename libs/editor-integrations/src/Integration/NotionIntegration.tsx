import { pushResultToComputer } from '@decipad/live-connect';
import {
  useComputer,
  useConnectionStore,
  useNotionConnectionStore,
} from '@decipad/react-contexts';
import {
  importFromUnknownJson,
  importFromNotion,
  columnTypeCoercionsToRec,
} from '@decipad/import';
import { useEffect } from 'react';
import type { ConcreteIntegrationBlock } from 'libs/editor-types/src/integrations';
import { useIntegrationOptions } from '../hooks';

export const NotionIntegration = function CodeIntegration({
  blockOptions,
  typeMappings,
  id,
  varName,
}: ConcreteIntegrationBlock<'notion'>): null {
  const computer = useComputer();

  useEffect(() => {
    const res = JSON.parse(blockOptions.latestResult);
    if (!res) return;

    async function getResult() {
      const notionResult = await importFromUnknownJson(importFromNotion(res), {
        columnTypeCoercions: columnTypeCoercionsToRec(typeMappings),
      });
      pushResultToComputer(computer, id, varName, notionResult);
    }

    getResult();
  }, [computer, blockOptions.latestResult, id, varName, typeMappings]);

  useIntegrationOptions({
    onRefresh() {
      fetch(blockOptions.notionUrl)
        .then((res) => res.json())
        .then(async (res) => {
          const notionImported = importFromNotion(res);
          const result = await importFromUnknownJson(notionImported, {
            columnTypeCoercions: columnTypeCoercionsToRec(typeMappings),
          });
          pushResultToComputer(computer, id, varName, result);
        });
    },
    onShowSource() {
      const store = useConnectionStore.getState();
      const notionStore = useNotionConnectionStore.getState();

      store.abort();

      importFromUnknownJson(
        importFromNotion(JSON.parse(blockOptions.latestResult)),
        {
          columnTypeCoercions: columnTypeCoercionsToRec(typeMappings),
        }
      ).then((notionResult) => {
        if (notionResult) {
          store.Set({ resultPreview: notionResult });
        }

        store.Set({
          connectionType: 'notion',
          stage: 'connect',
          existingIntegration: id,
          rawResult: blockOptions.latestResult,
          varName,
        });

        store.setAllTypeMapping(typeMappings);
        store.changeOpen(true);

        notionStore.Set({
          latestResult: blockOptions.latestResult,
          timeOfLastRun: blockOptions.timeOfLastRun,
          NotionDatabaseUrl: blockOptions.notionUrl,

          ExternalDataId: blockOptions.externalDataId,
          ExternalDataName: blockOptions.externalDataName,
          DatabaseName: blockOptions.databaseName,
        });
      });
    },
    onDelete() {
      pushResultToComputer(computer, id, varName, undefined);
    },
  });

  return null;
};
