import DeciNumber, {
  lessThanOrEqualTo as lessThanOrEqualToF,
  lessThan as lessThanF,
  ZERO,
} from '@decipad/number';
import { inf, minusInf } from './consts';
import { LogicNumber, Infinity } from './types';

export const isInfinity = (n: unknown): n is Infinity => {
  return n === inf || n === minusInf;
};

// comparations

export const lessThanOrEqualTo = (a: LogicNumber, b: LogicNumber): boolean => {
  if (a === minusInf && b !== minusInf) {
    return true;
  }
  if (b === inf && a !== inf) {
    return true;
  }
  if (!isInfinity(a) && !isInfinity(b)) {
    return lessThanOrEqualToF(a, b);
  }
  return false;
};

export const lessThan = (a: LogicNumber, b: LogicNumber): boolean => {
  if (a === minusInf && b !== minusInf) {
    return true;
  }
  if (b === inf && a !== inf) {
    return true;
  }

  if (!isInfinity(a) && !isInfinity(b)) {
    return lessThanF(a, b);
  }
  return false;
};

export const greaterThanOrEqualTo = (a: LogicNumber, b: LogicNumber) =>
  lessThan(b, a);

export const greaterThan = (a: LogicNumber, b: LogicNumber) =>
  lessThanOrEqualTo(b, a);

export const equals = (a: LogicNumber, b: LogicNumber): boolean => {
  if (isInfinity(a) || isInfinity(b)) {
    return a === b;
  }
  return a.equals(b);
};

// operations

export const add = (a: LogicNumber, b: LogicNumber): LogicNumber => {
  if (isInfinity(a) && !isInfinity(b)) {
    return a;
  }
  if (isInfinity(b) && !isInfinity(a)) {
    return b;
  }
  if (isInfinity(a) && isInfinity(b) && a === b) {
    return a;
  }
  if (isInfinity(a) || isInfinity(b)) {
    throw new Error(`Dont know how to add ${a.toString()} to ${b.toString()}`);
  }
  return a.add(b);
};

export const sub = (a: LogicNumber, b: LogicNumber): LogicNumber => {
  if (isInfinity(a) && !isInfinity(b)) {
    return a;
  }
  if (isInfinity(b) && !isInfinity(a)) {
    return b;
  }
  if (isInfinity(a) && isInfinity(b) && a === b) {
    return a;
  }
  if (isInfinity(a) && isInfinity(b)) {
    if (a === b && b === minusInf) {
      return minusInf;
    }
    return inf;
  }
  if (isInfinity(a) || isInfinity(b)) {
    throw new Error(
      `Dont know how to subtract ${a.toString()} to ${b.toString()}`
    );
  }
  return a.sub(b);
};

export const mul = (a: LogicNumber, b: LogicNumber): LogicNumber => {
  if (isInfinity(a) && isInfinity(b) && a === b) {
    return a;
  }
  if (isInfinity(a) || isInfinity(b)) {
    if (isInfinity(a)) {
      return a;
    }
    if (isInfinity(b)) {
      return b;
    }
    throw new Error(
      `Dont know how to multiply ${a.toString()} to ${b.toString()}`
    );
  }
  return a.mul(b);
};

export const div = (a: LogicNumber, b: LogicNumber): LogicNumber => {
  if (isInfinity(a) && isInfinity(b)) {
    throw new Error('dont know how to divide two infinite numbers');
  }
  if (isInfinity(b) && !isInfinity(a)) {
    return ZERO;
  }
  if (isInfinity(a) && !isInfinity(b)) {
    return a;
  }
  if (
    b instanceof DeciNumber &&
    b.equals(ZERO) &&
    !isInfinity(a) &&
    !a.equals(ZERO)
  ) {
    if (a.compare(ZERO) < 0) {
      return minusInf;
    }
    return inf;
  }
  if (isInfinity(a) || isInfinity(b)) {
    throw new Error(
      `Dont know how to divide ${a.toString()} to ${b.toString()}`
    );
  }
  return a.div(b);
};

// min and nax

export const min = (...ns: LogicNumber[]): LogicNumber => {
  if (ns.length < 1) {
    throw new Error("don't know the minimum of an empty set");
  }

  return ns.reduce((a, b) => {
    if (isInfinity(a) && isInfinity(b) && a === b) {
      return a;
    }
    if (isInfinity(a) && !isInfinity(b)) {
      if (a === minusInf) {
        return a;
      }
      return b;
    }

    if (isInfinity(b) && !isInfinity(a)) {
      if (b === minusInf) {
        return b;
      }
      return a;
    }

    if (isInfinity(a) || isInfinity(b)) {
      if (a === minusInf || b === minusInf) {
        return minusInf;
      }
      return inf;
    }

    return a.compare(b) < 0 ? a : b;
  });
};

export const max = (...ns: LogicNumber[]): LogicNumber => {
  if (ns.length < 1) {
    throw new Error('dont know the maximum of an empty set');
  }

  return ns.reduce((a, b) => {
    if (isInfinity(a) && isInfinity(b) && a === b) {
      return a;
    }
    if (isInfinity(a) && !isInfinity(b)) {
      if (a === inf) {
        return a;
      }
      return b;
    }

    if (isInfinity(b) && !isInfinity(a)) {
      if (b === inf) {
        return b;
      }
      return a;
    }

    if (isInfinity(a) || isInfinity(b)) {
      if (a === inf || b === inf) {
        return inf;
      }
      return minusInf;
    }

    return a.compare(b) > 0 ? a : b;
  });
};
