/* eslint-disable no-param-reassign */
import { produce } from '@decipad/utils';
import { Result, SerializedType } from '..';

/**
 * Takes a result and a type mapping (Array of types),
 * and returns a new result with the new types applied.
 */
export function mapResultType(
  result: Result.Result,
  typeMapping: Array<SerializedType | undefined>
): Result.Result {
  switch (result.type.kind) {
    case 'materialized-table': {
      let tableResult = result as Result.Result<'materialized-table'>;
      typeMapping.forEach((type, i) => {
        if (!type) return;
        tableResult = produce(tableResult, (draftState) => {
          draftState.type.columnTypes[i] = type;
        });
      });
      return tableResult as Result.Result;
    }
    case 'materialized-column':
    case 'column':
      if (!typeMapping.at(0)) return result;
      const newResult = produce(
        result as Result.Result<'column'>,
        (draftState) => {
          if (typeMapping[0]) {
            // eslint-disable-next-line prefer-destructuring
            draftState.type.cellType = typeMapping[0];
          }
        }
      );
      return newResult as Result.Result;
    case 'date':
    case 'string':
    case 'number':
    case 'boolean': {
      if (!typeMapping.at(0)) return result;
      result = produce(result, (draftState) => {
        if (typeMapping[0]) {
          // eslint-disable-next-line prefer-destructuring
          draftState.type = typeMapping[0];
        }
      });
      return result;
    }
    default: {
      throw new Error('NOT IMPLEMENTED YET');
    }
  }
}
