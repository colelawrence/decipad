import {
  Context,
  ContextStats,
  InterpreterStats,
  Realm,
  initialInferStats,
  initialInterpreterStats,
} from '@decipad/language';
import cloneDeep from 'lodash.clonedeep';
import { BehaviorSubject } from 'rxjs';

export type ComputerStat = ComputerRequestStat &
  ContextStats &
  InterpreterStats; // for now

interface ComputerRequestStat {
  fullRequestElapsedTimeMs: number;
}

const initialComputerRequestStats = (): ComputerRequestStat => ({
  fullRequestElapsedTimeMs: 0,
});

export interface ComputerExpressionResultStat {
  expressionResultElapsedTimeMs: number;
}

const initialComputerExpressionResultStats =
  (): ComputerExpressionResultStat => ({
    expressionResultElapsedTimeMs: 0,
  });

export type ComputerStats = {
  computerRequestStat$: BehaviorSubject<ComputerStat>;
  pushComputerRequestStat: (stat: ComputerRequestStat) => void;

  pushComputerExpressionResultStat: (
    stat: ComputerExpressionResultStat
  ) => void;
  computerExpressionResultStat$: BehaviorSubject<
    ComputerExpressionResultStat & ContextStats & InterpreterStats
  >;
};

export const createComputerStats = (
  inferContext: Context,
  interpreterRealm: Realm
): ComputerStats => {
  const computerRequestStat$ = new BehaviorSubject<ComputerStat>({
    ...initialComputerRequestStats(),
    ...initialInferStats(),
    ...initialInterpreterStats(),
  });
  const pushComputerRequestStat = (stat: ComputerRequestStat) => {
    const inferStats = cloneDeep(inferContext.stats);
    inferContext.clearStats();

    const interpreterStats = cloneDeep(interpreterRealm.stats);
    interpreterRealm.clearStats();

    computerRequestStat$.next({ ...stat, ...inferStats, ...interpreterStats });
  };

  const computerExpressionResultStat$ = new BehaviorSubject<
    ComputerExpressionResultStat & ContextStats & InterpreterStats
  >({
    ...initialComputerExpressionResultStats(),
    ...initialInferStats(),
    ...initialInterpreterStats(),
  });
  const pushComputerExpressionResultStat = (
    stat: ComputerExpressionResultStat
  ) => {
    const inferStats = cloneDeep(inferContext.stats);
    inferContext.clearStats();

    const interpreterStats = cloneDeep(interpreterRealm.stats);
    interpreterRealm.clearStats();

    computerExpressionResultStat$.next({
      ...stat,
      ...inferStats,
      ...interpreterStats,
    });
  };

  return {
    computerRequestStat$,
    pushComputerRequestStat,
    computerExpressionResultStat$,
    pushComputerExpressionResultStat,
  };
};
