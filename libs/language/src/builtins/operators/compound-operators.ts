import DeciNumber, { ONE, ZERO, fromNumber } from '@decipad/number';
import { getDefined } from '@decipad/utils';
import { BuiltinSpec } from '../interfaces';
import { Type } from '../../type';
import { getInstanceof } from '../../utils';

export const compoundOperators: { [fname: string]: BuiltinSpec } = {
  compoundrate: {
    argCount: 2,
    functor: ([rate, periods]) =>
      Type.combine(periods.isScalar('number'), rate.isScalar('number')),
    fn: ([_rate, _periods]) => {
      const rate = getInstanceof(_rate, DeciNumber);
      const periods = getInstanceof(_periods, DeciNumber);
      return rate.add(ONE).pow(periods).sub(ONE);
    },
    explanation:
      'Calculates the compounded rate for aninitial rate after a set of periods.\n\nExample: `compoundrate(5%, 36 months)`',
  },
  futurevalue: {
    argCount: 3,
    noAutoconvert: true,
    functor: ([periodicInterest, nPer, presentValue]) =>
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
      'The future value (FV) is one of the key metrics in financial planning that defines the value of a current asset in the future. In other words, FV measures how much a given amount of money will be worth at a specific time in the future.\nExample: `fv(5%, 36 months, 50 kusd)`',
  },
  fv: {
    aliasFor: 'futurevalue',
  },
  netpresentvalue: {
    argCount: 2,
    argCardinalities: [1, 2],
    functor: ([rate, values]) =>
      Type.combine(
        rate.isScalar('number'),
        Type.either(
          values.isScalar('number'),
          values.isColumn().reducedToLowest().isScalar('number')
        )
      ),
    fn: ([_rate, values]) => {
      const rate = getInstanceof(_rate, DeciNumber);
      const onePlusRate = ONE.add(rate);
      return getInstanceof(values, Array).reduce<DeciNumber>(
        (sum, _value, index) => {
          const value = getInstanceof(_value, DeciNumber);
          return sum.add(value.div(onePlusRate.pow(fromNumber(index + 1))));
        },
        ZERO
      );
    },
    explanation:
      'netpresentvalue will calculate the the Net Present Value (NPV) for a series of cash flows and a given discount rate.\nExample: `npv(5%, Table.Column)`',
  },
  npv: {
    aliasFor: 'netpresentvalue',
  },
  paymentamounts: {
    argCount: 3,
    noAutoconvert: true,
    argCardinalities: [1, 1, 1],
    functor: ([rate, numberOfPayments, loanAmount]) =>
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
    explanation:
      'calculates the payment amount for a loan based on the loan amount, interest rate, and number of payments.\nSyntax: `pmt(rate, nrOfPayments, loanAmount)`',
  },
  pmt: {
    aliasFor: 'paymentamounts',
  },
};
