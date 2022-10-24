import { getDefined } from '@decipad/utils';
import { ToStringable } from './types';
import { hasType } from './utils';

type MapFn<T, R> = (a: T) => R;
type IteratorFn<T> = (a: T) => unknown;
type ReducerFn<T> = (initial: T, other: T) => T;

const isStream = <T extends ToStringable>(o: unknown): o is Stream<T> =>
  hasType(o, 'stream');

export class Stream<T extends ToStringable> {
  type = 'stream';
  first: T;
  rest: (() => Stream<T>) | undefined;

  constructor(a: T, b: (() => Stream<T>) | undefined) {
    this.first = a;
    this.rest = b;
  }

  isEmpty() {
    return this.rest == null;
  }

  iterate(f: IteratorFn<T>, j = 0, i = 0): void {
    if (i < j) {
      f(this.first);
      if (!this.isEmpty()) {
        getDefined(this.rest)().iterate(f, j, i + 1);
      }
    }
  }

  forEach(f: IteratorFn<T>) {
    f(this.first);
    if (!this.isEmpty()) {
      getDefined(this.rest)().iterate(f);
    }
  }

  foldr(f: ReducerFn<T>, initial: T): T {
    if (this.isEmpty()) {
      return initial;
    } else {
      return f(this.first, getDefined(this.rest)().foldr(f, initial));
    }
  }

  map<R extends ToStringable>(f: MapFn<T, R>): Stream<R> {
    if (this.isEmpty()) return EMPTY_STREAM;
    else {
      const rest = getDefined(this.rest)().map(f);
      return makeStream(f(this.first), () => rest);
    }
  }

  flatMap<R extends Stream<T>>(f: MapFn<T, R>): R {
    return this.map(f).flatten() as unknown as R;
  }

  flatten(): Stream<T> {
    if (this.isEmpty()) return this;
    else if (isStream(this.first)) {
      const s1 = this.first;
      const s2 = getDefined(this.rest)();
      return s1.append(s2.flatten()) as Stream<T>;
    } else
      return makeStream(this.first).append(getDefined(this.rest)().flatten());
  }

  append(s2: Stream<T>): Stream<T> {
    if (this.isEmpty()) return s2;
    else
      return makeStream(this.first, () => {
        return getDefined(this.rest)().append(s2);
      });
  }

  interleave(s2: Stream<T>): Stream<T> {
    if (this.isEmpty()) return s2;
    else
      return makeStream(this.first, () => {
        return s2.interleave(getDefined(this.rest)());
      });
  }

  extend(val: T): Stream<T> {
    return makeStream(val, () => this);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EMPTY_STREAM = new Stream<any>(undefined, undefined);

export const makeStream = <T extends ToStringable>(
  a: T,
  b: () => Stream<T> = () => EMPTY_STREAM
): Stream<T> => new Stream(a, b);
