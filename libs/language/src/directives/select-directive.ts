import { getDefined, zip } from '@decipad/utils';
import { AST, Column } from '..';
import { build as t } from '../type';
import { getInstanceof, getOfType } from '../utils';
import { Directive } from './types';

const zipFilterUnzip = <T>(
  keys: string[] | null,
  values: T[] | null,
  acceptable: string[]
) => {
  const outKeys: string[] = [];
  const outValues: T[] = [];

  for (const [key, value] of zip(getDefined(keys), getDefined(values))) {
    if (acceptable.includes(key)) {
      outKeys.push(key);
      outValues.push(value);
    }
  }

  return [outKeys, outValues] as const;
};

const cleanAST = (...args: AST.Node[]) =>
  [
    getOfType('ref', args[0]),
    getOfType('generic-list', args[1]).args.map(
      (desiredColumn) => getOfType('generic-identifier', desiredColumn).args[0]
    ),
  ] as const;

export const select: Directive = {
  argCount: 2,
  async getType({ infer }, ...args) {
    const [tableRef, columns] = cleanAST(...args);

    const table = (await infer(tableRef)).isTable();

    return table.mapType((table) => {
      const { indexName, tableLength } = table;

      const [columnNames, columnTypes] = zipFilterUnzip(
        table.columnNames,
        table.columnTypes,
        columns
      );

      return t.table({
        indexName,
        length: getDefined(tableLength),
        columnNames,
        columnTypes,
      });
    });
  },
  async getValue({ evaluate }, ...args) {
    const [tableRef, columns] = cleanAST(...args);

    const table = getInstanceof(await evaluate(tableRef), Column);

    const [names, values] = zipFilterUnzip(
      table.valueNames,
      table.values,
      columns
    );

    return Column.fromNamedValues(values, names);
  },
};
