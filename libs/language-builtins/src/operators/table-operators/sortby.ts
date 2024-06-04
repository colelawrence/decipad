// eslint-disable-next-line no-restricted-imports
import { Type, Value, compare } from '@decipad/language-types';
import { getInstanceof } from '@decipad/utils';
import { sortMap } from '@decipad/column';
import type { FullBuiltinSpec } from '../../types';
import { applyMap } from '../../utils/valueTransforms';

export const sortByFunctorNoAutomap: FullBuiltinSpec['functorNoAutomap'] =
  async ([table, column]) =>
    Type.combine(
      (await column.isColumn()).withAtParentIndex(),
      table.isTable()
    );

export const sortyByValuesNoAutomap: FullBuiltinSpec['fnValuesNoAutomap'] =
  async ([_table, _column]) => {
    const column = Value.getColumnLike(_column);
    const map = await sortMap(column, compare);
    const table = getInstanceof(_table, Value.Table);
    return table.mapColumns((col) => applyMap(col, map));
  };
