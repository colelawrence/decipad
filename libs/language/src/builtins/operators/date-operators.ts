import { singular } from 'pluralize';
import { DateTime } from 'luxon';
import { Type, buildType } from '../../type';
import { BuiltinSpec } from '../interfaces';
import { isTimeSpecificity } from '../../date/index';
import { NumberValue, RuntimeError } from '../../value';

const extractFunctor: BuiltinSpec['functor'] = ([n, precision]) =>
  Type.combine(precision.isTimeQuantity(), n.isDate()).mapType((t) => {
    if (!precision.unit || precision.unit.length !== 1) {
      return t.withErrorCause(`round: invalid time unit`);
    }
    const unitName = singular(precision.unit[0].unit.toLocaleLowerCase());
    if (!isTimeSpecificity(unitName)) {
      return t.withErrorCause(`extract: invalid time unit ${unitName}`);
    }

    return buildType.number();
  });

export const dateOperators: Record<string, BuiltinSpec> = {
  pick: {
    argCount: 2,
    functor: extractFunctor,
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
      if (unitName === 'undefined') {
        throw new RuntimeError('undefined date');
      }
      const luxonDate = DateTime.fromMillis(Number(d), { zone: 'UTC' });
      return NumberValue.fromValue(luxonDate.get(unitName));
    },
    explanation:
      'Extracts a component from a date (year, month, day, hour, etc.)',
    syntax: 'pick(Date, Precision)',
    example: 'pick(date(2020-03-15), day)',
    formulaGroup: 'Dates',
  },
};
