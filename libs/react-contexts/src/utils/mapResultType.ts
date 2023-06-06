/* eslint-disable no-param-reassign */
import { Result } from '@decipad/computer';
import { SimpleTableCellType } from '@decipad/editor-types';
import { produce } from '@decipad/utils';

/**
 * Takes a result and a type mapping (Array of types),
 * and returns a new result with the new types applied.
 */
export function mapResultType(
  result: Result.Result,
  typeMapping: Array<SimpleTableCellType | undefined>
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
    case 'date':
    case 'string':
    case 'number':
    case 'boolean': {
      if (!typeMapping.at(0)) return result;
      result = produce(result, (draftState) => {
        // eslint-disable-next-line prefer-destructuring
        draftState.type = typeMapping[0] as SimpleTableCellType;
      });
      return result;
    }
    default: {
      throw new Error('NOT IMPLEMENTED YET');
    }
  }
}
