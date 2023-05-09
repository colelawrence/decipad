import DeciNumber, { ONE, ZERO } from '@decipad/number';
import { getDefined } from '@decipad/utils';
import { BuiltinSpec } from '../interfaces';
import { Type } from '../../type';
import { getInstanceof } from '../../utils';
import { Scalar, getColumnLike } from '../../value';

export const compoundOperators: { [fname: string]: BuiltinSpec } = {
  compoundrate: {
    argCount: 2,
    functor: async ([rate, periods]) =>
      Type.combine(periods.isScalar('number'), rate.isScalar('number')),
    fn: ([_rate, _periods]) => {
      const rate = getInstanceof(_rate, DeciNumber);
      const periods = getInstanceof(_periods, DeciNumber);
      return rate.add(ONE).pow(periods).sub(ONE);
    },
    explanation: 'Compound rate of a given period based on a constant rate.',
    example: 'compoundrate(5%, 36 months)',
    syntax: 'compoundrate(Rate, Nº of Periods)',
    formulaGroup: 'Finance',
  },
  futurevalue: {
    argCount: 3,
    noAutoconvert: true,
    functor: async ([periodicInterest, nPer, presentValue]) =>
      Type.combine(
        periodicInterest.isScalar('number'),
        nPer.isScalar('number'),
        presentValue.isScalar('number')
      ),
    fn: ([_periodicInterest, _nPer, _presentValue]) => {
      const presentValue = getInstanceof(_presentValue, DeciNumber);
      const periodicInterest = getInstanceof(_periodicInterest, DeciNumber);
      const nPer = getInstanceof(_nPer, DeciNumber);

      const compounded = getDefined(
        compoundOperators.compoundrate.fn?.([periodicInterest, nPer])
      );
      return compounded.add(ONE).mul(presentValue);
    },
    explanation:
      'Future value from periodic payments given an initial amount and fixed rate.',
    example: 'futurevalue(5%, 36 months, $50k)',
    formulaGroup: 'Finance',
    syntax: 'futurevalue(Rate, Nº of Periods, Initial Amount)',
  },
  fv: {
    aliasFor: 'futurevalue',
    explanation:
      'Future value from periodic payments given an initial amount and fixed rate.',
    example: 'fv(5%, 36 months, $50k)',
    formulaGroup: 'Finance',
    syntax: 'fv(Rate, Nº of Periods, Initial Amount)',
  },
  netpresentvalue: {
    argCount: 2,
    argCardinalities: [1, 2],
    functor: async ([rate, values]) =>
      Type.combine(
        rate.isScalar('number'),
        Type.either(
          values.isScalar('number'),
          (await (await values.isColumn()).reducedToLowest()).isScalar('number')
        )
      ),
    fnValues: async ([_rate, _column]) => {
      const rate = getInstanceof(await _rate.getData(), DeciNumber);
      const onePlusRate = ONE.add(rate);
      const column = getColumnLike(_column);
      let sum = ZERO;
      let index = ZERO;
      for await (const v of column.values()) {
        index = index.add(ONE);
        const value = getInstanceof(await v.getData(), DeciNumber);
        sum = sum.add(value.div(onePlusRate.pow(index)));
      }
      return Scalar.fromValue(sum);
    },
    explanation:
      'Net present value of investment given cash flows and a discount rate.',
    example: 'netpresentvalue(5%, Table.Column)',
    formulaGroup: 'Finance',
    syntax: 'netpresentvalue(Discount Rate, Future Cashflows Column)',
  },
  npv: {
    aliasFor: 'netpresentvalue',
    explanation:
      'Net present value of investment given cash flows and a discount rate.',
    example: 'npv(5%, Table.Column)',
    formulaGroup: 'Finance',
    syntax: 'npv(Discount Rate, Future Cashflows Column)',
  },
  paymentamounts: {
    argCount: 3,
    noAutoconvert: true,
    argCardinalities: [1, 1, 1],
    functor: async ([rate, numberOfPayments, loanAmount]) =>
      Type.combine(
        rate.isScalar('number'),
        numberOfPayments.isScalar('number'),
        loanAmount.isScalar('number'),
        loanAmount.divideUnit(numberOfPayments.unit)
      ),
    fn: ([_rate, _numberOfPeriods, _loanAmount]) => {
      const rate = getInstanceof(_rate, DeciNumber);
      const numberOfPeriods = getInstanceof(_numberOfPeriods, DeciNumber);
      const loanAmount = getInstanceof(_loanAmount, DeciNumber);

      return loanAmount
        .mul(rate)
        .mul(ONE.add(rate).pow(numberOfPeriods))
        .div(ONE.add(rate).pow(numberOfPeriods).sub(ONE));
    },
    explanation: 'Loan payment amount.',
    syntax: 'paymentamounts(Rate, Nº Payments, Loan)',
    example: 'paymentamounts(3%, 36 months, $10k)',
    formulaGroup: 'Finance',
  },
  pmt: {
    aliasFor: 'paymentamounts',
    explanation: 'Loan payment amount.',
    syntax: 'pmt(Rate, Nº Payments, Loan)',
    example: 'pmt(3%, 36 months, $10k)',
    formulaGroup: 'Finance',
  },
};
