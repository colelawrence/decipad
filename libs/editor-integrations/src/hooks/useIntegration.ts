import { IntegrationTypes } from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate-common';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRunner } from '../runners';
import { useComputer } from '@decipad/editor-hooks';
import { Result, Unknown } from '@decipad/language-interfaces';
import { pushResultToComputer } from '@decipad/computer-utils';

type UseIntegraionReturn = {
  onRefresh: () => void;
  loading: boolean;
  error?: Error;
};

const PENDING_RESULT: Result.Result = {
  type: { kind: 'pending' },
  value: Unknown,
  meta: undefined,
};

const WAIT_FOR_RESULT_MS = 3000;

const TRY_STAGE_IDLE = 0;
const TRY_STAGE_WAITING_FOR_TRIED_CACHE = 1;
const TRY_STAGE_WAITED_FOR_TRIED_CACHE = 2;
const TRY_STAGE_WAITING_A_BIT_MORE = 3;
const TRY_STAGE_WAITED_A_BIT_MORE = 4;
const TRY_STAGE_REFRESHING = 5;
const TRY_STAGE_HAVE_RELEVANT_RESULT = 100;

export const useIntegration = (
  element: IntegrationTypes.IntegrationBlock
): UseIntegraionReturn => {
  const computer = useComputer();
  const computerResult = computer.getBlockIdResult$.use(element.id);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>();
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

  // push cache if no result has come in yet
  const pushedCache = useRef(false);
  useEffect(() => {
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
    (async () => {
      if (gen < 0) {
        return;
      }
      setLoading(true);
      try {
        const res = await runner.import();
        if (typeof res === 'string') {
          setLoading(false);
          setError(undefined);
        } else if (res) {
          setError(res);
        }
      } catch (err) {
        console.error('useIntegration: Caught error', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    })();
  }, [runner, gen]);

  const refresh = useCallback(() => {
    setGen((g) => g + 1);
  }, []);

  const haveRelevantResult = useCallback(
    () =>
      computerResult != null &&
      computerResult.type === 'computer-result' &&
      computerResult.result.type.kind !== 'pending',
    [computerResult]
  );

  const [tryStage, setTryStage] = useState(TRY_STAGE_IDLE);

  useEffect(() => {
    if (haveRelevantResult()) {
      setTryStage(TRY_STAGE_HAVE_RELEVANT_RESULT);
    }
  }, [haveRelevantResult]);

  useEffect(() => {
    if (tryStage === TRY_STAGE_IDLE && !haveRelevantResult()) {
      setTryStage(TRY_STAGE_WAITING_FOR_TRIED_CACHE);
      computer.waitForTriedCache().then(() => {
        setTryStage(TRY_STAGE_WAITED_FOR_TRIED_CACHE);
      });
    }
  }, [computer, haveRelevantResult, tryStage]);

  useEffect(() => {
    if (
      tryStage === TRY_STAGE_WAITED_FOR_TRIED_CACHE &&
      !haveRelevantResult()
    ) {
      setTryStage(TRY_STAGE_WAITING_A_BIT_MORE);
      setTimeout(() => {
        setTryStage(TRY_STAGE_WAITED_A_BIT_MORE);
      }, WAIT_FOR_RESULT_MS);
    }
  }, [haveRelevantResult, tryStage]);

  useEffect(() => {
    if (tryStage === TRY_STAGE_WAITED_A_BIT_MORE && !haveRelevantResult()) {
      setTryStage(TRY_STAGE_REFRESHING);
      pushResultToComputer(
        computer,
        element.id ?? '',
        varName,
        PENDING_RESULT
      ).finally(() => {
        refresh();
      });
    }
  }, [computer, element.id, haveRelevantResult, refresh, tryStage, varName]);

  return {
    onRefresh: refresh,
    loading,
    error,
  };
};
