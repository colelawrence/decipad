import { dequal, getDefined, getInstanceof, zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { Type, buildType as t, Value } from '@decipad/language-types';
import type { Evaluator, Functor } from '../../types';

export const concatTablesFunctor: Functor = async ([tab1, tab2]) =>
  (await Type.combine(tab1.isTable(), tab2.isTable())).mapType(() => {
    if (!dequal(new Set(tab1.columnNames), new Set(tab2.columnNames))) {
      return t.impossible('Incompatible tables');
    }
    if (tab1.columnTypes?.length !== tab2.columnTypes?.length) {
      return t.impossible('Incompatible tables');
    }

    // Check that column types match, even though we don't care about column order
    for (const tab1ColIndex in tab1.columnNames as string[]) {
      if (typeof tab1ColIndex === 'number') {
        const tab1ColName = (tab1.columnNames as string[])[tab1ColIndex];
        const tab2ColIndex = tab2.columnNames?.indexOf(tab1ColName);
        if (tab2ColIndex === undefined) {
          throw new Error('Something went wrong comparing tables.');
        }
        const tab1ColType = (tab1.columnTypes as Type[])[tab1ColIndex];
        const tab2ColType = (tab2.columnTypes as Type[])[tab2ColIndex];

        if (!dequal(tab1ColType, tab2ColType)) {
          return t.impossible('Incompatible tables');
        }
      }
    }

    return tab1;
  });

export const concatTablesValues: Evaluator = async ([tab1, tab2]) => {
  const { columns: cols1, columnNames: names1 } = getInstanceof(
    tab1,
    Value.Table
  );
  const { columns: cols2, columnNames: names2 } = getInstanceof(
    tab2,
    Value.Table
  );

  const tab2Sorted = zip(names2, cols2).sort((a, b) => {
    const aIndex = names1.indexOf(a[0]);
    const bIndex = names1.indexOf(b[0]);
    if (aIndex < bIndex) return -1;
    if (aIndex > bIndex) return 1;
    return 0;
  });

  return Value.Table.fromNamedColumns(
    await Promise.all(
      zip(
        cols1,
        tab2Sorted.map((x) => x[1])
      ).map(async ([c1, c2]) => Value.createConcatenatedColumn(c1, c2))
    ),
    getDefined(names1)
  );
};
