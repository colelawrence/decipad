import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
import type { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { dequal, identity } from '@decipad/utils';
import type { ListenerHelper, Select } from './types';

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
  select: Select<
    SubjectContents,
    MoreArgs,
    Ret
  > = identity as unknown as Select<SubjectContents, MoreArgs, Ret>
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

  const useWithSelector = <T>(pick: (item: Ret) => T, ...a: MoreArgs): T =>
    useSyncExternalStoreWithSelector(
      rootSubscribe(a),
      rootGet(a),
      rootGet(a),
      (item) => pick(select(item, ...a)),
      dequal
    );

  const use = (...a: MoreArgs) => useWithSelector(identity, ...a);

  const useWithSelectorDebounced = <T>(
    debounceTimeMs: number,
    pick: (item: Ret) => T,
    ...a: MoreArgs
  ): T =>
    useSyncExternalStoreWithSelector(
      rootSubscribeDebounced(debounceTimeMs, a),
      rootGet(a),
      rootGet(a),
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
