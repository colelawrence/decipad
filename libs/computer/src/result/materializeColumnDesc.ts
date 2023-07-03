import { all } from '@decipad/generator-utils';
import { ColumnDesc, MaterializedColumnDesc } from '../types';

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
