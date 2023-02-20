import type { Domain } from './Domain';
import { EMPTY_LIST, List } from './List';
import { Binding, isBinding, makeBinding, Val } from './Binding';
import { isLvar, LogicVar } from './LogicVar';
import { Constraint } from './Constraint';
import { Frame } from './Frame';
import { getDefined } from '../utils';
import { ToStringable } from './types';
import { equals } from './Infinity';

export class Package {
  readonly type = 'package';
  readonly frame: Frame;
  readonly store: List<Constraint>;
  readonly domains: List<Domain | Binding>;

  constructor(f: Frame, cs: List<Constraint>, d: List<Domain | Binding>) {
    this.frame = f;
    this.store = cs;
    this.domains = d;
  }

  lookupBindingHelper<T extends ToStringable>(
    list: List<T>,
    variable: LogicVar
  ): Binding | false {
    if (list === EMPTY_LIST || list.isEmpty()) {
      return false;
    } else if (isBinding(list.first) && list.first.variable === variable) {
      return list.first;
    } else {
      return this.lookupBindingHelper(getDefined(list.rest), variable);
    }
  }

  lookupBinding(variable: LogicVar) {
    return this.lookupBindingHelper(this.frame, variable);
  }

  lookupDomainBinding(variable: LogicVar): Binding | false {
    return this.lookupBindingHelper(this.domains, variable);
  }

  isEmpty() {
    return this.frame.isEmpty();
  }

  setFrame(f: Frame) {
    return makePackage(f, this.store, this.domains);
  }

  extendBinding(variable: LogicVar, val: Val) {
    return makePackage(
      this.frame.extend(makeBinding(variable, val)),
      this.store,
      this.domains
    );
  }

  extendDomain(v: LogicVar | Val, d: Domain): Package {
    if (equals(d.min, d.max)) {
      if (isLvar(v)) return this.extendBinding(v, d.min);
      else return this;
    }
    return new Package(
      this.frame,
      this.store,
      this.domains.extend(makeBinding(v as LogicVar, d))
    );
  }

  extendConstraint(c: Constraint): Package {
    return makePackage(this.frame, this.store.extend(c), this.domains);
  }

  extend(binding: Binding) {
    return makePackage(this.frame.extend(binding), this.store, this.domains);
  }

  // finds out what value a variable is associated with, e.g.
  // walk(x, |x=2|) ==> 2
  // walk(x, |x=y|) ==> y
  // walk(x, |x=y;y=w;w=2|) ==> 2
  // walk(x, |w=y|) ==> x
  find(variable: LogicVar | Val): LogicVar | Val {
    return this.frame.find(variable) as LogicVar | Val;
  }

  getValue(variable: LogicVar): Val | undefined {
    const result = this.lookupBinding(variable);
    if (result) {
      return result.val;
    } else {
      const inDomain = this.lookupDomainBinding(variable);
      return inDomain ? inDomain.val : undefined;
    }
  }
}

export const EMPTY_PACKAGE = new Package(
  EMPTY_LIST as Frame,
  EMPTY_LIST,
  EMPTY_LIST
);

export const makePackage = (
  f: Frame,
  cs: List<Constraint>,
  ds: List<Domain | Binding>
) => {
  return new Package(f, cs, ds);
};
