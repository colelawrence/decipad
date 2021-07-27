import { AST } from '..';
import { getDefined, getIdentifierString } from '../utils';

import { Column } from './Value';
import { evaluate } from './evaluate';
import { Realm } from './Realm';
import { Value } from './Value';
import { mapWithPrevious } from './previous';

export const evaluateGiven = async (
  realm: Realm,
  { args: [ref, body] }: AST.Given
): Promise<Value> => {
  const predicateName = getIdentifierString(ref);
  const predicate = await evaluate(realm, ref);

  if (!(predicate instanceof Column)) {
    throw new Error('panic: expected column');
  }

  return await realm.stack.withPush(async () => {
    if (predicate.valueNames != null) {
      // It's a table

      const columns = predicate.values as Column[];
      const colNames = predicate.valueNames;
      const length = getDefined(columns[0].values.length);

      const mapped = await mapWithPrevious(realm, async function* () {
        for (let index = 0; index < length; index++) {
          const thisRow = Column.fromNamedValues(
            columns.map((p) => p.values[index]),
            colNames
          );
          realm.stack.set(predicateName, thisRow);

          yield await evaluate(realm, body);
        }
      });

      if (mapped.some((m) => m instanceof Column && m.valueNames != null)) {
        // A row was returned in the body -- re-column-orient the table!
        const newColumns = columns.map((column) =>
          Column.fromValues(
            Array.from({ length }, (_, rowIndex) => column.values[rowIndex])
          )
        );

        return Column.fromNamedValues(newColumns, colNames);
      } else {
        return Column.fromValues(mapped);
      }
    } else {
      const mapped = await mapWithPrevious(realm, async function* () {
        for (const value of predicate.values) {
          realm.stack.set(predicateName, value);

          yield await evaluate(realm, body);
        }
      });

      return Column.fromValues(mapped);
    }
  });
};
