import { build as t } from './index';
import { InferError } from './InferError';

it('can stringify errors', () => {
  expect(new InferError('random string').message).toEqual('random string');

  expect(InferError.missingVariable('Var').message).toEqual(
    'The variable Var is missing'
  );

  expect(InferError.expectedButGot('REQ', t.number()).message).toEqual(
    'This operation requires a REQ and a number was entered'
  );

  expect(InferError.expectedArgCount('Func', 10, 9).message).toEqual(
    'The function Func requires 10 parameters and 9 parameters were entered'
  );

  expect(InferError.expectedUnit(null, null).message).toEqual(
    'This operation requires matching units'
  );

  expect(
    InferError.mismatchedSpecificity('month', 'hour').message
  ).toMatchInlineSnapshot(
    `"Expected time specific up to the month, but got hour"`
  );

  expect(
    InferError.columnContainsInconsistentType(t.number(), t.string()).message
  ).toMatchInlineSnapshot(`"Column cannot contain both number and string"`);

  expect(
    InferError.badOverloadedBuiltinCall('+', [t.string(), t.number()]).message
  ).toMatchInlineSnapshot(
    `"The function + cannot be called with (string, number)"`
  );
});
