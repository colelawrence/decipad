import { AST, Computer } from '@decipad/computer';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  TableElement,
  TableHeaderElement,
  TableRowElement,
} from '@decipad/editor-types';
import { astColumn } from '@decipad/editor-utils';
import {
  inferColumn,
  parseCell,
  getNullReplacementValue,
} from '@decipad/parse';
import { getNodeString } from '@udecode/plate';
import { ParseError } from '../types';
import { formulaSourceToColumnAssign } from './formulaSourceToColumnAssign';
import { seriesColumn } from './seriesColumn';

interface HeaderToColumnProps {
  computer: Computer;
  table: TableElement;
  th: TableHeaderElement;
  columnIndex: number;
  dataRows: TableRowElement[];
}

export interface ColumnParseReturn {
  parseErrors: ParseError[];
  expression?: AST.Expression;
  columnName: string;
  elementId?: string;
}

const tableFormulaColumnToColumn = ({
  table,
  th,
}: HeaderToColumnProps): ColumnParseReturn => {
  const columnName = getNodeString(th);
  const formula = table.children[0].children.find(
    (child) =>
      child.type === ELEMENT_TABLE_COLUMN_FORMULA && child.columnId === th.id
  );

  if (formula) {
    return formulaSourceToColumnAssign(
      columnName,
      formula.id,
      formula ? getNodeString(formula) : ''
    );
  }
  return {
    columnName,
    parseErrors: [
      {
        elementId: th.id,
        error: 'Could not find a formula for this column',
      },
    ],
  };
};

const seriesColumnToColumn = async ({
  columnIndex,
  computer,
  th,
  dataRows,
}: HeaderToColumnProps): Promise<ColumnParseReturn> => {
  if (th.cellType.kind !== 'series') {
    throw new Error('Expected series');
  }
  const firstDataRow = dataRows[0];
  if (!firstDataRow) {
    throw new Error('Expected first data row');
  }
  const content = getNodeString(firstDataRow.children[columnIndex]);
  const expression = await seriesColumn(
    computer,
    th.cellType.seriesType,
    content,
    dataRows.length
  );
  return {
    elementId: th.id,
    expression,
    columnName: getNodeString(th),
    parseErrors: [],
  };
};

const dataColumnToColumn = async ({
  computer,
  th,
  columnIndex,
  dataRows,
}: HeaderToColumnProps): Promise<ColumnParseReturn> => {
  const parseErrors: ParseError[] = [];
  const cellTexts: string[] = [];
  const cellIds: string[] = [];
  for (const tr of dataRows) {
    const td = tr.children[columnIndex];
    if (td) {
      cellTexts.push(getNodeString(td));
      cellIds.push(td.id);
    }
  }

  const columnType =
    !th.cellType || th.cellType.kind === 'anything'
      ? await inferColumn(computer, cellTexts, { userType: th.cellType })
      : th.cellType;

  const items = await Promise.all(
    cellTexts.map(async (text, index) => {
      let parsed = await parseCell(computer, columnType, text);
      if (!parsed) {
        parseErrors.push({
          error: `Invalid ${columnType.kind}`,
          elementId: cellIds[index],
        });
      }
      if (parsed instanceof Error) {
        parseErrors.push({
          error: parsed.message,
          elementId: cellIds[index],
        });
        parsed = null;
      }
      if (!parsed) {
        parsed = await getNullReplacementValue(columnType);
      }
      return parsed;
    })
  );
  const expression = astColumn(...items);
  return {
    expression,
    parseErrors,
    columnName: getNodeString(th),
    elementId: th.id,
  };
};

export const headerToColumn = async (
  props: HeaderToColumnProps
): Promise<ColumnParseReturn> => {
  const { th, dataRows } = props;
  const { cellType } = th;
  return cellType.kind === 'table-formula'
    ? tableFormulaColumnToColumn(props)
    : cellType.kind === 'series' && dataRows.length > 0
    ? seriesColumnToColumn(props)
    : dataColumnToColumn(props);
};
