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
      simplifyUnits(U('bananas', { multiplier: 1000, exp: 2, known: false }))
    ).toMatchObject(U('bananas', { multiplier: 1000, exp: 2, known: false }));
  });

  it('simplifies exponentiated unknown unit (2)', () => {
    expect(
      simplifyUnits(
        U([
          u('bananas', { known: false, exp: 2 }),
          u('bananas', { known: false, exp: 3 }),
        ])
      )
    ).toMatchObject(U('bananas', { exp: 5, known: false }));
  });

  it('simplifies exponentiated known unit', () => {
    // km^-1.meters^3
    expect(
      simplifyUnits(U([u('m', { exp: -1 }), u('m', { exp: 3 })]))
    ).toMatchObject(U('m', { exp: 2 }));
  });
});
