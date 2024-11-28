import { dequal, getDefined, produce, zip } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { Type, buildType as t, Value } from '@decipad/language-types';
import type { Evaluator, Functor } from '../../types';

export const concatTablesFunctor: Functor = async ([tab1, _tab2]) =>
  (await Type.combine(tab1.isTable(), _tab2.isTable())).mapType(() => {
    if (!dequal(new Set(tab1.columnNames), new Set(_tab2.columnNames))) {
      return t.impossible('Incompatible tables');
    }
    if (tab1.columnTypes?.length !== _tab2.columnTypes?.length) {
      return t.impossible('Incompatible tables');
    }

    const tab2 = produce(_tab2, (draft) => {
      const names1 = getDefined(tab1.columnNames);
      const names2 = getDefined(_tab2.columnNames);
      const cols2 = getDefined(_tab2.columnTypes);
      const tab2NamesAndTypes = zip(names2, cols2).sort((a, b) => {
        const aIndex = names1.indexOf(a[0]);
        const bIndex = names1.indexOf(b[0]);
        if (aIndex < bIndex) return -1;
        if (aIndex > bIndex) return 1;
        return 0;
      });
      draft.columnNames = tab2NamesAndTypes.map((x) => x[0]);
      draft.columnTypes = tab2NamesAndTypes.map((x) => x[1]);
    });

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

    return produce(tab1, (draft) => {
      draft.rowCount =
        tab2.rowCount != null && tab1.rowCount != null
          ? tab1.rowCount + tab2.rowCount
          : undefined;

      draft.columnTypes =
        draft.columnTypes?.map((tab1Coltype, index) =>
          produce(tab1Coltype, (tab1Coltype) => {
            const tab2ColType = tab2.columnTypes?.[index];

            tab1Coltype.cellCount =
              tab1Coltype?.cellCount != null && tab2ColType?.cellCount != null
                ? tab1Coltype.cellCount + tab2ColType.cellCount
                : undefined;

            return tab1Coltype;
          })
        ) ?? null;
    });
  });

export const concatTablesValues: Evaluator = async (tables) => {
  const [tab1, tab2] = tables.map((table) => Value.getTableValue(table));
  const { columns: cols1, columnNames: names1 } = tab1;
  const { columns: cols2, columnNames: names2 } = tab2;

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
    getDefined(names1),
    () => ({
      labels: tab1
        .meta?.()
        ?.labels?.then(
          async (labels1) =>
            tab2.meta?.()?.labels?.then((labels2) => labels1.concat(labels2)) ??
            []
        ),
    })
  );
};
