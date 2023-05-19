import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import { dequal, identity } from '@decipad/utils';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

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
  useWithSelectorDebounced<T>(
    debounceTimeMs: number,
    selector: (item: Ret) => T,
    ...a: Args
  ): T;
  get(...a: Args): Ret;
}

type ListenerHelperSubject<SubjectContents, MoreArgs extends unknown[]> =
  | BehaviorSubject<SubjectContents>
  | ((...args: MoreArgs) => BehaviorSubject<SubjectContents>);

const getSubject = <SubjectContents, MoreArgs extends unknown[]>(
  subject: ListenerHelperSubject<SubjectContents, MoreArgs>,
  args: MoreArgs
): BehaviorSubject<SubjectContents> => {
  if (typeof subject === 'function') {
    return subject(...args);
  }
  return subject;
};

export function listenerHelper<
  SubjectContents,
  MoreArgs extends unknown[],
  Ret
>(
  subject: ListenerHelperSubject<SubjectContents, MoreArgs>,
  select: (a: SubjectContents, ...m: MoreArgs) => Ret
): ListenerHelper<MoreArgs, Ret> {
  const rootSubscribe = (args: MoreArgs) => (callback: () => void) => {
    const sub = getSubject(subject, args).subscribe(callback);
    return () => sub.unsubscribe();
  };

  const rootSubscribeDebounced =
    (debounceTimeMs: number, args: MoreArgs) => (callback: () => void) => {
      const sub = getSubject(subject, args)
        .pipe(debounceTime(debounceTimeMs))
        .subscribe(callback);
      return () => sub.unsubscribe();
    };

  const rootGet = (args: MoreArgs) => () =>
    getSubject(subject, args).getValue();

  const get = (...a: MoreArgs) =>
    select(getSubject(subject, a).getValue(), ...a);

  const observe = (...a: MoreArgs) =>
    getSubject(subject, a).pipe(
      map((item) => select(item, ...a)),
      distinctUntilChanged((cur, next) => dequal(cur, next))
    );

  const observeWithSelector = <T>(
    pick: (item: Ret) => T,
    ...a: MoreArgs
  ): Observable<T> =>
    getSubject(subject, a).pipe(
      map((item) => pick(select(item, ...a))),
      distinctUntilChanged((cur, next) => dequal(cur, next))
    );

  const use = (...a: MoreArgs) => useWithSelector(identity, ...a);

  const useWithSelector = <T>(pick: (item: Ret) => T, ...a: MoreArgs): T =>
    useSyncExternalStoreWithSelector(
      rootSubscribe(a),
      rootGet(a),
      undefined,
      (item) => pick(select(item, ...a)),
      dequal
    );

  const useWithSelectorDebounced = <T>(
    debounceTimeMs: number,
    pick: (item: Ret) => T,
    ...a: MoreArgs
  ): T =>
    useSyncExternalStoreWithSelector(
      rootSubscribeDebounced(debounceTimeMs, a),
      rootGet(a),
      undefined,
      (item) => pick(select(item, ...a)),
      dequal
    );

  return {
    get,
    observe,
    observeWithSelector,
    use,
    useWithSelector,
    useWithSelectorDebounced,
  };
}
