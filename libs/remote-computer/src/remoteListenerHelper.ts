import { listenerHelper, type ListenerHelper } from '@decipad/listener-helper';
import type { ListenerMethodName } from './types/listeners';
import type { TSubscriptionCentral } from './types/SubscriptionCentral';
import type { TCommonSubject, TCommonSubscriptionParams } from './types/common';

export const remoteListenerHelper = <
  TMethodName extends ListenerMethodName,
  TSubject extends TCommonSubject<TMethodName>,
  TArgs extends TCommonSubscriptionParams<TMethodName>
>(
  methodName: TMethodName,
  subscriptionCentral: TSubscriptionCentral,
  defaultValue: TSubject,
  getArgsKey: (_args: TArgs) => string
): ListenerHelper<TArgs, TSubject> => {
  const getSubject = (...args: TArgs) =>
    subscriptionCentral.subscribe(methodName, defaultValue, args, getArgsKey);

  return listenerHelper<TSubject, TArgs, TSubject>(getSubject);
};
