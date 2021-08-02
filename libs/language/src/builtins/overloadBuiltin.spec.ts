import {
  Column,
  Date,
  fromJS,
  Range,
  Scalar,
  TimeQuantity,
} from '../interpreter/Value';
import { InferError, Type } from '../type';
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
  expect(plus.functor(Type.Number, Type.Number)).toEqual(Type.Number);
  expect(plus.functor(Type.String, Type.String)).toEqual(Type.String);
  expect(plus.functor(Type.Number, Type.String).errorCause).toEqual(
    InferError.badOverloadedBuiltinCall('+', ['number', 'string'])
  );
});

describe('utils', () => {
  it('getOverloadTypeFromValue', () => {
    expect(getOverloadedTypeFromValue(fromJS('hi'))).toEqual('string');
    expect(getOverloadedTypeFromValue(fromJS(10))).toEqual('number');
    expect(
      getOverloadedTypeFromValue(
        new Date(
          new Range({ start: fromJS(0) as Scalar, end: fromJS(1) as Scalar })
        )
      )
    ).toEqual('date');
    expect(getOverloadedTypeFromValue(new TimeQuantity(new Map()))).toEqual(
      'time-quantity'
    );
    expect(() => getOverloadedTypeFromValue(new Column([fromJS(1)]))).toThrow();
  });

  it('getOverloadTypeFromType', () => {
    expect(getOverloadedTypeFromType(Type.String)).toEqual('string');
    expect(getOverloadedTypeFromType(Type.Number)).toEqual('number');
    expect(getOverloadedTypeFromType(Type.Boolean)).toEqual('boolean');
    expect(getOverloadedTypeFromType(Type.buildDate('day'))).toEqual('date');
    expect(getOverloadedTypeFromType(Type.buildTimeQuantity([]))).toEqual(
      'time-quantity'
    );
    expect(() => getOverloadedTypeFromType(Type.buildTuple([]))).toThrow();

    expect(() =>
      getOverloadedTypeFromType(Type.buildColumn(Type.Number, 123))
    ).toThrow();
  });
});
