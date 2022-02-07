import { build as t } from '../../type';
import { booleanOperators as operators } from './boolean-operators';

describe('boolean operators', () => {
  it('negates a boolean', () => {
    expect(operators['!'].functor?.([t.boolean(), t.boolean()])).toMatchObject(
      t.boolean()
    );
    expect(operators['!'].fn?.([true])).toBe(false);
    expect(operators['!'].fn?.([false])).toBe(true);
  });

  it('ands two booleans', () => {
    expect(operators['&&'].functor?.([t.boolean(), t.boolean()])).toMatchObject(
      t.boolean()
    );
    expect(operators['&&'].fn?.([true, true])).toBe(true);
    expect(operators['&&'].fn?.([false, true])).toBe(false);
  });
});
