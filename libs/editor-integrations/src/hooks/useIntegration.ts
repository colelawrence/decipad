import { useComputer } from '@decipad/editor-hooks';
import { pushResultToComputer } from '@decipad/editor-live-connect';
import { IntegrationTypes } from '@decipad/editor-types';
import { Result } from '@decipad/language-interfaces';
import { getNodeString } from '@udecode/plate-common';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRunner } from '../runners';

type UseIntegraionReturn = {
  onRefresh: () => void;
  result: Result.Result | undefined;
  loading: boolean;
  error?: Error;
};

export const useIntegration = (
  element: IntegrationTypes.IntegrationBlock
): UseIntegraionReturn => {
  const [result, setResult] = useState<Result.Result | undefined>(undefined);
  const computer = useComputer();
  const computerResult = computer.getBlockIdResult$.use(element.id);
  const runner = useRunner(
    element.integrationType,
    element.typeMappings,
    element.isFirstRowHeader
  );
  const latestVarNameInjectedToComputerRef = useRef<string | undefined>(
    undefined
  );
  const importState = useRef<'idle' | 'importing' | 'imported'>('idle');
  const [loading, setLoading] = useState<boolean>(false);

  const varName = useMemo(
    () => getNodeString(element.children[0]),
    [element.children]
  );
  const [error, setError] = useState<Error | undefined>();

  const runIntegration = useCallback(
    async (controller?: AbortController, force = false) => {
      if (importState.current === 'importing' && !force) {
        return;
      }
      importState.current = 'importing';
      try {
        setLoading(true);
        const res = await runner.import();
        if (controller?.signal.aborted) {
          return;
        }
        if (res == null) {
          return;
        }
        if (res instanceof Error) {
          throw res;
        }

        setResult(res);
        setError(undefined);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
        importState.current = 'imported';
      }
    },
    [runner]
  );

  useEffect(() => {
    if (result == null) {
      return;
    }

    if (
      latestVarNameInjectedToComputerRef.current != null &&
      latestVarNameInjectedToComputerRef.current !== varName
    ) {
      pushResultToComputer(
        computer,
        element.id ?? '',
        latestVarNameInjectedToComputerRef.current,
        undefined
      );
    }
    latestVarNameInjectedToComputerRef.current = varName;
    pushResultToComputer(computer, element.id ?? '', varName, result);
  }, [computer, element.id, result, varName]);

  useEffect(() => {
    const controller = new AbortController();
    runIntegration(controller);

    return () => {
      // abort
      controller.abort();
    };
  }, [runIntegration]);

  return {
    onRefresh: () => runIntegration(undefined, true),
    result: computerResult?.result,
    loading,
    error,
  };
};
