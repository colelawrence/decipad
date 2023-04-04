import { AST, decilang, getExprRef, Program } from '@decipad/computer';
import {
  ELEMENT_DATA_MAPPING,
  ELEMENT_DATA_MAPPING_ROW,
} from '@decipad/editor-types';
import { assertElementType, astNode } from '@decipad/editor-utils';
import { getNodeString } from '@udecode/plate';
import { InteractiveLanguageElement } from '../types';
import { statementToIdentifiedBlock } from '../utils/statementToIdentifiedBlock';

interface ColumnDefWithId {
  id: string;
  tableColumnName: string;
  tableColumnAssign: AST.TableColumnAssign;
  tableColumn: AST.TableColumn;
}

/**
 * Uses `stripunit`, which is a language function that removes the
 * unit from an AST node.
 * @see misc-buildins.ts
 */
function addUnitToAst(
  node: AST.Expression,
  unit: AST.Expression | '%' | undefined
): AST.Expression {
  if (unit) {
    if (unit === '%') {
      // eslint-disable-next-line no-param-reassign
      node = astNode(
        'directive',
        'as',
        node,
        astNode('generic-identifier', '%')
      );
    } else {
      // eslint-disable-next-line no-param-reassign
      node = decilang<AST.Expression>`stripunit(${node}) ${unit}`;
    }
  }
  return node;
}

export const DataMapping: InteractiveLanguageElement = {
  type: ELEMENT_DATA_MAPPING,
  getParsedBlockFromElement: async (
    _editor,
    _computer,
    element
  ): Promise<Program> => {
    assertElementType(element, ELEMENT_DATA_MAPPING);

    if (!element.source) return [];

    const datasetName = getNodeString(element.children[0]);

    if (element.sourceType === 'notebook-var') {
      const varContent = decilang<AST.Expression>`${{
        name: getExprRef(element.source),
      }}`;
      const astMaybeUnit = addUnitToAst(varContent, element.unit);
      const newVar = decilang`${{ name: datasetName }} = ${astMaybeUnit}`;

      const block = statementToIdentifiedBlock(element.id, newVar, datasetName);
      return [block];
    }

    const columnReassign = element.children
      .slice(1)
      .map((col): ColumnDefWithId | undefined => {
        assertElementType(col, ELEMENT_DATA_MAPPING_ROW);
        if (!col.sourceColumn || !element.source) return undefined;

        let sourceColumn: AST.Expression | undefined;

        const dataSetColumnName = col.children[0].children[0].text;
        if (element.sourceType === 'notebook-table') {
          sourceColumn = astNode('ref', getExprRef(col.sourceColumn));
        }

        if (element.sourceType === 'live-connection') {
          sourceColumn = astNode(
            'property-access',
            astNode('ref', getExprRef(element.source)),
            astNode('colref', col.sourceColumn)
          );
        }
        if (!sourceColumn) return undefined;

        sourceColumn = addUnitToAst(sourceColumn, col.unit);

        return {
          id: col.id,
          tableColumnName: dataSetColumnName,
          tableColumnAssign: astNode(
            'table-column-assign',
            astNode('tablepartialdef', datasetName),
            astNode('coldef', dataSetColumnName),
            sourceColumn
          ),
          tableColumn: astNode(
            'table-column',
            astNode('coldef', dataSetColumnName),
            sourceColumn
          ),
        };
      })
      .filter((n): n is ColumnDefWithId => n !== undefined);

    const tableAst = astNode('table', astNode('tabledef', datasetName));
    const identifiedTable = statementToIdentifiedBlock(
      element.id,
      tableAst,
      datasetName
    );

    const identifiedColumns = columnReassign.map((c) =>
      statementToIdentifiedBlock(
        c.id,
        c.tableColumnAssign,
        datasetName,
        c.tableColumnName
      )
    );

    return [identifiedTable, ...identifiedColumns];
  },
};
