import { Result } from '@decipad/remote-computer';
import { useComputer } from './useComputer';
import { useEffect, useRef, useState } from 'react';

export type UseDelayedResultReturn = {
  result: Result.Result | undefined;
  state: 'loading' | 'loaded';
};

export const useDelayedResult = (
  id: string,
  timeout = 3_000
): UseDelayedResultReturn => {
  const computer = useComputer();
  const freshResult = computer.getBlockIdResult$.use(id);

  const [result, setResult] = useState<UseDelayedResultReturn>({
    result: freshResult?.result,
    state: 'loading',
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    const setUndefinedResult = () => {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setResult({ result: undefined, state: 'loaded' });
      }, timeout);
    };

    if (freshResult == null || freshResult.type === 'identified-error') {
      setUndefinedResult();
      return;
    }

    const { result: res } = freshResult;

    if (res.type.kind === 'pending') {
      setResult((r) => ({ ...r, state: 'loading' }));
      setUndefinedResult();
      return;
    }

    setResult({ result: res, state: 'loaded' });
    clearTimeout(timeoutRef.current);
  }, [freshResult, timeout]);

  return result;
};
