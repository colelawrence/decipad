// eslint-disable-next-line no-restricted-imports
import { buildResult } from '@decipad/language';
import { all } from '@decipad/generator-utils';
import type { ColumnDesc, MaterializedColumnDesc } from '../types';

export const materializeColumnDesc = async (
  columnDesc: ColumnDesc
): Promise<MaterializedColumnDesc> => {
  return {
    ...columnDesc,
    result: buildResult(
      {
        ...columnDesc.result.type,
        kind: 'materialized-column',
      },
      await all(columnDesc.result.value())
    ),
  };
};
