/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { getDefined } from '@decipad/utils';
import { win, fail, nil } from './logicUtils';
import { isLvar, LogicVar } from './LogicVar';
import type { Package } from './Package';
import { Stream } from './Stream';
import { ConstraintFn, makeConstraint } from './Constraint';
import { Val } from './Binding';

export type Goal = (f: Package) => Stream<Package>;

export const makeGoal = (
  fn: ConstraintFn,
  args: Array<LogicVar | Val>,
  name: string
): Goal => {
  const c = makeConstraint(fn, args, name);
  return (p: Package) => {
    const pc = p.extendConstraint(c);
    const p2 = c.proc(pc);
    if (p2) return win(p2);
    else return fail();
  };
};

export const disj =
  (g1: Goal, g2: Goal): Goal =>
  (f: Package) =>
    g1(f).append(g2(f));

export const or = (...args: Goal[]): Goal => {
  if (args.length === 0) return fail;
  if (args.length === 1) return args[0];
  const g = disj(args[0], or(...args.slice(1)));
  return g;
};

export const conj =
  (g1: Goal, g2: Goal): Goal =>
  (f: Package): Stream<Package> => {
    const s1 = g1(f);
    return s1.flatMap(g2);
  };

export const and = (...args: Goal[]): Goal => {
  if (args.length === 0) return win;
  if (args.length === 1) return args[0];
  return conj(args[0], and(...args.slice(1)));
};

export const implies = (g1: Goal, g2: Goal, g3?: Goal): Goal => {
  // g1 -> g2 ; g3
  return (p: Package) => {
    const s1 = g1(p);
    if (s1.isEmpty()) return g3 ? g3(p) : win(p);
    else return s1.flatMap(g2);
  };
};

export const run = (g: Goal, v1: LogicVar | LogicVar[], n = Infinity) => {
  // runs goal getting the first n results of variables
  // n is optional (n=n or infinity)
  // v is variable or array of variables
  let s = g(nil);
  const result = [];
  const vs = Array.isArray(v1) ? v1 : [v1];
  for (let i = 0; i < n && !s.isEmpty(); ++i) {
    const pack = s.first;
    const { frame } = pack;
    // get array of variables into result
    const vals = [];
    for (const v of vs) {
      const v2 = frame.find(v);
      const _temp = isLvar(v2) ? pack.getValue(v2) : v2;
      vals.push(_temp);
    }
    result.push(vals);
    s = getDefined(s.rest)();
  }
  return result;
};
