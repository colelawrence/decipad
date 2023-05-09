import { DateValue, fromJS } from '../value';
import { InferError, buildType as t } from '../type';
import { getDefined } from '../utils';
import {
  getOverloadedTypeFromType,
  getOverloadedTypeFromValue,
  overloadBuiltin,
  OverloadedBuiltinSpec,
} from './overloadBuiltin';

const numberPlus: OverloadedBuiltinSpec = {
  argTypes: ['number', 'number'],
  functor: async ([a, b]) => (await a.isScalar('number')).sameAs(b),
  fnValues: async ([a, b]) =>
    fromJS(Number(await a.getData()) + Number(await b.getData())),
};
const stringPlus: OverloadedBuiltinSpec = {
  argTypes: ['string', 'string'],
  functor: async ([a, b]) => (await a.isScalar('string')).sameAs(b),
  fnValues: async ([a, b]) =>
    fromJS(String(await a.getData()) + String(await b.getData())),
};

const plus = overloadBuiltin('+', 2, [numberPlus, stringPlus]);

it('chooses the correct overload for a value', async () => {
  expect(await plus.fnValues!([fromJS(1), fromJS(2)])).toEqual(fromJS(3));
  expect(await plus.fnValues!([fromJS('hello '), fromJS('world')])).toEqual(
    fromJS('hello world')
  );
  await expect(async () =>
    plus.fnValues!([fromJS('notnumberpls'), fromJS(1)])
  ).rejects.toThrow();
});

it('chooses the correct overload for a type', async () => {
  expect(await getDefined(plus.functor)([t.number(), t.number()])).toEqual(
    t.number()
  );
  expect(await getDefined(plus.functor)([t.string(), t.string()])).toEqual(
    t.string()
  );
  expect(
    (await getDefined(plus.functor)([t.number(), t.string()])).errorCause
  ).toEqual(InferError.badOverloadedBuiltinCall('+', [t.number(), t.string()]));
});

describe('utils', () => {
  it('getOverloadTypeFromValue', () => {
    expect(getOverloadedTypeFromValue(fromJS('hi'))).toEqual('string');
    expect(getOverloadedTypeFromValue(fromJS(10))).toEqual('number');
    expect(
      getOverloadedTypeFromValue(DateValue.fromDateAndSpecificity(0n, 'hour'))
    ).toEqual('date');
  });

  it('getOverloadTypeFromType', () => {
    expect(getOverloadedTypeFromType(t.string())).toEqual('string');
    expect(getOverloadedTypeFromType(t.number())).toEqual('number');
    expect(getOverloadedTypeFromType(t.boolean())).toEqual('boolean');
    expect(getOverloadedTypeFromType(t.date('day'))).toEqual('date');
    expect(
      getOverloadedTypeFromType(t.table({ columnTypes: [], columnNames: [] }))
    ).toEqual(null);
    expect(getOverloadedTypeFromType(t.row([t.string()], ['A']))).toEqual(null);
    expect(getOverloadedTypeFromType(t.column(t.number()))).toEqual(null);
  });
});
