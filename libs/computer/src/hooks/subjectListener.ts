import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import { dequal } from 'dequal';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { identity } from '@decipad/utils';

/**
 * Multipurpose listener helper.
 *
 * - .observe() is an rxjs Observable
 * - .use() and .useWithSelector() are react hooks
 * - .get() just gets the value once
 */
export interface ListenerHelper<Args extends unknown[], Ret> {
  observe(...a: Args): Observable<Ret>;
  observeWithSelector<T>(selector: (item: Ret) => T, ...a: Args): Observable<T>;
  use(...a: Args): Ret;
  useWithSelector<T>(selector: (item: Ret) => T, ...a: Args): T;
  get(...a: Args): Ret;
}

export function listenerHelper<
  SubjectContents,
  MoreArgs extends unknown[],
  Ret
>(
  subject: BehaviorSubject<SubjectContents>,
  select: (a: SubjectContents, ...m: MoreArgs) => Ret
): ListenerHelper<MoreArgs, Ret> {
  const rootSubscribe = (callback: () => void) => {
    const sub = subject.subscribe(callback);
    return () => sub.unsubscribe();
  };

  const rootGet = () => subject.getValue();

  const get = (...a: MoreArgs) => select(subject.getValue(), ...a);

  const observe = (...a: MoreArgs) =>
    subject.pipe(
      map((item) => select(item, ...a)),
      distinctUntilChanged((cur, next) => dequal(cur, next))
    );

  const observeWithSelector = <T>(
    pick: (item: Ret) => T,
    ...a: MoreArgs
  ): Observable<T> =>
    subject.pipe(
      map((item) => pick(select(item, ...a))),
      distinctUntilChanged((cur, next) => dequal(cur, next))
    );

  const use = (...a: MoreArgs) => useWithSelector(identity, ...a);

  const useWithSelector = <T>(pick: (item: Ret) => T, ...a: MoreArgs): T =>
    useSyncExternalStoreWithSelector(
      rootSubscribe,
      rootGet,
      undefined,
      (item) => pick(select(item, ...a)),
      dequal
    );

  return { get, observe, observeWithSelector, use, useWithSelector };
}
