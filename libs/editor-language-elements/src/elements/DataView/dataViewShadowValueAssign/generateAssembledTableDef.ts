import {
  type IdentifiedBlock,
  getExprRef,
  statementToIdentifiedBlock,
} from '@decipad/remote-computer';
import { type DataViewElement } from '@decipad/editor-types';
import { getColumnRef } from './getColumnRef';
import { isElement } from '@udecode/plate-common';

export const generateAssembledTableDef = (
  dataView: DataViewElement
): IdentifiedBlock[] => {
  const { varName: sourceVarName } = dataView;
  const [, headerRow] = dataView.children;
  const assembledTableBlockId = `${dataView.id}-assembledTable`;
  const tableName = getExprRef(assembledTableBlockId);
  const emptyTable = statementToIdentifiedBlock(assembledTableBlockId, {
    type: 'table',
    args: [
      {
        type: 'tabledef',
        args: [tableName],
      },
    ],
  });

  const columnDefs = headerRow.children
    .filter(isElement)
    .flatMap((header, headerIndex) => {
      const columnRef = getColumnRef(header);
      return statementToIdentifiedBlock(
        `${assembledTableBlockId}-column-${headerIndex}`,
        {
          type: 'table-column-assign',
          args: [
            {
              type: 'tablepartialdef',
              args: [tableName],
            },
            {
              type: 'coldef',
              args: [`${columnRef}_${headerIndex}`],
            },
            sourceVarName
              ? {
                  type: 'property-access',
                  args: [
                    {
                      type: 'ref',
                      args: [getExprRef(sourceVarName)],
                    },
                    {
                      type: 'colref',
                      args: [columnRef],
                    },
                  ],
                }
              : {
                  type: 'noop',
                  args: [],
                },
            headerIndex,
          ],
        }
      );
    });

  return [emptyTable, ...columnDefs];
};
