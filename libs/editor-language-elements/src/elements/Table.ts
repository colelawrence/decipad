import {
  Element,
  ELEMENT_TABLE_INPUT,
  TableElement,
  TableData,
} from '@decipad/editor-types';
import { AST } from '@decipad/language';
import {
  astNode,
  parseCell,
  getNullReplacementValue,
} from '@decipad/editor-utils';
import { InteractiveLanguageElement } from '../types';
import { weakMapMemoizeInteractiveElementOutput } from '../utils/weakMapMemoizeInteractiveElementOutput';

const getTableNode = (tableData: TableData): AST.Table => {
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

export const Table: InteractiveLanguageElement = {
  type: ELEMENT_TABLE_INPUT,
  resultsInNameAndExpression: true,
  getNameAndExpressionFromElement: weakMapMemoizeInteractiveElementOutput(
    (element: Element) => {
      const { tableData } = element as TableElement;
      if (!tableData.variableName) return null;
      const expression = getTableNode(tableData);
      if (expression) {
        return { name: tableData.variableName, expression };
      }
      return null;
    }
  ),
};
