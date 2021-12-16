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
        U('bananas', { multiplier: F(1000), exp: 2n, known: false })
      )
    ).toMatchObject(
      U('bananas', { multiplier: F(1000), exp: 2n, known: false })
    );
  });

  it('simplifies exponentiated unknown unit (2)', () => {
    expect(
      simplifyUnits(
        U([
          u('bananas', { known: false, exp: 2n }),
          u('bananas', { known: false, exp: 3n }),
        ])
      )
    ).toMatchObject(U('bananas', { exp: 5n, known: false }));
  });

  it('simplifies exponentiated known unit', () => {
    // km^-1.meters^3
    expect(
      simplifyUnits(U([u('m', { exp: -1n }), u('m', { exp: 3n })]))
    ).toMatchObject(U('m', { exp: 2n }));
  });
});
