/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-this-alias */
import { getDefined } from '@decipad/utils';
import { ToStringable } from './types';
import { isBinding, Val } from './Binding';
import { LogicVar, isLvar } from './LogicVar';

type IteratorFn<T> = (a: T) => unknown;
type MapFn<T, R> = (a: T) => R;
type ReducerFn<T> = (initial: T, other: T) => T;

export class List<T extends ToStringable> {
  readonly type = 'list';
  first: T;
  rest: List<T> | undefined;

  constructor(a: T, b: List<T> | undefined) {
    this.first = a;
    this.rest = b;
  }
  isEmpty() {
    const s = this;
    return s.rest == null;
  }

  append(s2: List<T>): List<T> {
    const s1 = this;
    if (s1.isEmpty()) return s2;
    else return makeList(s1.first, s1.append(s2));
  }

  interleave(s2: List<T>): List<T> {
    const s1 = this;
    if (s1.isEmpty()) return s2;
    else return makeList(s1.first, s2.interleave(getDefined(s1.rest)));
  }

  forEach(f: IteratorFn<T>): void {
    f(this.first);
    if (!this.isEmpty()) {
      getDefined(this.rest).forEach(f);
    }
  }

  foldr(f: ReducerFn<T>, initial: T): T {
    const s = this;
    if (s.isEmpty()) {
      return initial;
    } else {
      return f(s.first, getDefined(s.rest).foldr(f, initial));
    }
  }

  map<R extends ToStringable>(f: MapFn<T, R>): List<R> {
    if (this.isEmpty()) return EMPTY_LIST;
    else {
      const _rest = getDefined(this.rest).map(f);
      return makeList(f(this.first), _rest);
    }
  }

  extend(val: T): List<T> {
    return makeList(val, this);
  }

  walk<R>(fn: (v: T) => R | undefined): R | undefined {
    let l: List<T> | undefined = this;
    do {
      const last = fn(l.first);
      if (last != null) {
        return last;
      }
      l = l.rest;
    } while (l && !l.isEmpty());
    return undefined;
  }

  find(variable: LogicVar | Val | undefined): Val | LogicVar | undefined {
    if (isLvar(variable)) {
      const result = this.walk((binding: T) =>
        isBinding(binding) && binding.variable === variable
          ? binding.val
          : undefined
      );
      if (result != null) {
        return result;
      }
    }
    return variable;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EMPTY_LIST = new List<any>(undefined, undefined);

export const makeList = <T extends ToStringable>(
  a: T,
  b: List<T> = EMPTY_LIST
): List<T> => new List<T>(a, b);
