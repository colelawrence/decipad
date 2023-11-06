import { pushResultToComputer } from '@decipad/live-connect';
import {
  useCodeConnectionStore,
  useComputer,
  useConnectionStore,
} from '@decipad/react-contexts';
import type { ResultMessageType } from '@decipad/safejs';
import { useCallback, useEffect } from 'react';
import { useDeciVariables, useIntegrationOptions, useWorker } from '../hooks';
import { importFromJSONAndCoercions } from '@decipad/import';
import { ConcreteIntegrationBlock } from 'libs/editor-types/src/integrations';

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
    const result = importFromJSONAndCoercions(
      blockOptions.latestResult,
      typeMappings
    );
    if (result) {
      pushResultToComputer(computer, id, varName, result);
    }
  }, [computer, blockOptions.latestResult, id, varName, typeMappings]);

  const worker = useWorker(
    useCallback(
      (msg: ResultMessageType) => {
        const result = importFromJSONAndCoercions(msg.result, typeMappings);
        if (result) {
          pushResultToComputer(computer, id, varName, result);
        }
      },
      [computer, id, varName, typeMappings]
    ),
    useCallback((e) => console.error(e), [])
  );

  useIntegrationOptions({
    onRefresh() {
      worker?.execute(blockOptions.code, deciVars);
    },
    onShowSource() {
      store.abort();
      store.setConnectionType('codeconnection');
      store.setStage('connect');
      store.setExistingIntegration(id);

      const res = importFromJSONAndCoercions(
        blockOptions.latestResult,
        store.resultTypeMapping
      );
      if (res) {
        store.setResultPreview(res);
      }

      store.setAllTypeMapping(typeMappings);
      store.setVarName(varName);
      store.changeOpen(true);

      codeStore.setCode(blockOptions.code);
      codeStore.setLatestResult(blockOptions.latestResult);
    },
    onDelete() {
      pushResultToComputer(computer, id, varName, undefined);
    },
  });

  return null;
};
