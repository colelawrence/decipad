import { AST, Computer, IdentifiedError } from '@decipad/computer';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  TableElement,
  TableHeaderElement,
  TableRowElement,
} from '@decipad/editor-types';
import {
  astColumn,
  getCodeLineSource,
  isElementOfType,
} from '@decipad/editor-utils';
import {
  inferColumn,
  parseCell,
  getNullReplacementValue,
} from '@decipad/parse';
import { getNodeString } from '@udecode/plate';
import { formulaSourceToColumnAssign } from './formulaSourceToColumnAssign';
import { seriesColumn } from './seriesColumn';
import { simpleError } from './common';

interface HeaderToColumnProps {
  computer: Computer;
  tableName: string;
  table: TableElement;
  th: TableHeaderElement;
  columnIndex: number;
  dataRows: TableRowElement[];
}

export interface ColumnParseReturn {
  errors: IdentifiedError[];
  expression?: AST.Expression;
  columnName: string;
  elementId: string;
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

  if (isElementOfType(formula, ELEMENT_TABLE_COLUMN_FORMULA)) {
    return formulaSourceToColumnAssign(
      columnName,
      th.id,
      getCodeLineSource(formula)
    );
  }
  return {
    elementId: th.id,
    columnName,
    errors: [simpleError(th.id, 'Could not find a formula for this column')],
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
  const content = getNodeString(dataRows[0].children[columnIndex]);
  const [expression, errors] = await seriesColumn(
    computer,
    th.cellType.seriesType,
    content,
    dataRows.length,
    dataRows.map((dataRow) => dataRow.children[columnIndex].id)
  );
  return {
    elementId: th.id,
    expression,
    columnName: getNodeString(th),
    errors,
  };
};

const dropdownColumnToColumn = ({
  th,
  columnIndex,
  dataRows,
}: HeaderToColumnProps): ColumnParseReturn => {
  const errors: IdentifiedError[] = [];
  const cellTexts: string[] = [];
  const cellIds: string[] = [];
  for (const tr of dataRows) {
    const td = tr.children[columnIndex];
    if (td) {
      cellTexts.push(getNodeString(td));
      cellIds.push(td.id);
    }
  }

  if (th.cellType.kind !== 'dropdown') {
    throw new Error('Dropdown column should have dropdown type');
  }

  const items = cellTexts.map((text): AST.Expression => {
    if (text) {
      return {
        type: 'ref',
        args: [text],
      };
    }
    return getNullReplacementValue(th.cellType);
  });

  const expression = astColumn(...items);
  return {
    expression,
    errors,
    columnName: getNodeString(th),
    elementId: th.id,
  };
};

const dataColumnToColumn = async ({
  computer,
  th,
  columnIndex,
  dataRows,
}: HeaderToColumnProps): Promise<ColumnParseReturn> => {
  const errors: IdentifiedError[] = [];
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
      ? inferColumn(computer, cellTexts, { userType: th.cellType })
      : th.cellType;

  const items = await Promise.all(
    cellTexts.map(async (text, index) => {
      let parsed = await parseCell(computer, columnType, text);
      if (parsed instanceof Error) {
        errors.push(simpleError(cellIds[index], parsed.message));
        parsed = null;
      }
      if (!parsed) {
        parsed = getNullReplacementValue(columnType);
      }
      return parsed;
    })
  );
  const expression = astColumn(...items);

  return {
    expression,
    errors,
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
    : cellType.kind === 'dropdown'
    ? dropdownColumnToColumn(props)
    : dataColumnToColumn(props);
};
