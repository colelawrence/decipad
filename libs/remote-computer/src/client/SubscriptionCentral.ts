import type { SubscriptionLike } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import type { PlainSubjectPropName } from '../types/plainSubjects';
import type { ListenerMethodName } from '../types/listeners';
import type { ParametrizedSubjectMethodName } from '../types/parametrizedSubjects';
import type {
  TSubscribeToRemote,
  TSubscriptionCentral,
} from '../types/SubscriptionCentral';
import type {
  TCommonSubject,
  TCommonSubjectName,
  TCommonSubscriptionParams,
} from '../types/common';

const methodArgsKey = (methodName: string, argsKey: string) =>
  `${methodName}:${argsKey}`;

export interface TSubscribeToRemoteOptions {
  waitForReleaseMs?: number;
}

export const createSubscriptionCentral = (
  subscribeToRemote: TSubscribeToRemote,
  { waitForReleaseMs = 10_000 }: TSubscribeToRemoteOptions = {}
): TSubscriptionCentral => {
  const subscriptionCount = new Map<string, number>();
  const subjects = new Map<
    string,
    BehaviorSubject<TCommonSubject<TCommonSubjectName>>
  >();
  const subscriptions = new Map<string, SubscriptionLike>();
  const subscribing = new Map<string, boolean>();

  const changeSubscriptionCount = (fullSubjectKey: string, delta: number) => {
    subscriptionCount.set(
      fullSubjectKey,
      (subscriptionCount.get(fullSubjectKey) ?? 0) + delta
    );
  };

  const destroyObservable = (fullSubjectKey: string) => {
    subscriptions.get(fullSubjectKey)?.unsubscribe();
    subscriptionCount.delete(fullSubjectKey);
    subscriptions.delete(fullSubjectKey);
    subjects.delete(fullSubjectKey);
  };

  const maybeDestroyObservableInTheNearFuture = (fullSubjectKey: string) => {
    if (
      waitForReleaseMs === 0 &&
      (subscriptionCount.get(fullSubjectKey) ?? 0) === 0 &&
      !subscribing.get(fullSubjectKey)
    ) {
      // immediate release
      destroyObservable(fullSubjectKey);
    } else {
      setTimeout(() => {
        const count = subscriptionCount.get(fullSubjectKey) ?? 0;
        if (count === 0) {
          if (subscribing.get(fullSubjectKey)) {
            return maybeDestroyObservableInTheNearFuture(fullSubjectKey);
          }
          destroyObservable(fullSubjectKey);
        }
      }, waitForReleaseMs);
    }
  };

  const manageSubject = <TSubjectName extends TCommonSubjectName>(
    subject: BehaviorSubject<TCommonSubject<TSubjectName>>,
    fullSubjectKey: string
  ) => {
    const previousSubscribe = subject.subscribe;
    // eslint-disable-next-line no-param-reassign
    subject.subscribe = (...subscribeArgs) => {
      changeSubscriptionCount(fullSubjectKey, 1);
      const subscription = previousSubscribe.apply(
        subject,
        subscribeArgs as Parameters<typeof subject.subscribe>
      );
      const previousUnsubscribe = subscription.unsubscribe;
      let subscribed = true;
      subscription.unsubscribe = () => {
        if (!subscribed) {
          return;
        }
        subscribed = false;
        previousUnsubscribe.call(subscription);
        changeSubscriptionCount(fullSubjectKey, -1);
        maybeDestroyObservableInTheNearFuture(fullSubjectKey);
      };
      return subscription;
    };
    return subject;
  };

  const getObservable = <TSubjectName extends TCommonSubjectName>(
    subjectName: TSubjectName,
    args: TCommonSubscriptionParams<TSubjectName>,
    fullSubjectKey: string,
    defaultValue: TCommonSubject<TSubjectName>
  ): BehaviorSubject<TCommonSubject<TSubjectName>> => {
    let subject: BehaviorSubject<TCommonSubject<TSubjectName>> | undefined =
      subjects.get(fullSubjectKey) as
        | BehaviorSubject<TCommonSubject<TSubjectName>>
        | undefined;
    if (!subject) {
      // creating subject
      subject = new BehaviorSubject(defaultValue);
      manageSubject(subject, fullSubjectKey);
      subjects.set(
        fullSubjectKey,
        subject as unknown as BehaviorSubject<
          TCommonSubject<TCommonSubjectName>
        >
      );

      // creating subscription
      subscribing.set(fullSubjectKey, true);
      subscribeToRemote(subjectName, args, (data) => {
        subject!.next(data);
      })
        .then((subscription) => {
          subscribing.delete(fullSubjectKey);
          subscriptions.set(fullSubjectKey, subscription);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error subscribing to remote', error);
        });
    }
    return subject!;
  };

  const getStaticObservable = <TPropName extends PlainSubjectPropName>(
    subjectName: TPropName,
    defaultValue: TCommonSubject<TPropName>
  ): BehaviorSubject<TCommonSubject<TPropName>> => {
    return getObservable<TPropName>(
      subjectName,
      [] as TCommonSubscriptionParams<TPropName>,
      subjectName,
      defaultValue
    );
  };

  const subscribe = <TMethodName extends ListenerMethodName>(
    subjectName: TMethodName,
    defaultValue: TCommonSubject<TMethodName>,
    args: TCommonSubscriptionParams<TMethodName>,
    getArgsKey: (_args: TCommonSubscriptionParams<TMethodName>) => string
  ): BehaviorSubject<TCommonSubject<TMethodName>> => {
    const argsKey = getArgsKey(args);
    const fullSubjectKey = methodArgsKey(subjectName, argsKey);
    return getObservable<TMethodName>(
      subjectName,
      args,
      fullSubjectKey,
      defaultValue
    );
  };

  const subscribePlainSubject = <
    TPropName extends PlainSubjectPropName,
    TSubj extends TCommonSubject<TPropName> = TCommonSubject<TPropName>
  >(
    subjectName: TPropName,
    defaultValue: TSubj
  ): BehaviorSubject<TSubj> => {
    return getStaticObservable(
      subjectName,
      defaultValue
    ) as BehaviorSubject<TSubj>;
  };

  const subscribeParametrizedSubject = <
    TMethodName extends ParametrizedSubjectMethodName,
    TArgs extends TCommonSubscriptionParams<TMethodName> = TCommonSubscriptionParams<TMethodName>,
    TSubj extends TCommonSubject<TMethodName> = TCommonSubject<TMethodName>
  >(
    subjectName: TMethodName,
    args: TArgs,
    defaultValue: TSubj,
    getArgsKey: (_args: TArgs) => string
  ): BehaviorSubject<TSubj> => {
    const argsKey = getArgsKey(args);
    const fullSubjectKey = methodArgsKey(subjectName, argsKey);

    return getObservable(
      subjectName,
      args,
      fullSubjectKey,
      defaultValue
    ) as BehaviorSubject<TSubj>;
  };

  return {
    subscribe,
    subscribePlainSubject,
    subscribeParametrizedSubject,
  } as TSubscriptionCentral;
};
