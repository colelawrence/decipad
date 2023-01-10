import { materialize } from './materialize';
import { SwappedHypercube } from './SwappedHypercube';
import { jsCol } from './testUtils';

const multiDimX = jsCol([1n, 2n, 3n]);

const twoAnonDims = jsCol([[11n], [12n]]);

const threeAnonDims = jsCol([
  [
    [11n, 101n, 1001n],
    [12n, 102n, 1002n],
  ],
]);

it('can swap dimensions of a hypercube', () => {
  expect(materialize(new SwappedHypercube(twoAnonDims, 1)))
    .toMatchInlineSnapshot(`
    Array [
      Array [
        DeciNumber(11),
        DeciNumber(12),
      ],
    ]
  `);
});

it('or left alone', () => {
  expect(materialize(new SwappedHypercube(twoAnonDims, 0)))
    .toMatchInlineSnapshot(`
    Array [
      Array [
        DeciNumber(11),
      ],
      Array [
        DeciNumber(12),
      ],
    ]
  `);
});

it('can swap nothing if the dimension is 1D', () => {
  expect(materialize(new SwappedHypercube(multiDimX, 0)))
    .toMatchInlineSnapshot(`
    Array [
      DeciNumber(1),
      DeciNumber(2),
      DeciNumber(3),
    ]
  `);
});

it('can work with 3d', () => {
  expect(materialize(new SwappedHypercube(threeAnonDims, 0)))
    .toMatchInlineSnapshot(`
    Array [
      Array [
        Array [
          DeciNumber(11),
          DeciNumber(101),
          DeciNumber(1001),
        ],
        Array [
          DeciNumber(12),
          DeciNumber(102),
          DeciNumber(1002),
        ],
      ],
    ]
  `);

  expect(materialize(new SwappedHypercube(threeAnonDims, 1)))
    .toMatchInlineSnapshot(`
    Array [
      Array [
        Array [
          DeciNumber(11),
          DeciNumber(101),
          DeciNumber(1001),
        ],
      ],
      Array [
        Array [
          DeciNumber(12),
          DeciNumber(102),
          DeciNumber(1002),
        ],
      ],
    ]
  `);

  expect(materialize(new SwappedHypercube(threeAnonDims, 2)))
    .toMatchInlineSnapshot(`
    Array [
      Array [
        Array [
          DeciNumber(11),
          DeciNumber(12),
        ],
      ],
      Array [
        Array [
          DeciNumber(101),
          DeciNumber(102),
        ],
      ],
      Array [
        Array [
          DeciNumber(1001),
          DeciNumber(1002),
        ],
      ],
    ]
  `);
});
