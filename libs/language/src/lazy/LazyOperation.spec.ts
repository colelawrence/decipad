import DeciNumber, { N } from '@decipad/number';
import { createLazyOperationBase, HypercubeArg } from './LazyOperation';
import { NumberValue, fromJS, Value, getColumnLike } from '../value';
import { getInstanceof } from '../utils';

import { hcArg } from './testUtils';
import { uniqDimensions } from './uniqDimensions';
import { materializeOneResult } from '../utils/materializeOneResult';

type WithLazyOperationArgs = {
  args: HypercubeArg[];
};

const getArgs = async (
  val: Value | Promise<Value>
): Promise<HypercubeArg[]> => {
  return ((await val) as unknown as WithLazyOperationArgs).args;
};

describe('nesting', () => {
  const op =
    (simpleCallback: (...args: DeciNumber[]) => DeciNumber) =>
    async (args: Value[]) =>
      fromJS(
        simpleCallback(
          ...(await Promise.all(
            args.map(async (a) => getInstanceof(a, NumberValue).getData())
          ))
        )
      );

  const multiDimX = createLazyOperationBase(
    op((a) => a),
    [hcArg([1n, 2n, 3n], 'X')]
  );

  const multiDimXTwice = createLazyOperationBase(
    op((a, b) => a.div(b)),
    [hcArg([1n, 2n, 3n], 'X'), hcArg([2n, 4n, 6n], 'X')]
  );

  const multidimDivision = createLazyOperationBase(
    op((a, b) => a.div(b)),
    [hcArg([100n, 200n, 300n], 'X'), hcArg([1n, 2n, 3n], 'Y')]
  );

  it('can lowLevelGet into nested hypercubes', async () => {
    const nested2 = getColumnLike(
      await createLazyOperationBase(
        op((a) => a.add(N(100))),
        [[await multiDimX, ['X']]]
      )
    );
    expect(await (await nested2.lowLevelGet(0)).getData()).toEqual(N(101));

    const nested3 = getColumnLike(
      await createLazyOperationBase(
        op((a, b) => a.mul(N(100)).add(b)),
        [
          [await multiDimX, ['X']],
          [await multiDimX, ['X']],
        ]
      )
    );
    expect(await (await nested3.lowLevelGet(0)).getData()).toEqual(N(101));
    expect(await materializeOneResult(nested3.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber(101),
        DeciNumber(202),
        DeciNumber(303),
      ]
    `);
  });

  it('uniqDimensions can find out what dimensions are involved and give them to ya', async () => {
    expect(await uniqDimensions(await getArgs(multiDimX))).toEqual([
      ['X'],
      [{ dimensionLength: 3 }],
    ]);
    expect(await uniqDimensions(await getArgs(multiDimXTwice))).toEqual([
      ['X'],
      [{ dimensionLength: 3 }],
    ]);
    expect(await uniqDimensions(await getArgs(multidimDivision))).toEqual([
      ['X', 'Y'],
      [{ dimensionLength: 3 }, { dimensionLength: 3 }],
    ]);
  });

  it('can operate with one column', async () => {
    const operateWithOneD = await createLazyOperationBase(
      op((a, b) => a.add(b)),
      [hcArg([1n, 2n, 3n], 'X'), hcArg(100n, 0)]
    );

    expect(await materializeOneResult(operateWithOneD.getData()))
      .toMatchInlineSnapshot(`
    Array [
      DeciNumber(101),
      DeciNumber(102),
      DeciNumber(103),
    ]
    `);

    const operateWithOneDReversed = await createLazyOperationBase(
      op((a, b) => a.add(b)),
      [hcArg(100n, 0), hcArg([1n, 2n, 3n], 'X')]
    );

    expect(await materializeOneResult(operateWithOneDReversed.getData()))
      .toMatchInlineSnapshot(`
    Array [
      DeciNumber(101),
      DeciNumber(102),
      DeciNumber(103),
    ]
    `);
  });
});
