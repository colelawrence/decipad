import { GeneratorColumn } from './GeneratorColumn';
import { N } from '@decipad/number';
import { materializeOneResult } from '../utils';
import { Scalar } from './Scalar';

describe('GeneratorColumn', () => {
  const emptyMeta = () => ({
    labels: undefined,
  });

  it('can be empty', async () => {
    const column = GeneratorColumn.fromGenerator(
      // eslint-disable-next-line no-empty-function
      async function* gen() {},
      emptyMeta,
      'test'
    );
    expect(
      await materializeOneResult(await column.getData())
    ).toMatchInlineSnapshot(`Array []`);

    // again
    expect(
      await materializeOneResult(await column.getData())
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('can be materialized', async () => {
    const column = GeneratorColumn.fromGenerator(
      // eslint-disable-next-line no-empty-function
      async function* gen() {
        yield Scalar.fromValue(N(1));
        yield Scalar.fromValue(N(2));
      },
      emptyMeta,
      'test'
    );
    expect(await materializeOneResult(column.getData())).toMatchInlineSnapshot(`
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
      ]
    `);

    // again
    expect(await materializeOneResult(column.getData())).toMatchInlineSnapshot(`
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
      ]
    `);
  });
});
