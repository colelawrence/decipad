import { getDefined } from '@decipad/utils';
import produce from 'immer';
import { dequal } from 'dequal';
import { getInstanceof, zip } from '../../utils';
import { Column, StringValue } from '../../interpreter/Value';
import { RuntimeError } from '../../interpreter/RuntimeError';
import { BuiltinSpec } from '../interfaces';
import { Type, build as t } from '../../type';

export const tableOperators: { [fname: string]: BuiltinSpec } = {
  lookup: {
    argCount: 2,
    functor: ([table, index]) =>
      Type.combine(
        table.isTable(),
        (t) => getDefined(getDefined(t).columnTypes?.[0]?.isScalar('string')),
        index.isScalar('string'),
        () =>
          t.row(
            getDefined(table.columnTypes, `no column types in ${table}`),
            getDefined(table.columnNames, `no column names in ${table}`)
          )
      ),
    fnValues: (table, needle) => {
      table = getInstanceof(table, Column);
      const needleString = getInstanceof(needle, StringValue).getData();
      const firstColumn = getInstanceof(table.values[0], Column);

      const rowIndex = firstColumn.values.findIndex(
        (value) => value.getData() === needleString
      );

      if (rowIndex === -1) {
        throw new RuntimeError(`Could not find row by index "${needleString}"`);
      }

      return Column.fromNamedValues(
        Array.from(
          table.values,
          (column) => (column as Column).values[rowIndex]
        ),
        table.valueNames as string[]
      );
    },
  },
  concatenate: {
    argCount: 2,
    fnValues: (tab1, tab2) => {
      const { values: columns1, valueNames } = getInstanceof(tab1, Column);
      const { values: columns2 } = getInstanceof(tab2, Column);

      return Column.fromNamedValues(
        zip(columns1 as Column[], columns2 as Column[]).map(([c1, c2]) =>
          Column.fromValues([...c1.values, ...c2.values])
        ),
        getDefined(valueNames)
      );
    },
    functor: ([tab1, tab2]) =>
      Type.combine(tab1.isTable(), tab2.isTable()).mapType(() => {
        if (
          !dequal(tab1.columnNames, tab2.columnNames) ||
          !dequal(tab1.columnTypes, tab2.columnTypes)
        ) {
          return t.impossible('Incompatible tables');
        } else {
          return produce(tab1, (tab1) => {
            if (
              typeof tab1.tableLength === 'number' &&
              typeof tab2.tableLength === 'number'
            ) {
              tab1.tableLength += tab2.tableLength;
            } else {
              tab1.tableLength = 'unknown';
            }
          });
        }
      }),
  },
};
