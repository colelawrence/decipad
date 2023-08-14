/* eslint-disable no-param-reassign */
import { IntegrationTypes } from '@decipad/editor-types';
import { pushResultToComputer } from '@decipad/live-connect';
import {
  useCodeConnectionStore,
  useComputer,
  useConnectionStore,
} from '@decipad/react-contexts';
import type { ResultMessageType } from '@decipad/safejs';
import { mapResultType } from '@decipad/computer';
import { useCallback, useEffect } from 'react';
import { useIntegrationContext } from '.';
import { useWorker } from '../hooks';
import { MaybeResultFromWorker } from '../utils';

interface CodeIntegrationProps {
  id: string;
  varName: string;
  typeMappings: IntegrationTypes.IntegrationBlock['typeMappings'];
  blockOptions: IntegrationTypes.CodeBlockIntegration;
}

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
}: CodeIntegrationProps): null {
  const computer = useComputer();
  const observable = useIntegrationContext();

  const store = useConnectionStore();
  const codeStore = useCodeConnectionStore();

  useEffect(() => {
    const result = MaybeResultFromWorker(blockOptions.latestResult);
    if (!result) return;

    const mappedResult = mapResultType(result, typeMappings);
    pushResultToComputer(computer, id, varName, mappedResult);
  }, [computer, blockOptions.latestResult, id, varName, typeMappings]);

  useEffect(() => {
    return () => {
      pushResultToComputer(computer, id, varName, undefined);
    };
  }, [computer, id, varName]);

  const worker = useWorker(
    useCallback(
      (msg: ResultMessageType) => {
        const result = MaybeResultFromWorker(msg.result);
        if (!result) return;
        const mappedResult = mapResultType(result, typeMappings);
        pushResultToComputer(computer, id, varName, mappedResult);
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
          worker?.execute(blockOptions.code);
          break;
        case 'show-source': {
          store.abort();
          store.setConnectionType('codeconnection');
          store.setStage('connect');
          store.setExistingIntegration(id);

          const res = MaybeResultFromWorker(blockOptions.latestResult);
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
  ]);

  return null;
};
