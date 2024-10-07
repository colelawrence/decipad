import { IntegrationTypes } from '@decipad/editor-types';
import { Result, Unknown } from '@decipad/language-interfaces';
import { getNodeString } from '@udecode/plate-common';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRunner } from '../runners';
import { useComputer } from '@decipad/editor-hooks';
import { pushResultToComputer } from '@decipad/computer-utils';

type UseIntegraionReturn = {
  onRefresh: () => void;
  loading: boolean;
  error?: Error;
};

export const useIntegration = (
  element: IntegrationTypes.IntegrationBlock
): UseIntegraionReturn => {
  const computer = useComputer();
  const computerResult = computer.getBlockIdResult$.use(element.id);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
  const pushedCache = useRef(false);
  const [gen, setGen] = useState(-1);

  const varName = useMemo(
    () => getNodeString(element.children[0]),
    [element.children]
  );
  const runner = useRunner(
    varName,
    element.id!,
    element.integrationType,
    element.typeMappings,
    element.isFirstRowHeader
  );

  useEffect(() => {
    runner.setName(varName);
  }, [runner, varName]);

  // first result is unknown
  const pushedUnknown = useRef(false);
  useEffect(() => {
    if (!pushedUnknown.current) {
      pushedUnknown.current = true;
      pushResultToComputer(computer, element.id ?? '', varName, {
        type: {
          kind: 'pending',
        },
        value: Unknown,
        meta: undefined,
      });
    }
  }, [computer, element.id, varName]);

  useEffect(() => {
    (async () => {
      if (gen < 0) {
        return;
      }
      setLoading(true);
      const res = await runner.import();
      if (typeof res === 'string') {
        setLoading(false);
      } else if (res) {
        setError(res);
        setLoading(false);
      }
    })();
  }, [runner, gen]);

  useEffect(() => {
    // push cache if no result has come in yet
    (async () => {
      if (
        !error &&
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
  }, [error, computer, computerResult, element.id, varName]);

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
    loading,
    error,
  };
};
