import type { Observable } from 'rxjs';

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

export type Select<SubjectContents, MoreArgs extends Array<unknown>, Ret> = (
  a: SubjectContents,
  ...m: MoreArgs
) => Ret;
