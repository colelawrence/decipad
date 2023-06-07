import unzip from 'lodash.unzip';
import zip from 'lodash.zip';
import { produce } from '@decipad/utils';
import { Type } from '../type';

export const sortType = (type: Type): Type => {
  // Checking that declaration is a table
  const { columnNames, columnTypes } = type;
  if (
    !columnNames ||
    columnNames.length === 0 ||
    !columnTypes ||
    columnTypes.length === 0
  ) {
    return type;
  }

  const { indexName } = type;

  const sorted = zip(columnNames, columnTypes).sort(
    ([name1, type1], [name2, type2]) => {
      if (name1 === indexName) {
        return Infinity;
      }
      if (name2 === indexName) {
        return -Infinity;
      }
      return (type1?.atParentIndex ?? 0) - (type2?.atParentIndex ?? 0);
    }
  );
  const [newColumnNames, newColumnTypes] = unzip(sorted);

  return produce(type, (t) => {
    t.columnNames = newColumnNames as string[];
    t.columnTypes = newColumnTypes as Type[];
  });
};
