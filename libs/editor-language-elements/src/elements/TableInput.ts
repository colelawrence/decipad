import {
  MyElement,
  ELEMENT_TABLE_INPUT,
  TableData,
  TableInputElement,
} from '@decipad/editor-types';
import { AST } from '@decipad/computer';
import {
  astNode,
  parseCell,
  getNullReplacementValue,
} from '@decipad/editor-utils';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

const getTableNodeFromTableData = (tableData: TableData): AST.Table => {
  const cols: AST.Table['args'] = tableData.columns.map(
    ({ columnName, cellType, cells }) => {
      const cellNodes = cells.map(
        (cell) => parseCell(cellType, cell) ?? getNullReplacementValue(cellType)
      );

      return astNode(
        'table-column',
        astNode('coldef', columnName),
        astNode('column', astNode('column-items', ...cellNodes))
      );
    }
  );

  return astNode('table', ...cols);
};

export const TableInput: InteractiveLanguageElement = {
  type: ELEMENT_TABLE_INPUT,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (element: MyElement) => {
      const { tableData } = element as TableInputElement;
      if (!tableData || !tableData.variableName) return null;
      const expression = getTableNodeFromTableData(tableData);
      if (expression) {
        return { name: tableData.variableName, expression };
      }
      return null;
    }
  ),
};
