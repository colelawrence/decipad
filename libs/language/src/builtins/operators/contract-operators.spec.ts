import { build as t } from '../../type';
import { contractOperators as operators } from './contract-operators';

describe('contract operators', () => {
  it('assert to exist', () => {
    expect(operators.assert.functor?.([t.boolean()])).toMatchObject(
      t.boolean()
    );
  });
});
