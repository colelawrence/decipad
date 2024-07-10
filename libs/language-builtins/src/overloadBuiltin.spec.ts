import { describe, it, expect } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { InferError, buildType as t, Value } from '@decipad/language-types';
import {
  getOverloadedTypeFromType,
  getOverloadedTypeFromValue,
  overloadBuiltin,
} from './overloadBuiltin';
import { makeContext } from './utils/testUtils';
import { getDefined } from '@decipad/utils';
import type { FullBuiltinSpec } from './types';

const numberPlus: FullBuiltinSpec = {
  argCount: 2,
  functor: async ([a, b]) => (await a.isScalar('number')).sameAs(b),
  fnValues: async ([a, b]) =>
    Value.fromJS(Number(await a.getData()) + Number(await b.getData())),
};
const stringPlus: FullBuiltinSpec = {
  argCount: 2,
  functor: async ([a, b]) => (await a.isScalar('string')).sameAs(b),
  fnValues: async ([a, b]) =>
    Value.fromJS(String(await a.getData()) + String(await b.getData())),
};

const plus = overloadBuiltin('+', 2, [numberPlus, stringPlus]);

it('chooses the correct overload for a value', async () => {
  expect(
    await plus.fnValuesNoAutomap!(
      [Value.fromJS(1), Value.fromJS(2)],
      [t.number(), t.number()],
      makeContext(),
      []
    )
  ).toEqual(Value.fromJS(3));
  expect(
    await plus.fnValuesNoAutomap!(
      [Value.fromJS('hello '), Value.fromJS('world')],
      [t.string(), t.string()],
      makeContext(),
      []
    )
  ).toEqual(Value.fromJS('hello world'));
  await expect(async () =>
    plus.fnValuesNoAutomap!(
      [Value.fromJS('notnumberpls'), Value.fromJS(1)],
      [t.string(), t.number()],
      makeContext(),
      []
    )
  ).rejects.toThrow();
});

it('chooses the correct overload for a type', async () => {
  expect(
    await getDefined(plus.functorNoAutomap)(
      [t.number(), t.number()],
      [],
      makeContext()
    )
  ).toEqual(t.number());
  expect(
    await getDefined(plus.functorNoAutomap)(
      [t.string(), t.string()],
      [],
      makeContext()
    )
  ).toEqual(t.string());
  expect(
    (
      await getDefined(plus.functorNoAutomap)(
        [t.number(), t.string()],
        [],
        makeContext()
      )
    ).errorCause
  ).toEqual(InferError.badOverloadedBuiltinCall('+', [t.number(), t.string()]));
});

describe('utils', () => {
  it('getOverloadTypeFromValue', () => {
    expect(getOverloadedTypeFromValue(Value.fromJS('hi'))).toEqual('string');
    expect(getOverloadedTypeFromValue(Value.fromJS(10))).toEqual('number');
    expect(
      getOverloadedTypeFromValue(
        Value.DateValue.fromDateAndSpecificity(0n, 'hour')
      )
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
    expect(getOverloadedTypeFromType(t.row([t.string()], ['A']))).toEqual(
      'row'
    );
    expect(getOverloadedTypeFromType(t.column(t.number()))).toEqual(
      'column<number>'
    );
  });
});
