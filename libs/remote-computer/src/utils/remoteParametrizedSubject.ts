import type { BehaviorSubject } from 'rxjs';
import type { ParametrizedSubjectMethodName } from '../types/parametrizedSubjects';
import type { TSubscriptionCentral } from '../types/SubscriptionCentral';
import type {
  TCommonSubject,
  TCommonSubscriptionParams,
} from '../types/common';

export const remoteParametrizedSubject = <
  TMethodName extends ParametrizedSubjectMethodName,
  TSubject extends TCommonSubject<TMethodName>,
  TArgs extends TCommonSubscriptionParams<TMethodName>
>(
  methodName: TMethodName,
  args: TArgs,
  subscriptionCentral: TSubscriptionCentral,
  defaultValue: TSubject,
  getArgsKey: (_args: TArgs) => string
): BehaviorSubject<TSubject> => {
  return subscriptionCentral.subscribeParametrizedSubject(
    methodName,
    args,
    defaultValue,
    getArgsKey
  );
};
