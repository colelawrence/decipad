import produce from 'immer';
import DeciNumber, { N, ZERO } from '@decipad/number';
import { singular } from 'pluralize';
import { RuntimeError } from '../../interpreter';
import { getInstanceof, multiplyMultipliers } from '../../utils';
import { Type } from '../../type';
import { BuiltinSpec } from '../interfaces';
import { isTimeSpecificity } from '../../date/index';
import { overloadBuiltin } from '../overloadBuiltin';
import { DateValue, Scalar } from '../../value';

const roundNumberFunctor: BuiltinSpec['functor'] = ([n, precision]) =>
  Type.combine((precision ?? n).isScalar('number'), n.isScalar('number'));

const roundDateFunctor: BuiltinSpec['functor'] = ([n, precision]) =>
  Type.combine(precision.isScalar('number'), n.isDate()).mapType((t) => {
    if (!precision.unit || precision.unit.length !== 1) {
      return t.withErrorCause(`round: invalid time unit`);
    }
    const unitName = singular(precision.unit[0].unit.toLocaleLowerCase());
    if (!isTimeSpecificity(unitName)) {
      return t.withErrorCause(`round: invalid time unit ${unitName}`);
    }

    return produce(t, (time) => {
      time.date = unitName;
      return time;
    });
  });

const roundWrap = (
  round: (f: DeciNumber, decimalPrecisionValue: DeciNumber) => DeciNumber
): NonNullable<BuiltinSpec['fnValues']> => {
  return ([nValue, decimalPrecisionValue], [type] = []) => {
    const n = getInstanceof(nValue.getData(), DeciNumber);
    const multiplier = multiplyMultipliers(type.unit);
    const decimalPrecision = decimalPrecisionValue
      ? getInstanceof(decimalPrecisionValue.getData(), DeciNumber)
      : ZERO;
    if (decimalPrecision.compare(N(100)) > 0) {
      throw new RuntimeError('round: decimal precision must be < 100');
    }
    // in order for the round function to round at the correct precision, we need to first divide by
    // the unit multiplier, do the rouding, and *then* multiply by it at the end.
    return Scalar.fromValue(
      round(n.div(multiplier), decimalPrecision).mul(multiplier)
    );
  };
};

const roundNumber = (n: DeciNumber, decimalPlaces: DeciNumber) =>
  n.round(decimalPlaces);

export const roundOperators: Record<string, BuiltinSpec> = {
  round: {
    ...overloadBuiltin(
      'round',
      [1, 2],
      [
        {
          argTypes: ['number', 'number'],
          functor: roundNumberFunctor,
          fnValues: roundWrap(roundNumber),
        },
        {
          argTypes: ['number'],
          functor: roundNumberFunctor,
          fnValues: roundWrap(roundNumber),
        },
        {
          argTypes: ['date', 'number'],
          functor: roundDateFunctor,
          fnValues: ([date], types) => {
            const d = date.getData();
            if (typeof d !== 'bigint' && typeof d !== 'number') {
              throw new Error(
                `Expected date to be number or bigint and was ${typeof d}`
              );
            }
            const [, precision] = types ?? [];
            const unitName = singular(
              precision?.unit?.[0]?.unit?.toLocaleLowerCase() ?? ''
            );
            if (!isTimeSpecificity(unitName)) {
              throw new Error(
                `Expected unit name to be time precision and was ${unitName}`
              );
            }
            return DateValue.fromDateAndSpecificity(d, unitName);
          },
        },
      ],
      'prefix'
    ),
    explanation: 'Rounds a number.',
    formulaGroup: 'Numbers',
    syntax: 'round(Number, [Precision])',
    example: 'round(3.145) \nround(3.145, 2)',
  },
  precision: {
    aliasFor: 'round',
    explanation: 'Rounds a number.',
    formulaGroup: 'Numbers',
    syntax: 'precision(Number, [Precision])',
    example: 'precision(3.145) \nprecision(3.145, 2)',
  },
  roundup: {
    argCount: [1, 2],
    noAutoconvert: true,
    functor: roundNumberFunctor,
    fnValues: roundWrap((n: DeciNumber, decimalPlaces: DeciNumber) =>
      n.ceil(decimalPlaces)
    ),
    explanation: 'Rounds a number up.',
    formulaGroup: 'Numbers',
    syntax: 'roundup(Number, [Precision])',
    example: 'roundup(3.145) \nroundup(3.145, 2)',
  },
  ceil: {
    aliasFor: 'roundup',
    explanation: 'Rounds a number up.',
    formulaGroup: 'Numbers',
    syntax: 'ceil(Number, [Precision])',
    example: 'ceil(3.145) \nceil(3.145, 2)',
  },
  rounddown: {
    argCount: [1, 2],
    noAutoconvert: true,
    functor: roundNumberFunctor,
    fnValues: roundWrap((n: DeciNumber, decimalPlaces: DeciNumber) =>
      n.floor(decimalPlaces)
    ),
    explanation: 'Rounds a number down.',
    formulaGroup: 'Numbers',
    syntax: 'roundown(Number, [Precision])',
    example: 'roundown(3.145) \nroundown(3.145, 2)',
  },
  floor: {
    aliasFor: 'rounddown',
    explanation: 'Rounds a number down.',
    formulaGroup: 'Numbers',
    syntax: 'floor(Number, [Precision])',
    example: 'floor(3.145) \nfloor(3.145, 2)',
  },
};
