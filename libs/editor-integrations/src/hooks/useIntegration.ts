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
  const firstTime = useRef(true);
  const pushedCache = useRef(false);

  const varName = useMemo(
    () => getNodeString(element.children[0]),
    [element.children]
  );
  const [error, setError] = useState<Error | undefined>();

  const runIntegration = useCallback(
    async (controller?: AbortController, force = false) => {
      if (controller?.signal.aborted) {
        return;
      }
      if ((loading || error) && !force) {
        return;
      }
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
        if (res.type.kind === 'type-error') {
          throw new Error(formatError('en-US', res.type.errorCause));
        }

        setResult(res);
        setError(undefined);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    },
    [loading, error, runner]
  );

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

  useEffect(() => {
    const controller = new AbortController();
    if (firstTime.current) {
      firstTime.current = false;
      runIntegration(controller);
    }
  }, [runIntegration]);

  return {
    onRefresh: () => runIntegration(undefined, true),
    result: computerResult?.result,
    loading,
    error,
  };
};
