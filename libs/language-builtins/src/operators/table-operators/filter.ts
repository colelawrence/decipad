import { produce, getInstanceof } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { Type, Value, valueToResultValue } from '@decipad/language-types';
import type { FullBuiltinSpec } from '../../interfaces';
import { all, map } from '@decipad/generator-utils';
import { applyFilterMap } from '../../utils/valueTransforms';

export const filterFunctorNoAutomap: FullBuiltinSpec['functorNoAutomap'] =
  async ([subject, column]) =>
    Type.either(
      Type.combine(
        (await (await column.isColumn()).reduced()).isScalar('boolean'),
        subject.isTable(),
        produce((table) => {
          table.indexName = null;
        })
      ),
      Type.combine(
        (await (await column.isColumn()).reduced()).isScalar('boolean'),
        subject.isColumn()
      )
    );

export const filterValuesNoAutomap: FullBuiltinSpec['fnValuesNoAutomap'] =
  async ([subject, _column]) => {
    const filterMap = (await all(
      map(Value.getColumnLike(_column).values(), valueToResultValue)
    )) as boolean[];
    if (subject instanceof Value.Column) {
      return applyFilterMap(subject, filterMap);
    }
    const table = getInstanceof(subject, Value.Table);
    return table.mapColumns((col) => applyFilterMap(col, filterMap));
  };
