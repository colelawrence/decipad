import {
  type AST,
  type RemoteComputer,
  type IdentifiedError,
  getExprRef,
} from '@decipad/remote-computer';
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
import { getNodeString } from '@udecode/plate-common';
import { PromiseOrType } from '@decipad/utils';
import { formulaSourceToColumnAssign } from './formulaSourceToColumnAssign';
import { seriesColumn } from './seriesColumn';
import { simpleArtifficialError } from './common';

interface HeaderToColumnProps {
  computer: RemoteComputer;
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
    const ret = formulaSourceToColumnAssign(
      columnName,
      th.id,
      getCodeLineSource(formula)
    );
    return ret;
  }
  return {
    elementId: th.id,
    columnName,
    errors: [
      simpleArtifficialError(
        th.id,
        'Could not find a formula for this column',
        [th.id]
      ),
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
  const content = getNodeString(dataRows[0].children[columnIndex]);
  const [expression, errors] = await seriesColumn(
    computer,
    th.cellType.seriesType,
    content,
    dataRows.length,
    dataRows.map((dataRow) => dataRow.children[columnIndex].id),
    th.id
  );
  return {
    elementId: th.id,
    expression,
    columnName: getNodeString(th),
    errors,
  };
};

const dropdownOrCategoryColumnToColumn = ({
  th,
  columnIndex,
  dataRows,
}: HeaderToColumnProps): ColumnParseReturn => {
  if (th.cellType.kind !== 'dropdown' && th.cellType.kind !== 'category') {
    throw new Error('Dropdown column should have dropdown or category type');
  }

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

  const items = cellTexts.map((text): AST.Expression => {
    if (text) {
      return {
        type: 'ref',
        args: [getExprRef(text)],
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
      ? await inferColumn(computer, cellTexts, {
          userType: th.cellType,
        })
      : th.cellType;

  const items = await Promise.all(
    cellTexts.map(async (text, index) => {
      let parsed = await parseCell(computer, columnType, text);

      if (parsed instanceof Error) {
        errors.push(
          simpleArtifficialError(cellIds[index], parsed.message, [th.id])
        );
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

export const headerToColumn = (
  props: HeaderToColumnProps
): PromiseOrType<ColumnParseReturn> => {
  const { th, dataRows } = props;
  const { cellType } = th;

  if (cellType.kind === 'table-formula') {
    return tableFormulaColumnToColumn(props);
  }

  if (cellType.kind === 'series' && dataRows.length > 0) {
    return seriesColumnToColumn(props);
  }

  if (cellType.kind === 'dropdown' || cellType.kind === 'category') {
    return dropdownOrCategoryColumnToColumn(props);
  }

  return dataColumnToColumn(props);
};
