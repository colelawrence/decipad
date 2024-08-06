import { getNodeString } from '@udecode/plate-common';
import type { TableHeaderElement } from '@decipad/editor-types';
import { ELEMENT_TABLE } from '@decipad/editor-types';
import type { Program, Computer } from '@decipad/computer-interfaces';
import type { AST } from '@decipad/language-interfaces';
import {
  statementToIdentifiedBlock,
  getExprRef,
} from '@decipad/remote-computer';
import { assertElementType } from '@decipad/editor-utils';
import type { InteractiveLanguageElement } from '../../types';
import { headerToColumn } from './headerToColumn';
import { parseElementAsVariableAssignment } from '../../utils/parseElementAsVariableAssignment';
import { inferType } from '@decipad/parse';

export const Table: InteractiveLanguageElement = {
  type: ELEMENT_TABLE,
  getParsedBlockFromElement: async (
    _editor,
    computer,
    table
  ): Promise<Program> => {
    assertElementType(table, ELEMENT_TABLE);

    const [caption, headerRow, ...dataRows] = table.children;
    const tableName = getNodeString(caption.children[0]);
    const rowCount = dataRows.length;

    const tableItself = statementToIdentifiedBlock(table.id ?? '', {
      type: 'table',
      args: [{ type: 'tabledef', args: [tableName, rowCount] }],
    } as AST.Table);

    const columnAssigns: Program = [];
    const categoriesAssigns: Program = [];
    const categoriesAssignsPromises: Array<Promise<Program>> = [];

    for (const [columnIndex, th] of headerRow.children.entries()) {
      const { columnName, errors, elementId, expression } =
        // eslint-disable-next-line no-await-in-loop
        await headerToColumn({
          computer,
          th,
          columnIndex,
          tableName,
          table,
          dataRows,
        });

      if (expression) {
        const columnAssign: AST.TableColumnAssign = {
          type: 'table-column-assign',
          args: [
            { type: 'tablepartialdef', args: [tableName] },
            { type: 'coldef', args: [columnName] },
            expression,
            columnIndex,
            rowCount,
          ],
        };

        columnAssigns.push(
          statementToIdentifiedBlock(elementId, columnAssign),
          ...errors
        );
      } else {
        columnAssigns.push(...errors);
      }
      if (th.cellType.kind === 'category') {
        categoriesAssignsPromises.push(parseCategoryOptions(computer, th));
      }
    }
    categoriesAssigns.push(
      ...(await Promise.all(categoriesAssignsPromises)).flat()
    );

    return [tableItself, ...columnAssigns, ...categoriesAssigns];
  },
};

async function parseCategoryOptions(
  computer: Computer,
  element: TableHeaderElement
) {
  const dropdownOptions = await Promise.all(
    element.categoryValues?.map(async (option) => {
      let dropdownExpression: string | AST.Expression;
      const dropdownType = await inferType(computer, option.value, {
        type: {
          kind: 'string',
        },
      });
      if (
        dropdownType.type.kind === 'anything' ||
        dropdownType.type.kind === 'nothing'
      ) {
        dropdownExpression = {
          type: 'noop',
          args: [],
        };
      } else {
        dropdownExpression = dropdownType.coerced!;
      }
      return parseElementAsVariableAssignment(
        option.id,
        getExprRef(option.id),
        dropdownExpression,
        true, // isArtificial
        [element.id ?? ''] // origin block id
      );
    }) ?? []
  );

  return dropdownOptions.flat();
}
