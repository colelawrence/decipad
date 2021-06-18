import { Type } from './index';
import { InferError } from './InferError';

it('can stringify errors', () => {
  expect(new InferError('random string').message).toEqual('random string');

  expect(InferError.expectedButGot('REQ', Type.Number).message).toEqual(
    'This operation requires a REQ and a number was entered'
  );

  expect(InferError.expectedArgCount('Func', 10, 9).message).toEqual(
    'The function Func requires 10 parameters and 9 parameters were entered'
  );

  expect(InferError.expectedUnit(null, null).message).toEqual(
    'This operation requires matching units'
  );
});
