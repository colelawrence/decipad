import { all } from '@decipad/generator-utils';
import { ColumnDesc } from '../computer';
import { MaterializedColumnDesc } from '../computer/types';

export const materializeColumnDesc = async (
  columnDesc: ColumnDesc
): Promise<MaterializedColumnDesc> => {
  return {
    ...columnDesc,
    result: {
      type: {
        ...columnDesc.result.type,
        kind: 'materialized-column',
      },
      value: await all(columnDesc.result.value()),
    },
  };
};
