import { useComputer } from '@decipad/editor-hooks';
import { IntegrationTypes } from '@decipad/editor-types';
import { Result, Unknown } from '@decipad/language-interfaces';
import { getNodeString } from '@udecode/plate-common';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRunner } from '../runners';
import { formatError } from '@decipad/format';
import { pushResultToComputer } from '@decipad/computer-utils';

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
  const [loading, setLoading] = useState<boolean>(false);
  const pushedCache = useRef(false);
  const [gen, setGen] = useState(-1);

  const varName = useMemo(
    () => getNodeString(element.children[0]),
    [element.children]
  );
  const [error, setError] = useState<Error | undefined>();

  const importResultListener = useCallback(
    ([err, importResult]: [
      err: Error | undefined,
      result: Result.Result | undefined
    ]) => {
      setError(err);
      if (importResult) {
        if (importResult.type.kind !== 'pending') {
          if (importResult.type.kind === 'type-error') {
            setError(
              new Error(formatError('en-US', importResult.type.errorCause))
            );
          } else {
            setResult(importResult);
          }
        }
      }
      if (err || importResult) {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (gen < 0) {
      return;
    }
    setLoading(true);
    const unsubscribe = runner.import(importResultListener);

    return () => {
      (async () => {
        (await unsubscribe)();
      })();
    };
  }, [importResultListener, runner, gen]);

  useEffect(() => {
    // push cache if no result has come in yet
    (async () => {
      if (
        !error &&
        (!result || result.type.kind === 'pending') &&
        computerResult != null &&
        computerResult.result?.type.kind !== 'pending' &&
        !pushedCache.current
      ) {
        pushedCache.current = true;
        await pushResultToComputer(
          computer,
          element.id ?? '',
          varName,
          computerResult.result
        );
      }
    })();
  }, [error, computer, computerResult, element.id, result, varName]);

  useEffect(() => {
    // push error result if there an error
    if (error) {
      const errorResult: Result.Result = {
        type: {
          kind: 'type-error',
          errorCause: {
            errType: 'free-form',
            message: error.message,
          },
        },
        value: Unknown,
      };
      pushResultToComputer(computer, element.id ?? '', varName, errorResult);
    }
  }, [computer, element.id, error, varName]);

  useEffect(() => {
    if (result == null) {
      return;
    }

    let canceled = false;

    (async () => {
      if (canceled) {
        return;
      }
      await pushResultToComputer(computer, element.id ?? '', varName, result);
    })();

    return () => {
      canceled = true;
    };
  }, [computer, element.id, result, varName]);

  const refresh = useCallback(() => {
    setGen((g) => g + 1);
  }, []);

  useEffect(() => {
    if (gen >= 0) {
      return;
    }
    // check if we need a refresh
    let canceled = false;

    (async () => {
      await computer.waitForTriedCache();
      if (!canceled && !computerResult && gen < 0) {
        refresh();
      }
    })();

    return () => {
      canceled = true;
    };
  }, [computer, computerResult, gen, refresh]);

  return {
    onRefresh: refresh,
    result: computerResult?.result,
    loading,
    error,
  };
};
