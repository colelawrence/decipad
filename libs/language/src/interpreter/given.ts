import { getDefined, getIdentifierString } from '../utils';

import { Column } from './Value';
import { evaluate } from './evaluate';
import { Realm } from './Realm';

export const evaluateGiven = (
  realm: Realm,
  { args: [ref, body] }: AST.Given
) => {
  const predicateName = getIdentifierString(ref);
  const predicate = evaluate(realm, ref);

  if (!(predicate instanceof Column)) {
    throw new Error('panic: expected column');
  }

  return realm.stack.withPush(() => {
    if (predicate.valueNames != null) {
      // It's a table

      const columns = predicate.values as Column[];
      const colNames = predicate.valueNames;
      const length = getDefined(columns[0].values.length);

      const mapped = Array.from({ length }, (_, index) => {
        const thisRow = Column.fromNamedValues(
          columns.map((p) => p.values[index]),
          colNames
        );
        realm.stack.set(predicateName, thisRow);

        return evaluate(realm, body);
      });

      if (mapped.some((m) => m instanceof Column && m.valueNames != null)) {
        // A row was returned in the body -- re-column-orient the table!
        const newColumns = columns.map((column) =>
          Column.fromValues(
            Array.from({ length }, (_, rowIndex) => column.values[rowIndex])
          )
        );

        return Column.fromNamedValues(newColumns, colNames);
      }

      return Column.fromValues(mapped);
    } else {
      const mapped = predicate.values.map((value) => {
        realm.stack.set(predicateName, value);

        return evaluate(realm, body);
      });

      return Column.fromValues(mapped);
    }
  });
};
