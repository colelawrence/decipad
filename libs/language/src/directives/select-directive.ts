import { getDefined } from '@decipad/utils';
import { AST, Table } from '..';
import { build as t } from '../type';
import { filterUnzipped, getInstanceof, getOfType } from '../utils';
import { Directive } from './types';

const cleanAST = (...args: AST.Node[]) =>
  [
    getOfType('ref', args[0]),
    getOfType('generic-list', args[1]).args.map(
      (desiredColumn) => getOfType('generic-identifier', desiredColumn).args[0]
    ),
  ] as const;

export const select: Directive = {
  argCount: 2,
  async getType(_, { infer }, args) {
    const [tableRef, columns] = cleanAST(...args);

    const table = (await infer(tableRef)).isTable();

    return table.mapType((table) => {
      const { indexName } = table;

      const [columnNames, columnTypes] = filterUnzipped(
        getDefined(table.columnNames),
        getDefined(table.columnTypes),
        (key) => columns.includes(key)
      );

      if (columns.length !== columnNames.length) {
        return t.impossible(
          'The selected column does not exist in the reference table'
        );
      }

      return t.table({
        indexName,
        columnNames,
        columnTypes,
      });
    });
  },
  async getValue(_, { evaluate }, args) {
    const [tableRef, columns] = cleanAST(...args);

    const table = getInstanceof(await evaluate(tableRef), Table);

    return table.filterColumns((colName) => columns.includes(colName));
  },
};
