import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { materialize } from './materialize';
import { createSwappedDimensions } from './SwappedDimensions';
import { jsCol } from './testUtils';

setupDeciNumberSnapshotSerializer();

const multiDimX = jsCol([1n, 2n, 3n]);

const twoAnonDims = jsCol([[11n], [12n]]);

const threeAnonDims = jsCol([
  [
    [11n, 101n, 1001n],
    [12n, 102n, 1002n],
  ],
]);

it('can swap dimensions of a hypercube', async () => {
  expect(await materialize(createSwappedDimensions(twoAnonDims, 1)))
    .toMatchInlineSnapshot(`
    Array [
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 11n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 12n,
          "s": 1n,
        },
      ],
    ]
  `);
});

it('or left alone', async () => {
  expect(await materialize(createSwappedDimensions(twoAnonDims, 0)))
    .toMatchInlineSnapshot(`
    Array [
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 11n,
          "s": 1n,
        },
      ],
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 12n,
          "s": 1n,
        },
      ],
    ]
  `);
});

it('can swap nothing if the dimension is 1D', async () => {
  expect(await materialize(createSwappedDimensions(multiDimX, 0)))
    .toMatchInlineSnapshot(`
    Array [
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      },
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 2n,
        "s": 1n,
      },
      DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 3n,
        "s": 1n,
      },
    ]
  `);
});

it('can work with 3d', async () => {
  expect(await materialize(createSwappedDimensions(threeAnonDims, 0)))
    .toMatchInlineSnapshot(`
    Array [
      Array [
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 11n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 101n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1001n,
            "s": 1n,
          },
        ],
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 102n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1002n,
            "s": 1n,
          },
        ],
      ],
    ]
  `);

  expect(await materialize(createSwappedDimensions(threeAnonDims, 1)))
    .toMatchInlineSnapshot(`
    Array [
      Array [
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 11n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 101n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1001n,
            "s": 1n,
          },
        ],
      ],
      Array [
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 102n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1002n,
            "s": 1n,
          },
        ],
      ],
    ]
  `);

  expect(await materialize(createSwappedDimensions(threeAnonDims, 2)))
    .toMatchInlineSnapshot(`
    Array [
      Array [
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 11n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12n,
            "s": 1n,
          },
        ],
      ],
      Array [
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 101n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 102n,
            "s": 1n,
          },
        ],
      ],
      Array [
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1001n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1002n,
            "s": 1n,
          },
        ],
      ],
    ]
  `);
});
