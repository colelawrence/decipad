import { Column, Date, fromJS, TimeQuantity } from '../interpreter/Value';
import { InferError, build as t } from '../type';
import {
  getOverloadedTypeFromType,
  getOverloadedTypeFromValue,
  overloadBuiltin,
  OverloadedBuiltinSpec,
} from './overloadBuiltin';

const numberPlus: OverloadedBuiltinSpec = {
  argTypes: ['number', 'number'],
  functor: (a, b) => a.isScalar('number').sameAs(b),
  fnValues: (a, b) => fromJS(Number(a.getData()) + Number(b.getData())),
};
const stringPlus: OverloadedBuiltinSpec = {
  argTypes: ['string', 'string'],
  functor: (a, b) => a.isScalar('string').sameAs(b),
  fnValues: (a, b) => fromJS(String(a.getData()) + String(b.getData())),
};

const plus = overloadBuiltin('+', 2, [numberPlus, stringPlus]);

it('chooses the correct overload for a value', () => {
  expect(plus.fnValues!(fromJS(1), fromJS(2))).toEqual(fromJS(3));
  expect(plus.fnValues!(fromJS('hello '), fromJS('world'))).toEqual(
    fromJS('hello world')
  );
  expect(() => plus.fnValues!(fromJS('notnumberpls'), fromJS(1))).toThrow();
});

it('chooses the correct overload for a type', () => {
  expect(plus.functor(t.number(), t.number())).toEqual(t.number());
  expect(plus.functor(t.string(), t.string())).toEqual(t.string());
  expect(plus.functor(t.number(), t.string()).errorCause).toEqual(
    InferError.badOverloadedBuiltinCall('+', ['number', 'string'])
  );
});

describe('utils', () => {
  it('getOverloadTypeFromValue', () => {
    expect(getOverloadedTypeFromValue(fromJS('hi'))).toEqual('string');
    expect(getOverloadedTypeFromValue(fromJS(10))).toEqual('number');
    expect(
      getOverloadedTypeFromValue(Date.fromDateAndSpecificity(0, 'time'))
    ).toEqual('date');
    expect(getOverloadedTypeFromValue(new TimeQuantity(new Map()))).toEqual(
      'time-quantity'
    );
    expect(() => getOverloadedTypeFromValue(new Column([fromJS(1)]))).toThrow();
  });

  it('getOverloadTypeFromType', () => {
    expect(getOverloadedTypeFromType(t.string())).toEqual('string');
    expect(getOverloadedTypeFromType(t.number())).toEqual('number');
    expect(getOverloadedTypeFromType(t.boolean())).toEqual('boolean');
    expect(getOverloadedTypeFromType(t.date('day'))).toEqual('date');
    expect(getOverloadedTypeFromType(t.timeQuantity([]))).toEqual(
      'time-quantity'
    );
    expect(() =>
      getOverloadedTypeFromType(
        t.table({ length: 1, columns: [], columnNames: [] })
      )
    ).toThrow();

    expect(() =>
      getOverloadedTypeFromType(t.column(t.number(), 123))
    ).toThrow();
  });
});
