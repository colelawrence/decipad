// eslint-disable-next-line no-restricted-imports
import { BuildTableArgs, buildType, Type } from '@decipad/language-types';
import { type FullBuiltinSpec } from '../../types';

export const trendFunctor: NonNullable<
  FullBuiltinSpec['functorNoAutomap']
> = async ([thing]) =>
  Type.either(
    // column of numbers
    (
      await (await (await thing.isColumn()).reduced()).isScalar('number')
    ).mapType(buildType.trendOf),

    // table
    await (
      await (await (await thing.isColumn()).reduced()).isTable()
    ).mapType(async (t) =>
      buildType.table({
        ...(t as BuildTableArgs),
        columnTypes: await Promise.all(
          (t.columnTypes ?? []).map(async (cellType) => {
            // if each cell is a number, we recurse
            if (cellType.type === 'number') {
              return buildType.trendOf(cellType);
            }
            return cellType;
          })
        ),
      })
    )
  );
