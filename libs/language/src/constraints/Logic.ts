import DeciNumber from '@decipad/number';
import { inf, minusInf } from './consts';
import { Domain, getDomain, intersection, makeDomain } from './Domain';
import { EMPTY_PACKAGE, Package } from './Package';
import { ConstraintFn, runConstraints } from './Constraint';
import { EMPTY_STREAM, makeStream } from './Stream';
import { isLvar, LogicVar } from './LogicVar';
import { makeBinding, Val } from './Binding';
import { Frame } from './Frame';
import { Goal, makeGoal } from './Goal';
import { isLogicNumber } from './utils';
import { equals } from './Infinity';

export const dom = (x: LogicVar, min: DeciNumber, max: DeciNumber) => {
  return (p: Package) => {
    const d = makeDomain(min, max);
    // const wx = p.walk(x);
    const dx = getDomain(p, x);
    const di = intersection(dx, d);
    // di returns false when it fails
    // in that case, the goal will fail
    if (di) return win(p.extendDomain(x, di));
    else return fail();
  };
};

export const add = (
  x: LogicVar | Val,
  y: LogicVar | Val,
  z: LogicVar | Val
) => {
  return makeGoal(addC, [x, y, z], '+');
};

export const sub = (
  x: LogicVar | Val,
  y: LogicVar | Val,
  z: LogicVar | Val
) => {
  return add(z, y, x); // x-y=z is the same as x=z+y
};

export const mul = (
  x: LogicVar | Val,
  y: LogicVar | Val,
  z: LogicVar | Val
) => {
  return makeGoal(mulC, [x, y, z], '*');
};

export const div = (
  x: LogicVar | Val,
  y: LogicVar | Val,
  z: LogicVar | Val
) => {
  return mul(z, y, x); // x/y=z is the same as x=z*y
};

export const lessEqual = (x: LogicVar | Val, y: LogicVar | Val): Goal => {
  return makeGoal(lessEqualC, [x, y], '<=');
};

export const lessEqualC: ConstraintFn = (
  x: LogicVar | Val,
  y: LogicVar | Val
) => {
  return (p: Package) => {
    const wx = p.find(x);
    const wy = p.find(y);
    const dx = getDomain(p, wx);
    const dy = getDomain(p, wy);
    const di = intersection(dx, makeDomain(minusInf, dy.max));
    if (di) {
      const di2 = intersection(dy, makeDomain(dx.min, inf));
      if (di2) {
        const p1 = p.extendDomain(x, di);
        const p2 = p1.extendDomain(y, di2);
        return p2;
      }
    }
    return false;
  };
};

export const addC: ConstraintFn = (
  x: LogicVar | Val,
  y: LogicVar | Val,
  z: LogicVar | Val
) => {
  // X + Y = Z
  // z=x+y
  // x=z-y
  // y=z-x
  return (p: Package) => {
    const wx = p.find(x);
    const wy = p.find(y);
    const wz = p.find(z);
    let dx: Domain | false = getDomain(p, wx);
    let dy: Domain | false = getDomain(p, wy);
    let dz: Domain | false = getDomain(p, wz);
    dz = intersection(dz, dx.add(dy));
    if (dz) {
      dx = intersection(dx, dz.sub(dy));
      if (dx) {
        dy = intersection(dy, dz.sub(dx));
        if (dy) {
          return p.extendDomain(x, dx).extendDomain(y, dy).extendDomain(z, dz);
        }
      }
    }
    return false;
  };
};

export const mulC: ConstraintFn = (
  x: LogicVar | Val,
  y: LogicVar | Val,
  z: LogicVar | Val
) => {
  // X * Y = Z
  // z=x*y
  // x=z/y
  // y=z/x
  return (p: Package): Package | false => {
    const wx = p.find(x);
    const wy = p.find(y);
    const wz = p.find(z);
    let dx: Domain | false = getDomain(p, wx);
    let dy: Domain | false = getDomain(p, wy);
    let dz: Domain | false = getDomain(p, wz);
    dz = intersection(dz, dx.mul(dy));
    if (dz) {
      const divided = dz.div(dy);
      if (divided) {
        dx = intersection(dx, divided);
        if (dx) {
          const divided2 = dz.div(dx);
          if (divided2) {
            dy = intersection(dy, divided2);
            if (dy) {
              return p
                .extendDomain(x, dx)
                .extendDomain(y, dy)
                .extendDomain(z, dz);
            }
          }
        }
      }
    }
    return false;
  };
};

export const nil = EMPTY_PACKAGE; // a goal needs a package; therefore it initially receives 'nil' (the first package)

export const unify = (
  a: LogicVar | Val | undefined,
  b: LogicVar | Val | undefined,
  frame: Frame | false
): Frame | false => {
  if (frame === false) return false;
  a = frame.find(a);
  b = frame.find(b);
  if (a === b || (isLogicNumber(a) && isLogicNumber(b) && equals(a, b)))
    return frame;
  else if (isLvar(a)) {
    // is variable
    return frame.extend(makeBinding(a, b as Val));
  } else if (isLvar(b)) {
    // is variable
    return frame.extend(makeBinding(b, a as Val));
  } else return false;
};

/*
	a goal/relation takes a package and returns a stream of packages (an empty stream stands for a 'fail'/'false' goal)
*/

export const eq = (a: LogicVar | Val, b: LogicVar | Val) => {
  // 'goal' version of unify
  return (p: Package) => {
    const f = p.frame;
    const f2 = unify(a, b, f);
    if (f2) {
      const p2 = p.setFrame(f2);
      if (f === f2 || p.store.isEmpty()) {
        return win(p2);
      }
      // check constraints first
      const p3 = runConstraints(p2.store, p2);
      if (p3) {
        return win(p3);
      }
    }
    return fail();
  };
};

export const win = (pack: Package) => makeStream(pack || nil);

export const fail = () => EMPTY_STREAM;
