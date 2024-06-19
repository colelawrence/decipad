import { IntegrationTypes } from '@decipad/editor-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { pushResultToComputer } from '@decipad/live-connect';
import { getNodeString } from '@udecode/plate-common';
import { Result } from '@decipad/language-interfaces';
import { useRunner } from '../runners';
import { useComputer } from '@decipad/editor-hooks';

type UseIntegraionReturn = {
  onRefresh: () => void;

  result: Result.Result | undefined;
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

  const varName = useMemo(
    () => getNodeString(element.children[0]),
    [element.children]
  );

  const runIntegration = useCallback(async () => {
    const res = await runner.import();
    if (res == null || res instanceof Error) {
      // TODO: Error handling
      return;
    }

    setResult(res);
  }, [runner]);

  useEffect(() => {
    if (result == null) {
      return;
    }

    pushResultToComputer(computer, element.id, varName, result);
  }, [computer, element.id, result, varName]);

  useEffect(() => {
    runIntegration();
  }, [runIntegration]);

  useEffect(() => {
    return () => {
      pushResultToComputer(computer, element.id, varName, undefined);
    };
  }, [computer, element.id, varName]);

  return {
    onRefresh: runIntegration,
    result: computerResult?.result,
  };
};
