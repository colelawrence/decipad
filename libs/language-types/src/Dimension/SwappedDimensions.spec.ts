import { expect, it } from 'vitest';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { createSwappedDimensions } from './SwappedDimensions';
import { projectHypercube } from '../utils/projectHypercube';
import { jsCol } from './testUtils';
import { materializeOneResult } from '../utils';

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
  expect(
    await materializeOneResult(
      projectHypercube(createSwappedDimensions(twoAnonDims, 1))
    )
  ).toMatchInlineSnapshot(`
    [
      [
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
  expect(
    await materializeOneResult(
      projectHypercube(createSwappedDimensions(twoAnonDims, 0))
    )
  ).toMatchInlineSnapshot(`
    [
      [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 11n,
          "s": 1n,
        },
      ],
      [
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
  expect(
    await materializeOneResult(
      projectHypercube(createSwappedDimensions(multiDimX, 0))
    )
  ).toMatchInlineSnapshot(`
    [
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
  expect(
    await materializeOneResult(
      projectHypercube(createSwappedDimensions(threeAnonDims, 0))
    )
  ).toMatchInlineSnapshot(`
    [
      [
        [
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
        [
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

  expect(
    await materializeOneResult(
      projectHypercube(createSwappedDimensions(threeAnonDims, 1))
    )
  ).toMatchInlineSnapshot(`
    [
      [
        [
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
      [
        [
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

  expect(
    await materializeOneResult(
      projectHypercube(createSwappedDimensions(threeAnonDims, 2))
    )
  ).toMatchInlineSnapshot(`
    [
      [
        [
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
      [
        [
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
      [
        [
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
