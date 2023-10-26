import { pushResultToComputer } from '@decipad/live-connect';
import {
  useCodeConnectionStore,
  useComputer,
  useConnectionStore,
} from '@decipad/react-contexts';
import type { ResultMessageType } from '@decipad/safejs';
import { useCallback, useEffect } from 'react';
import { useIntegrationContext } from '.';
import { useDeciVariables, useWorker } from '../hooks';
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
  const observable = useIntegrationContext();

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

  useEffect(() => {
    return () => {
      pushResultToComputer(computer, id, varName, undefined);
    };
  }, [computer, id, varName]);

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

  // REFACTOR: Depending on store and codeStore is inefficient and clunky.
  useEffect(() => {
    const sub = observable?.subscribe((action) => {
      switch (action) {
        case 'refresh':
          worker?.execute(blockOptions.code, deciVars);
          break;
        case 'show-source': {
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
          break;
        }
      }
    });
    return () => {
      sub?.unsubscribe();
    };
  }, [
    observable,
    blockOptions.code,
    worker,
    store,
    codeStore,
    varName,
    id,
    typeMappings,
    blockOptions.latestResult,
    deciVars,
  ]);

  return null;
};
