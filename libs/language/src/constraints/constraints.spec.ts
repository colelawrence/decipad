/* eslint-disable camelcase */
import { N } from '@decipad/number';
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

describe('constraints', () => {
  it('can equal a var to a number', () => {
    const x = lvar('X');
    const g = eq(x, N(3));
    expect(run(g, x)).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(3),
        ],
      ]
    `);
  });

  it('solves a simple equation', () => {
    const x = lvar('X');

    const g = add(x, N(3), N(8)); // x + 3 = 8
    expect(run(g, [x])).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(5),
        ],
      ]
    `);
  });

  it('solves a system of 2 simple equations', () => {
    const x = lvar('X');
    const y = lvar('Y');

    const g1 = add(x, N(8), y); // y = x + 8
    const g2 = eq(x, N(10)); // x = 10
    const g = and(g1, g2);
    expect(run(g, [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(10),
          DeciNumber(18),
        ],
      ]
    `);
  });

  it('solves for ranges', () => {
    const x = lvar('X');
    const y = lvar('Y');

    const g = and(
      and(lessEqual(x, N(84, 10)), lessEqual(N(32, 10), x)),
      add(x, N(1001, 10), y)
    );
    // (x <= 8.4 and x > 3.2) and (y = x + 100.1)
    expect(run(g, [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          Domain {
            "max": DeciNumber(8.4),
            "min": DeciNumber(3.2),
            "type": "domain",
          },
          Domain {
            "max": DeciNumber(108.5),
            "min": DeciNumber(103.3),
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
    const g1 = and(mul(x, N(2.5), z), eq(x, N(2)));
    expect(run(g1, [x, y, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(2),
          undefined,
          DeciNumber(5),
        ],
      ]
    `);

    // solution: x = 2, z = 5

    // ((z = x / 3) and (x = 1)) or ((z = x / y) and (x = 2 and z = 3))
    const g2 = or(
      and(div(x, N(3), z), eq(x, N(1))),
      and(div(x, y, z), and(eq(x, N(2)), eq(z, N(3))))
    );
    expect(run(g2, [x, y, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(1),
          undefined,
          DeciNumber(0.(3)),
        ],
        Array [
          DeciNumber(2),
          DeciNumber(0.(6)),
          DeciNumber(3),
        ],
      ]
    `);
    // solutions: (x = 1, z = 1/3) or (x = 2, y + 2/3, z = 3)

    const g = or(g1, g2);

    expect(run(g, [x, y, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(2),
          undefined,
          DeciNumber(5),
        ],
        Array [
          DeciNumber(1),
          undefined,
          DeciNumber(0.(3)),
        ],
        Array [
          DeciNumber(2),
          DeciNumber(0.(6)),
          DeciNumber(3),
        ],
      ]
    `);

    // solutions: (x = 2, z = 5) or (x = 1, z = 1/3) or (x = 2, y = 2/3, z = 3)
  });

  it('solves with additions and subtractions', () => {
    const x = lvar('X');
    const y = lvar('Y');
    const z = lvar('Y');

    const g1 = and(add(x, N(1), z), eq(x, N(2)));

    expect(run(g1, [x, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(2),
          DeciNumber(3),
        ],
      ]
    `);

    const g2 = and(add(x, N(1), z), eq(z, N(2)));
    expect(run(g2, [x, y, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(1),
          undefined,
          DeciNumber(2),
        ],
      ]
    `);

    const g3 = or(
      and(add(x, N(1), z), eq(x, N(2))),
      or(
        and(sub(x, N(1), z), eq(x, N(2))),
        and(sub(x, y, z), and(eq(x, N(2)), eq(y, N(3))))
      )
    );
    // solutions: [ [ 2, undefined, 3 ], [ 2, undefined, 1 ], [ 2, 3, -1 ] ]
    expect(run(g3, [x, y, z])).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(2),
          undefined,
          DeciNumber(3),
        ],
        Array [
          DeciNumber(2),
          undefined,
          DeciNumber(1),
        ],
        Array [
          DeciNumber(2),
          DeciNumber(3),
          DeciNumber(-1),
        ],
      ]
    `);
  });

  it('can handle if branches', () => {
    const x = lvar('X');
    const y = lvar('Y');

    const g1 = eq(x, N(0));
    const g2 = eq(y, N(1));
    const g3 = eq(y, N(2));

    expect(run(implies(g1, g2, g3), [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(0),
          DeciNumber(1),
        ],
      ]
    `);
    expect(run(implies(fail, g2, g3), [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          undefined,
          DeciNumber(2),
        ],
      ]
    `);
    expect(run(implies(g1, g2), [x, y])).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(0),
          DeciNumber(1),
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
