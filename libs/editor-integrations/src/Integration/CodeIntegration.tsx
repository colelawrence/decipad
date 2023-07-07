/* eslint-disable no-param-reassign */
import { IntegrationTypes } from '@decipad/editor-types';
import { pushResultToComputer } from '@decipad/live-connect';
import {
  mapResultType,
  useCodeConnectionStore,
  useComputer,
  useConnectionStore,
} from '@decipad/react-contexts';
import type { ResultMessageType } from '@decipad_org/safejs';
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
}: CodeIntegrationProps) {
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
          store.setResultPreview(undefined);

          store.setAllTypeMapping(typeMappings);
          codeStore.setCode(blockOptions.code);
          // code review: does this cycle?
          store.setVarName(varName);
          store.changeOpen(true);
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
  ]);

  return null;
};
