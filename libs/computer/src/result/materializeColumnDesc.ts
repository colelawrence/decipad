// eslint-disable-next-line no-restricted-imports
import type { Result } from '@decipad/language';
// eslint-disable-next-line no-restricted-imports
import { materializeResult } from '@decipad/language';
import type { ColumnDesc, MaterializedColumnDesc } from '../types';

export const materializeColumnDesc = async (
  columnDesc: ColumnDesc
): Promise<MaterializedColumnDesc> => {
  return {
    ...columnDesc,
    result: (await materializeResult(
      columnDesc.result
    )) as Result.Result<'materialized-column'>,
  };
};
