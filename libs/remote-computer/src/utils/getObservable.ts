import type { Computer } from '@decipad/computer-interfaces';
import type {
  TCommonSubscriptionParams,
  TCommonSubjectName,
  TCommonSubject,
} from '../types/common';
import type { ListenerMethodName } from '../types/listeners';
import type { Observable } from 'rxjs';
import type { ListenerHelper } from '@decipad/listener-helper';
import type { PlainSubjectPropName } from '../types/plainSubjects';

export const getObservable = <TMethodName extends TCommonSubjectName>(
  computer: Computer,
  methodName: TMethodName,
  params: TCommonSubscriptionParams<TMethodName>
): Observable<TCommonSubject<TMethodName>> => {
  switch (methodName) {
    // Listeners
    case 'blocksInUse$':
    case 'explainDimensions$':
    case 'getAllColumns$':
    case 'getBlockIdAndColumnId$':
    case 'getColumnNameDefinedInBlock$':
    case 'getBlockIdResult$':
    case 'getSymbolOrTableDotColumn$':
    case 'getParseableTypeInBlock$':
    case 'getSymbolDefinedInBlock$':
    case 'getSetOfNamesDefined$':
    case 'getVarResult$':
    case 'getVarBlockId$':
    case 'getNamesDefined$':
    case 'results$': {
      const listenerMethodName = methodName as ListenerMethodName;
      const listener = computer[listenerMethodName] as ListenerHelper<
        TCommonSubscriptionParams<TMethodName>,
        TCommonSubject<TMethodName>
      >;
      return listener.observe.apply(computer, params);
    }
    // Parametrized subjects
    case 'blockToMathML$':
    case 'expressionResultFromText$':
    case 'blockResultFromText$': {
      const method = computer[methodName] as (
        ...args: TCommonSubscriptionParams<TMethodName>
      ) => Observable<TCommonSubject<TMethodName>>;
      return method.apply(computer, params);
    }

    // Plain subjects
    case 'results': {
      const propName = methodName as PlainSubjectPropName;
      return computer[propName] as unknown as Observable<
        TCommonSubject<TMethodName>
      >;
    }
    default: {
      throw new TypeError(`Unknown methodName: ${methodName}`);
    }
  }
};
