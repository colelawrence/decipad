import {
  AnyElement,
  ELEMENT_TABLE,
  TableColumnFormulaElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { getCodeNoteString } from '../utils/getCodeNoteString';
import { getNodeString } from '@udecode/plate';

const describeTableType = (
  header: TableHeaderElement,
  formulas: TableColumnFormulaElement[]
): string => {
  switch (header.cellType.kind) {
    case 'table-formula': {
      const formula = formulas.find((f) => f.columnId === header.id);
      return `formula with expression \`${
        formula ? getCodeNoteString(formula).trim() : 'undefined'
      }\``;
    }
  }
  return header.cellType.kind;
};

const describeColumn = (
  header: TableHeaderElement,
  formulas: TableColumnFormulaElement[]
): string =>
  `Column named \`${getNodeString(
    header
  )}\` with elements of type ${describeTableType(header, formulas)}`;

export const tableVerbalizer = (element: AnyElement): string => {
  assertElementType(element, ELEMENT_TABLE);
  const [caption, headerRow, ...rows] = element.children;
  const [varName, ...formulas] = caption.children;
  const columns = headerRow.children;

  const dataAsCSV: string = rows
    .map((row) => row.children.map(getNodeString).join(';'))
    .join('\n');

  return `Table that exposes itself with the variable name \`${getNodeString(
    varName
  )}\` and has ${columns.length} columns:
${columns
  .map((col) => describeColumn(col, formulas))
  .map((d, columnIndex) => `  - column ${columnIndex}: ${d}`)
  .join('\n')}

Here are the data rows for this table in CSV format (empty for columns with formulas):

\`\`\`csv
${dataAsCSV}
\`\`\`
`;
};
