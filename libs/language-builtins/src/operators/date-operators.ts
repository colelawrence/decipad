import { singular } from 'pluralize';
import { DateTime } from 'luxon';
// eslint-disable-next-line no-restricted-imports
import {
  buildType,
  RuntimeError,
  Time,
  Type,
  Value,
} from '@decipad/language-types';
import type { BuiltinSpec, FullBuiltinSpec } from '../types';

const extractFunctor: FullBuiltinSpec['functor'] = async ([n, precision]) =>
  (await Type.combine(precision.isTimeQuantity(), n.isDate())).mapType((t) => {
    if (!precision.unit || precision.unit.length !== 1) {
      return t.withErrorCause(`round: invalid time unit`);
    }
    const unitName = singular(precision.unit[0].unit.toLocaleLowerCase());
    if (!Time.isTimeSpecificity(unitName)) {
      return t.withErrorCause(`extract: invalid time unit ${unitName}`);
    }

    return buildType.number();
  });

export const dateOperators: Record<string, BuiltinSpec> = {
  pick: {
    argCount: 2,
    functor: extractFunctor,
    fnValues: async ([date], types) => {
      const d = await date.getData();
      if (typeof d !== 'bigint' && typeof d !== 'number') {
        throw new Error(
          `Expected date to be number or bigint and was ${typeof d}`
        );
      }
      const [, precision] = types ?? [];
      const unitName = singular(
        precision?.unit?.[0]?.unit?.toLocaleLowerCase() ?? ''
      );
      if (!Time.isTimeSpecificity(unitName)) {
        throw new Error(
          `Expected unit name to be time precision and was ${unitName}`
        );
      }
      if (unitName === 'undefined') {
        throw new RuntimeError('undefined date');
      }
      const luxonDate = DateTime.fromMillis(Number(d), { zone: 'UTC' });
      return Value.NumberValue.fromValue(luxonDate.get(unitName));
    },
    explanation:
      'Extracts a component from a date (year, month, day, hour, etc.)',
    syntax: 'pick(Date, Precision)',
    example: 'pick(date(2020-03-15), day)',
    formulaGroup: 'Dates',
  },
};
