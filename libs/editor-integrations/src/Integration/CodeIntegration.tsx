import { pushResultToComputer } from '@decipad/live-connect';
import {
  useCodeConnectionStore,
  useComputer,
  useConnectionStore,
  useNotebookId,
} from '@decipad/react-contexts';
import type { ResultMessageType } from '@decipad/safejs';
import { useCallback, useEffect } from 'react';
import { useDeciVariables, useIntegrationOptions } from '../hooks';
import { importFromJSONAndCoercions } from '@decipad/import';
import type { ConcreteIntegrationBlock } from 'libs/editor-types/src/integrations';
import { useWorker } from '@decipad/editor-hooks';

/**
 * Code block integration, child of the regular IntegrationBlock
 * This component handles the execution of user code, and also
 * pushing it to the computer.
 */
export const CodeIntegration = function CodeIntegration({
  typeMappings,
  blockOptions,
  id,
  varName,
}: ConcreteIntegrationBlock<'codeconnection'>): null {
  const computer = useComputer();

  const store = useConnectionStore();
  const codeStore = useCodeConnectionStore();

  const deciVars = useDeciVariables();

  useEffect(() => {
    async function getResult() {
      const result = await importFromJSONAndCoercions(
        blockOptions.latestResult,
        typeMappings
      );

      if (!result) return;

      pushResultToComputer(computer, id, varName, result);
    }

    getResult();
  }, [computer, blockOptions.latestResult, id, varName, typeMappings]);

  const notebookId = useNotebookId();
  const [worker] = useWorker(
    useCallback(
      (msg: ResultMessageType) => {
        async function getResult() {
          const result = await importFromJSONAndCoercions(
            msg.result,
            typeMappings
          );

          if (!result) return;

          pushResultToComputer(computer, id, varName, result);
        }

        getResult();
      },
      [computer, id, varName, typeMappings]
    ),
    useCallback((e) => console.error(e), []),
    notebookId
  );

  useIntegrationOptions({
    onRefresh() {
      worker?.execute(blockOptions.code, deciVars);
    },
    onShowSource() {
      store.abort();

      importFromJSONAndCoercions(
        blockOptions.latestResult,
        store.resultTypeMapping
      ).then((res) => {
        if (res) {
          store.Set({ resultPreview: res });
        }

        store.Set({
          connectionType: 'codeconnection',
          stage: 'connect',
          existingIntegration: id,
          varName,
        });

        store.setAllTypeMapping(typeMappings);
        store.changeOpen(true);

        codeStore.setCode(blockOptions.code);
        codeStore.setLatestResult(blockOptions.latestResult);
      });
    },
    onDelete() {
      pushResultToComputer(computer, id, varName, undefined);
    },
  });

  return null;
};
