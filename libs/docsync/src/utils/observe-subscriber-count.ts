import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs';

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-param-reassign */
export function observeSubscriberCount<T>(
  observable: Observable<T>,
  onSubscribe: () => void = () => {}
): Subject<number> {
  const subscriptionCountObservable = new BehaviorSubject<number>(0);

  const { subscribe } = observable;
  observable.subscribe = (...args) => {
    subscriptionCountObservable.next(
      subscriptionCountObservable.getValue() + 1
    );

    // @ts-expect-error re-applying args hard to type
    const subscription = subscribe.apply(observable, args);
    const { unsubscribe } = subscription;
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
