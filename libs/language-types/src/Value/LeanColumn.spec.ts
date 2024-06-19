import { Result } from '@decipad/language-interfaces';
import { LeanColumn } from './LeanColumn';
import { N } from '@decipad/number';
import { buildType, serializeType } from '../Type';
import { all } from '@decipad/generator-utils';

describe('Lean Column Spec', () => {
  it('Generates simple static values', async () => {
    async function* basicGenerator(
      start = 0,
      end = Infinity
    ): AsyncGenerator<Result.OneResult> {
      for (let i = start; i < end; i++) {
        yield N(5);
      }
    }

    const leanColumn = LeanColumn.fromGeneratorAndType(
      basicGenerator,
      serializeType(buildType.column(buildType.number()))
    );

    const result = (await leanColumn.getData()) as Result.ResultColumn;

    await expect(all(result(0, 3))).resolves.toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
      ]
    `);
  });
});
