import {
  ELEMENT_TABLE,
  TableColumnFormulaElement,
  TableHeaderElement,
} from '../../../editor-types/src';
import { getNodeString } from '@udecode/plate';
import { identity, transpose } from 'ramda';
import { assertElementType } from '../utils/assertElementType';
import { Verbalizer } from './types';
import stringify from 'json-stringify-safe';

export const tableVerbalizer: Verbalizer = (element, verbalize) => {
  const tableColumnValue = (
    header: TableHeaderElement,
    data: string[],
    formulas: TableColumnFormulaElement[]
  ): string => {
    if (header.cellType.kind === 'table-formula') {
      const formula = formulas.find((f) => f.columnId === header.id);
      if (!formula) {
        return 'unknown';
      }
      return verbalize(formula);
    }
    const { kind } = header.cellType;
    const mapper =
      kind === 'string' ||
      kind === 'anything' ||
      (kind === 'series' && header.cellType.seriesType !== 'number')
        ? (d: string) => stringify(d)
        : identity;
    return `[${data.map(mapper).join(', ')}]`;
  };

  const describeColumn = (
    header: TableHeaderElement,
    data: string[],
    formulas: TableColumnFormulaElement[]
  ): string =>
    `  ${getNodeString(header)} = ${tableColumnValue(header, data, formulas)}`;

  assertElementType(element, ELEMENT_TABLE);
  const [caption, headerRow, ...rows] = element.children;
  const [varName, ...formulas] = caption.children;
  const columns = headerRow.children;

  const data = transpose(rows.map((row) => row.children.map(verbalize)));

  return `\`\`\`deci
${verbalize(varName)} = {
${columns
  .map((col, colIndex) => describeColumn(col, data[colIndex], formulas))
  .join('\n')}
}
\`\`\``;
};
