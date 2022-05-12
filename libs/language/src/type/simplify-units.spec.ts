import { U, u, F } from '../utils';
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
        U('bananas', { multiplier: F(1000), exp: F(2), known: false })
      )
    ).toMatchObject(
      U('bananas', { multiplier: F(1000), exp: F(2), known: false })
    );
  });

  it('simplifies exponentiated unknown unit (2)', () => {
    expect(
      simplifyUnits(
        U([
          u('bananas', { known: false, exp: F(2) }),
          u('bananas', { known: false, exp: F(3) }),
        ])
      )
    ).toMatchObject(U('bananas', { exp: F(5), known: false }));
  });

  it('simplifies exponentiated known unit', () => {
    // km^-1.meters^3
    expect(
      simplifyUnits(U([u('m', { exp: F(-1) }), u('m', { exp: F(3) })]))
    ).toMatchObject(U('m', { exp: F(2) }));
  });

  it('simplifies with fractional exponents', () => {
    expect(
      simplifyUnits(U([u('m', { exp: F(-1, 2) }), u('m', { exp: F(3, 2) })]))
    ).toMatchObject(U('m', { exp: F(1) }));
  });
});
