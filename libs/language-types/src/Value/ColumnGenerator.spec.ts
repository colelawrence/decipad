import { N } from '@decipad/number';
import { buildType } from '..';
import { Column } from './Column';
import { ColumnGenerator } from './ColumnGenerator';
import { Scalar } from './Scalar';
import { all, from } from '@decipad/generator-utils';
import { getResultGenerator } from '../utils/getResultGenerator';

describe('ColumnGenerator', () => {
  const emptyMeta = () => ({
    labels: undefined,
  });

  it('can generate columns', async () => {
    const columns = Array.from({ length: 4 }, (_, i) =>
      Column.fromValues(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          .map((n) => N(n).mul(N(i + 1)))
          .map(Scalar.fromValue),
        emptyMeta
      )
    );
    const gen = new ColumnGenerator(
      buildType.number(),
      () => from(columns),
      [],
      emptyMeta
    );

    const generator = getResultGenerator(await gen.getData())();
    const values = await all(generator);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 10; j++) {
        expect(values[i * 10 + j]).toEqual(N(j + 1).mul(N(i + 1)));
      }
    }

    const valueValues = await all(gen.values());

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 10; j++) {
        // eslint-disable-next-line no-await-in-loop
        expect(await valueValues[i * 10 + j].getData()).toEqual(
          N(j + 1).mul(N(i + 1))
        );
      }
    }
  });
});
