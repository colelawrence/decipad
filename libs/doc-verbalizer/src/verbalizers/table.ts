import { identity, transpose } from 'ramda';
import { assertElementType } from '../utils/assertElementType';
import type { VarnameToId, Verbalizer } from './types';
import stringify from 'json-stringify-safe';
import type {
  TableColumnFormulaElement,
  TableHeaderElement,
} from '../../../editor-types/src';
import { ELEMENT_TABLE, ELEMENT_TH } from '../../../editor-types/src';
import { getNodeString } from '../utils/getNodeString';

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
      kind === 'date' ||
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

export const tableVarnameToId: VarnameToId = (element) => {
  assertElementType(element, ELEMENT_TABLE);
  const [caption] = element.children;
  const [varname] = caption.children;
  return [getNodeString(varname), element.id];
};

export const columnVarnameToId: VarnameToId = (element) => {
  assertElementType(element, ELEMENT_TH);
  return [getNodeString(element), element.id];
};
