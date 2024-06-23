import type { BehaviorSubject, SubscriptionLike } from 'rxjs';
import type { ListenerMethodName } from './listeners';
import type { ParametrizedSubjectMethodName } from './parametrizedSubjects';
import type { PlainSubjectPropName } from './plainSubjects';
import type {
  TCommonSubject,
  TCommonSubjectName,
  TCommonSubscriptionParams,
} from './common';

export interface TSubscriptionCentral {
  subscribe<
    TMethodName extends ListenerMethodName,
    TArgs extends TCommonSubscriptionParams<TMethodName> = TCommonSubscriptionParams<TMethodName>,
    TSubj extends TCommonSubject<TMethodName> = TCommonSubject<TMethodName>
  >(
    subjectName: TMethodName,
    defaultValue: TSubj,
    args: TArgs,
    getArgsKey: (_args: TArgs) => string
  ): BehaviorSubject<TSubj>;

  subscribeParametrizedSubject<
    TMethodName extends ParametrizedSubjectMethodName,
    TArgs extends TCommonSubscriptionParams<TMethodName> = TCommonSubscriptionParams<TMethodName>,
    TSubj extends TCommonSubject<TMethodName> = TCommonSubject<TMethodName>
  >(
    subjectName: TMethodName,
    args: TArgs,
    defaultValue: TSubj,
    getArgsKey: (_args: TArgs) => string
  ): BehaviorSubject<TSubj>;

  subscribePlainSubject<
    TPropName extends PlainSubjectPropName,
    TSubj extends TCommonSubject<TPropName> = TCommonSubject<TPropName>
  >(
    subjectName: TPropName,
    defaultValue: TSubj
  ): BehaviorSubject<TSubj>;
}

export type TNotification<TMethodName extends TCommonSubjectName> = {
  subscriptionId: string;
  notification: TCommonSubject<TMethodName>;
};

export type TSubscribeToRemote = <
  TMethodName extends TCommonSubjectName,
  TArgs = TCommonSubscriptionParams<TMethodName>
>(
  subjectName: TMethodName,
  args: TArgs,
  listener: (_args: TCommonSubject<TMethodName>) => unknown
) => Promise<SubscriptionLike>;
