import type { AST } from '@decipad/remote-computer';
import {
  getExprRef,
  statementToIdentifiedBlock,
} from '@decipad/remote-computer';
import type { DataViewElement } from '@decipad/editor-types';
import { N } from '@decipad/number';
import { getColumnRef } from './getColumnRef';

export const generateRoundingsTableDef = (dataView: DataViewElement) => {
  const { varName: sourceVarName } = dataView;
  const [, headerRow] = dataView.children;
  const roundingsTableBlockId = `${dataView.id}-roundings`;

  return statementToIdentifiedBlock(
    roundingsTableBlockId,
    {
      type: 'table',
      args: [
        {
          type: 'tabledef',
          args: [getExprRef(roundingsTableBlockId)],
        },
        ...headerRow.children.flatMap(
          (header, headerIndex): AST.TableColumn[] => {
            if (!header.rounding || !sourceVarName) {
              return [];
            }
            let rounding: number | string = parseInt(header.rounding, 10);
            if (isNaN(rounding)) {
              rounding = header.rounding;
            }
            const roundingArg: AST.Expression =
              typeof rounding === 'number'
                ? {
                    type: 'literal',
                    args: ['number', N(rounding)],
                  }
                : {
                    type: 'ref',
                    args: [rounding],
                  };
            const columnRef = getColumnRef(header);
            return [
              {
                type: 'table-column',
                args: [
                  {
                    type: 'coldef',
                    args: [`${columnRef}_${headerIndex}`],
                  },
                  {
                    type: 'column',
                    args: [
                      {
                        type: 'column-items',
                        args: [
                          {
                            type: 'function-definition',
                            args: [
                              { type: 'funcdef', args: [''] }, // lambda: empty function name
                              {
                                type: 'argument-names',
                                args: [{ type: 'def', args: ['columnValue'] }],
                              },
                              {
                                type: 'block',
                                id: `${roundingsTableBlockId}-${columnRef}`,
                                args: [
                                  {
                                    type: 'function-call',
                                    args: [
                                      // we always call the round(Column, precision) function, but the second argument varies according to the user's choice
                                      { type: 'funcref', args: ['round'] },
                                      {
                                        type: 'argument-list',
                                        args: [
                                          {
                                            type: 'ref',
                                            args: ['columnValue'],
                                          },
                                          roundingArg,
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ];
          }
        ),
      ],
    },
    true,
    [dataView.id]
  );
};
