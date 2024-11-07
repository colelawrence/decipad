import { useState, useEffect } from 'react';
import { useComputer } from './useComputer';
import { ResultType } from '@decipad/computer-interfaces';

export interface UseExpressionResultOptions {
  enabled?: boolean;
}

export const useExpressionResult = (
  expression: string,
  { enabled = true }: UseExpressionResultOptions = {}
) => {
  const computer = useComputer();
  const [result, setResult] = useState<ResultType | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const observable = computer.expressionResultFromText$(expression);
    const sub = observable.subscribe(setResult);
    return () => sub.unsubscribe();
  }, [computer, expression, enabled]);

  return enabled ? result : null;
};
