import groupBy from 'lodash.groupby';
// eslint-disable-next-line no-restricted-imports
import { type AST } from '@decipad/language';
import { ProgramBlock } from '../types';
import { decilang } from '..';
import { statementToIdentifiedBlock } from '../utils';

/** Takes a list of programs, finds columns defined inside tables, pulls them out and inlines them.
 * For example
 * ```
 * Table = {
 *   Column1 = [1, 2, 3]
 *   Column2 = [4, 5, 6]
 * }
 * ```
 * Becomes
 * ```
 * Table = {}
 * Table.Column1 = [1, 2, 3]
 * Table.Column2 = [4, 5, 6]
 * ```
 */
export const flattenTableDeclarations = (programs: ProgramBlock[]) => {
  return programs.flatMap((program) => {
    const { block } = program;
    if (!block) return program;

    const [statement] = block.args;
    if (statement.type !== 'table') return program;

    const [tableDef, ...columnDefs] = statement.args;
    const grouped = groupBy(columnDefs, 'type');

    // curse lodash and its poor type safety
    const tableColumns = (grouped['table-column'] || []) as AST.TableColumn[];

    const [tableName] = tableDef.args;

    const tableItself = statementToIdentifiedBlock(
      block.id,
      decilang`${{ name: tableName }} = {}`
    );

    const assigns = [tableItself];

    tableColumns.forEach((column, i) => {
      const [colDef, expression] = column.args;
      const columnAssign: AST.TableColumnAssign = {
        type: 'table-column-assign',
        args: [
          { type: 'tablepartialdef', args: [tableName] },
          { type: 'coldef', args: [colDef.args[0]] },
          expression,
          i,
        ],
      };

      assigns.push(
        // Hacking the block ID to be unique here because column assigns
        // don't have a place in the UI to live, but block IDs must be unique
        // or column assigns won't be computed.
        statementToIdentifiedBlock(
          `${block.id}_${i}`,
          columnAssign,
          true,
          block.id
        )
      );
    });
    return assigns;
  });
};
