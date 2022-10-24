/* eslint-disable camelcase */

import Fraction, { ZERO } from '@decipad/fraction';
import { Val } from './Binding';
import { inf, minusInf } from './consts';
import {
  greaterThanOrEqualTo,
  lessThanOrEqualTo,
  lessThan,
  greaterThan,
  add,
  sub,
  mul,
  div,
  min as minNumber,
  max as maxNumber,
  equals,
  isInfinity,
} from './Infinity';
import { isLvar, LogicVar } from './LogicVar';
import { Package } from './Package';
import { LogicNumber } from './types';

export const isDomain = (d: unknown): d is Domain => d instanceof Domain;

export class Domain {
  readonly type = 'domain';
  readonly min: LogicNumber;
  readonly max: LogicNumber;

  constructor(min: LogicNumber, max: LogicNumber) {
    this.min = min;
    this.max = max;
  }

  isMember(v: Fraction) {
    return greaterThanOrEqualTo(v, this.min) && lessThanOrEqualTo(v, this.max);
  }

  add(d2: Domain) {
    return makeDomain(add(this.min, d2.min), add(this.max, d2.max));
  }

  sub(d2: Domain) {
    return makeDomain(sub(this.min, d2.max), sub(this.max, d2.min));
  }

  mul(d2: Domain) {
    const obj: Array<LogicNumber> = [
      mul(this.min, d2.min),
      mul(this.min, d2.max),
      mul(this.max, d2.min),
      mul(this.max, d2.max),
    ];
    const min = minNumber(...obj);
    const max = maxNumber(...obj);
    return makeDomain(min, max);
  }

  div(d2: Domain) {
    let min: LogicNumber;
    let max: LogicNumber;
    if (lessThanOrEqualTo(d2.min, ZERO) && greaterThanOrEqualTo(d2.max, ZERO)) {
      // zero is involved.
      if (equals(d2.min, ZERO) && equals(d2.max, ZERO)) {
        return false;
      } else if (equals(d2.min, ZERO)) {
        max = inf;
        return makeDomain(
          minNumber(div(this.min, d2.max), div(this.max, d2.max)),
          inf
        );
      } else if (equals(d2.max, ZERO)) {
        min = minusInf;
        return makeDomain(
          minusInf,
          maxNumber(div(this.min, d2.min), div(this.max, d2.max))
        );
      }
    }
    if (d2.min === minusInf && d2.max === inf) {
      return REAL_DOMAIN;
    }
    const obj: Array<LogicNumber> = [
      div(this.min, d2.min),
      div(this.min, d2.max),
      div(this.max, d2.min),
      div(this.max, d2.max),
    ];
    min = minNumber(...obj);
    max = maxNumber(...obj);
    return makeDomain(min, max);
  }
}

export function makeDomain(min: LogicNumber, max: LogicNumber) {
  return new Domain(min, max);
}

export function intersection(d1: Domain, d2: Domain) {
  const min = lessThan(d1.min, d2.min) && !isInfinity(d2.min) ? d2.min : d1.min;
  const max =
    greaterThan(d1.max, d2.max) && !isInfinity(d2.max) ? d2.max : d1.max;
  if (lessThan(max, min)) return false;
  return makeDomain(min, max);
}

export const REAL_DOMAIN = makeDomain(minusInf, inf);

export function getDomain(
  pack: Package,
  x: LogicVar | Val | undefined
): Domain {
  if (x == null) {
    return REAL_DOMAIN;
  }
  if (isDomain(x)) {
    return x;
  }
  if (isLvar(x)) {
    const d = pack.lookupDomainBinding(x);
    if (!d) return REAL_DOMAIN;
    if (isDomain(d.val)) {
      return d.val;
    }
    return makeDomain(d.val, d.val);
  } else {
    return makeDomain(x, x);
  }
}
