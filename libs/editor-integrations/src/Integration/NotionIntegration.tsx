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
import {
  GetNotionDocument,
  GetNotionQuery,
  GetNotionQueryVariables,
} from '@decipad/graphql-client';
import { useRouteParams } from 'typesafe-routes/react-router';
import { notebooks } from '@decipad/routing';
import { useClient } from 'urql';
import { ConcreteIntegrationBlock } from 'libs/editor-types/src/integrations';
import { useIntegrationOptions } from '../hooks';

export const NotionIntegration = function CodeIntegration({
  blockOptions,
  typeMappings,
  id,
  varName,
}: ConcreteIntegrationBlock<'notion'>): null {
  const computer = useComputer();

  const client = useClient();
  const { notebook } = useRouteParams(notebooks({}).notebook);

  useEffect(() => {
    const res = JSON.parse(blockOptions.latestResult);
    if (res) {
      const notionResult = importFromUnknownJson(importFromNotion(res), {
        columnTypeCoercions: columnTypeCoercionsToRec(typeMappings),
      });
      pushResultToComputer(computer, id, varName, notionResult);
    }
  }, [computer, blockOptions.latestResult, id, varName, typeMappings]);

  useIntegrationOptions({
    onRefresh() {
      client
        .query<GetNotionQuery, GetNotionQueryVariables>(GetNotionDocument, {
          url: blockOptions.notionUrl,
          notebookId: notebook.id,
        })
        .then((res) => {
          if (!res.data?.getNotion) return;

          const notionResult = importFromUnknownJson(
            importFromNotion(JSON.parse(res.data.getNotion)),
            {
              columnTypeCoercions: columnTypeCoercionsToRec(typeMappings),
            }
          );
          pushResultToComputer(computer, id, varName, notionResult);
        });
    },
    onShowSource() {
      const store = useConnectionStore.getState();
      const notionStore = useNotionConnectionStore.getState();

      store.abort();
      store.setConnectionType('notion');
      store.setStage('connect');
      store.setExistingIntegration(id);

      const notionResult = importFromUnknownJson(
        importFromNotion(JSON.parse(blockOptions.latestResult)),
        {
          columnTypeCoercions: columnTypeCoercionsToRec(typeMappings),
        }
      );

      if (notionResult) {
        store.setResultPreview(notionResult);
      }

      store.setRawResult(blockOptions.latestResult);
      store.setAllTypeMapping(typeMappings);
      store.setVarName(varName);
      store.changeOpen(true);

      notionStore.Set({
        latestResult: blockOptions.latestResult,
        timeOfLastRun: blockOptions.timeOfLastRun,
        NotionDatabaseUrl: blockOptions.notionUrl,
      });
    },
    onDelete() {
      pushResultToComputer(computer, id, varName, undefined);
    },
  });

  return null;
};
