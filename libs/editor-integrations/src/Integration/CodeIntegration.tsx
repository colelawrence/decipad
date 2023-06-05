import { useCallback, useEffect } from 'react';
import { IntegrationTypes } from '@decipad/editor-types';
import { pushResultToComputer } from '@decipad/live-connect';
import {
  useCodeConnectionStore,
  useComputer,
  useConnectionStore,
} from '@decipad/react-contexts';
import type { ResultMessageType } from '@decipad_org/safejs';
import { MaybeResultFromWorker } from '../utils';
import { useWorker } from '../hooks';
import { useIntegrationContext } from '.';

interface CodeIntegrationProps {
  id: string;
  varName: string;
  blockOptions: IntegrationTypes.CodeBlockIntegration;
}

/**
 * Code block integration, child of the regular IntegrationBlock
 * This component handles the execution of user code, and also
 * pushing it to the computer.
 */
export const CodeIntegration = function CodeIntegration({
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
    if (result) {
      pushResultToComputer(computer, id, varName, result);
    }
  }, [computer, blockOptions.latestResult, id, varName]);

  useEffect(() => {
    return () => {
      pushResultToComputer(computer, id, varName, undefined);
    };
  }, [computer, id, varName]);

  const worker = useWorker(
    useCallback(
      (msg: ResultMessageType) => {
        const result = MaybeResultFromWorker(msg.result);
        if (result) {
          pushResultToComputer(computer, id, varName, result);
        }
      },
      [computer, id, varName]
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
          codeStore.setCode(blockOptions.code);
          store.changeOpen(true);
          break;
        }
      }
    });
    return () => {
      sub?.unsubscribe();
    };
  }, [observable, blockOptions.code, worker, store, codeStore, id]);

  return null;
};
