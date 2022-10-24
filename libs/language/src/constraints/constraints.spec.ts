/* eslint-disable camelcase */
import {
  or,
  and,
  eq,
  run,
  lvar,
  add,
  lessEqual,
  mul,
  div,
  sub,
  implies,
  fail,
} from '.';
import { F } from '../utils';

describe('constraints', () => {
  it('can equal a var to a number', () => {
    const x = lvar('X');
    const g = eq(x, F(3));
    expect(run(g, x)).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(3),
        ],
      ]
    `);
  });

  it('solves a simple equation', () => {
    const x = lvar('X');

    const g = add(x, F(3), F(8)); // x + 3 = 8
    expect(run(g, [x])).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(5),
        ],
      ]
    `);
  });

  it('solves a system of 2 simple equations', () => {
    const x = lvar('X');
    const y = lvar('Y');

    const g1 = add(x, F(8), y); // y = x + 8
    const g2 = eq(x, F(10)); // x = 10
    const g = and(g1, g2);
    expect(run(g, [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(10),
          Fraction(18),
        ],
      ]
    `);
  });

  it('solves for ranges', () => {
    const x = lvar('X');
    const y = lvar('Y');

    const g = and(
      and(lessEqual(x, F(84, 10)), lessEqual(F(32, 10), x)),
      add(x, F(1001, 10), y)
    );
    // (x <= 8.4 and x > 3.2) and (y = x + 100.1)
    expect(run(g, [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          Domain {
            "max": Fraction(8.4),
            "min": Fraction(3.2),
            "type": "domain",
          },
          Domain {
            "max": Fraction(108.5),
            "min": Fraction(103.3),
            "type": "domain",
          },
        ],
      ]
    `);
  });

  it('solves another with divs', () => {
    const x = lvar('X');
    const y = lvar('Y');
    const z = lvar('Y');

    // z = x + 1 and x = 2
    const g1 = and(mul(x, F(2.5), z), eq(x, F(2)));
    expect(run(g1, [x, y, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(2),
          undefined,
          Fraction(5),
        ],
      ]
    `);

    // solution: x = 2, z = 5

    // ((z = x / 3) and (x = 1)) or ((z = x / y) and (x = 2 and z = 3))
    const g2 = or(
      and(div(x, F(3), z), eq(x, F(1))),
      and(div(x, y, z), and(eq(x, F(2)), eq(z, F(3))))
    );
    expect(run(g2, [x, y, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(1),
          undefined,
          Fraction(0.(3)),
        ],
        Array [
          Fraction(2),
          Fraction(0.(6)),
          Fraction(3),
        ],
      ]
    `);
    // solutions: (x = 1, z = 1/3) or (x = 2, y + 2/3, z = 3)

    const g = or(g1, g2);

    expect(run(g, [x, y, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(2),
          undefined,
          Fraction(5),
        ],
        Array [
          Fraction(1),
          undefined,
          Fraction(0.(3)),
        ],
        Array [
          Fraction(2),
          Fraction(0.(6)),
          Fraction(3),
        ],
      ]
    `);

    // solutions: (x = 2, z = 5) or (x = 1, z = 1/3) or (x = 2, y = 2/3, z = 3)
  });

  it('solves with additions and subtractions', () => {
    const x = lvar('X');
    const y = lvar('Y');
    const z = lvar('Y');

    const g1 = and(add(x, F(1), z), eq(x, F(2)));

    expect(run(g1, [x, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(2),
          Fraction(3),
        ],
      ]
    `);

    const g2 = and(add(x, F(1), z), eq(z, F(2)));
    expect(run(g2, [x, y, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(1),
          undefined,
          Fraction(2),
        ],
      ]
    `);

    const g3 = or(
      and(add(x, F(1), z), eq(x, F(2))),
      or(
        and(sub(x, F(1), z), eq(x, F(2))),
        and(sub(x, y, z), and(eq(x, F(2)), eq(y, F(3))))
      )
    );
    // solutions: [ [ 2, undefined, 3 ], [ 2, undefined, 1 ], [ 2, 3, -1 ] ]
    expect(run(g3, [x, y, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(2),
          undefined,
          Fraction(3),
        ],
        Array [
          Fraction(2),
          undefined,
          Fraction(1),
        ],
        Array [
          Fraction(2),
          Fraction(3),
          Fraction(-1),
        ],
      ]
    `);
  });

  it('can handle if branches', () => {
    const x = lvar('X');
    const y = lvar('Y');

    const g1 = eq(x, F(0));
    const g2 = eq(y, F(1));
    const g3 = eq(y, F(2));

    expect(run(implies(g1, g2, g3), [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(0),
          Fraction(1),
        ],
      ]
    `);
    expect(run(implies(fail, g2, g3), [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          undefined,
          Fraction(2),
        ],
      ]
    `);
    expect(run(implies(g1, g2), [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(0),
          Fraction(1),
        ],
      ]
    `);
    expect(run(implies(fail, g2), [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          undefined,
          undefined,
        ],
      ]
    `);
  });
});
