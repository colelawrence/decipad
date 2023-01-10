import { N } from '@decipad/number';
import { U, u } from '../utils';
import { simplifyUnits } from './units';

describe('simplify units', () => {
  it('simplifies unknown unit', () => {
    expect(simplifyUnits(U('bananas', { known: false }))).toMatchObject(
      U('bananas', { known: false })
    );
  });

  it('simplifies exponentiated unknown unit', () => {
    expect(
      simplifyUnits(
        U('bananas', { multiplier: N(1000), exp: N(2), known: false })
      )
    ).toMatchObject(
      U('bananas', { multiplier: N(1000), exp: N(2), known: false })
    );
  });

  it('simplifies exponentiated unknown unit (2)', () => {
    expect(
      simplifyUnits(
        U([
          u('bananas', { known: false, exp: N(2) }),
          u('bananas', { known: false, exp: N(3) }),
        ])
      )
    ).toMatchObject(U('bananas', { exp: N(5), known: false }));
  });

  it('simplifies exponentiated known unit', () => {
    // km^-1.meters^3
    expect(
      simplifyUnits(U([u('m', { exp: N(-1) }), u('m', { exp: N(3) })]))
    ).toMatchObject(U('m', { exp: N(2) }));
  });

  it('simplifies with fractional exponents', () => {
    expect(
      simplifyUnits(U([u('m', { exp: N(-1, 2) }), u('m', { exp: N(3, 2) })]))
    ).toMatchObject(U('m', { exp: N(1) }));
  });
});
