import type { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { materializeResult } from '@decipad/language';
import type {
  ColumnDesc,
  MaterializedColumnDesc,
} from '@decipad/computer-interfaces';

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
