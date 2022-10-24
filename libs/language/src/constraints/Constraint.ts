import { getDefined } from '@decipad/utils';
import { Val } from './Binding';
import type { List } from './List';
import { LogicVar } from './LogicVar';
import type { Package } from './Package';

export type ConstraintFn = (
  ...args: Array<LogicVar | Val>
) => (p: Package) => Package | false;

export type ConstraintStore = List<Constraint>;

export class Constraint {
  fn: ConstraintFn;
  args: Array<LogicVar | Val>;
  name: string;

  constructor(fn: ConstraintFn, args: Array<LogicVar | Val> = [], name = '') {
    this.fn = fn;
    this.args = args;
    this.name = name || '';
  }

  // calls constraint
  // c->proc takes a package and returns a modified package or false
  proc(p: Package): Package | false {
    return this.fn(...this.args)(p);
  }
}

export const makeConstraint = (
  fn: ConstraintFn,
  args: Array<LogicVar | Val>,
  name: string
) => {
  return new Constraint(fn, args, name);
};

export const runConstraints = (store: ConstraintStore, p0: Package) => {
  let p: Package | false = p0;
  let cs = store;
  while (!cs.isEmpty()) {
    const c = cs.first;
    p = c.proc(p);
    if (p === false) return false;
    cs = getDefined(cs.rest);
  }
  return p;
};
