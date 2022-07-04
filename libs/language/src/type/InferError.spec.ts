import { build as t } from './index';
import { InferError } from './InferError';

it('can stringify errors', () => {
  expect(new InferError('random string').spec).toMatchObject({
    errType: 'free-form',
    message: 'random string',
  });

  expect(InferError.missingVariable('Var').spec).toMatchObject({
    errType: 'missing-variable',
    missingVariable: ['Var'],
  });

  expect(InferError.expectedButGot('REQ', t.number()).spec).toMatchObject({
    errType: 'expected-but-got',
    expectedButGot: ['REQ', t.number()],
  });

  expect(InferError.expectedArgCount('Func', 10, 9).spec).toMatchObject({
    errType: 'expected-arg-count',
    expectedArgCount: ['Func', 10, 9],
  });

  expect(InferError.expectedUnit(null, null).spec).toMatchObject({
    errType: 'expected-unit',
    expectedUnit: [null, null],
  });

  expect(InferError.mismatchedSpecificity('month', 'hour').spec).toMatchObject({
    errType: 'mismatched-specificity',
    expectedSpecificity: 'month',
    gotSpecificity: 'hour',
  });

  expect(
    InferError.columnContainsInconsistentType(t.number(), t.string()).spec
  ).toMatchObject({
    errType: 'column-contains-inconsistent-type',
    cellType: t.number(),
    got: t.string(),
  });

  expect(
    InferError.badOverloadedBuiltinCall('+', [t.string(), t.number()]).spec
  ).toMatchObject({
    errType: 'bad-overloaded-builtin-call',
    functionName: '+',
    gotArgTypes: [t.string(), t.number()],
  });
});
