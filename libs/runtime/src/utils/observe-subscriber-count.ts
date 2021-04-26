import {
  Observable,
  BehaviorSubject,
  Subject,
  Observer,
  Subscription,
} from 'rxjs';

/* eslint-disable @typescript-eslint/no-empty-function */
export function observeSubscriberCount<T>(
  observable: Observable<T>,
  onSubscribe: () => void = () => {}
): Subject<number> {
  const subscriptionCountObservable = new BehaviorSubject<number>(0);

  const subscribe = observable.subscribe;
  observable.subscribe = (observer: any) => {
    subscriptionCountObservable.next(
      subscriptionCountObservable.getValue() + 1
    );

    const subscription = subscribe.call(
      observable,
      observer as Partial<Observer<T>> | ((value: T) => void)
    );
    const unsubscribe = subscription.unsubscribe;
    let unsubscribed = false;
    subscription.unsubscribe = () => {
      if (unsubscribed) {
        return;
      }
      unsubscribed = true;
      unsubscribe.call(subscription);
      subscriptionCountObservable.next(
        subscriptionCountObservable.getValue() - 1
      );
    };

    onSubscribe();

    return subscription as Subscription;
  };

  return subscriptionCountObservable;
}
