import {
  type AST,
  type IdentifiedBlock,
  getExprRef,
  statementToIdentifiedBlock,
  parseExpression,
} from '@decipad/remote-computer';
import { DataViewElement } from '@decipad/editor-types';
import { getAggregationById } from '@decipad/language-aggregations';
import { getColumnRef } from './getColumnRef';

const generateCustomFunctionName = (dataViewId: string, columnName: string) =>
  `${dataViewId}_${columnName}_function`;

export const generateAggregationDefs = (
  dataView: DataViewElement
): IdentifiedBlock[] => {
  const [, headerRow] = dataView.children;
  const aggregationsTableBlockId = `${dataView.id}-aggregations`;
  const customFunctionBlocksPerColumn: [string, string, IdentifiedBlock][] =
    headerRow.children.flatMap((header, headerIndex) => {
      if (!header.aggregation) {
        return [];
      }
      const aggregation = getAggregationById(header.aggregation);
      if (!aggregation) {
        return [];
      }
      const aggregationExpression = aggregation.expression('columnValue', {
        sum: `sum(totalColumnValue)`,
      });
      const parsedAggregationExpression = parseExpression(
        aggregationExpression
      );
      if (parsedAggregationExpression.error) {
        console.error(
          'Error parsing aggregation expression',
          aggregationExpression,
          parsedAggregationExpression.error
        );
        return [];
      }
      const columnRef = getColumnRef(header);
      const customFunctionBlockId = `${aggregationsTableBlockId}-${columnRef}-${headerIndex}-function`;
      const customFunctionName = generateCustomFunctionName(
        dataView.id,
        columnRef
      );
      return [
        [
          `${columnRef}_${headerIndex}`,
          customFunctionName,
          statementToIdentifiedBlock(
            customFunctionBlockId,
            {
              type: 'function-definition',
              args: [
                {
                  type: 'funcdef',
                  args: [customFunctionName],
                }, // lambda: empty function name
                {
                  type: 'argument-names',
                  args: [
                    { type: 'def', args: ['columnValue'] },
                    { type: 'def', args: ['totalColumnValue'] },
                  ],
                },
                {
                  type: 'block',
                  id: `${customFunctionBlockId}-body`,
                  args: [parsedAggregationExpression.solution],
                },
              ],
            },
            true,
            [dataView.id, dataView.varName ?? '']
          ),
        ],
      ];
    });
  const aggregationsTableBlock = statementToIdentifiedBlock(
    aggregationsTableBlockId,
    {
      type: 'table',
      args: [
        {
          type: 'tabledef',
          args: [getExprRef(aggregationsTableBlockId)],
        },
        ...customFunctionBlocksPerColumn.map(
          ([columnName, functionName]): AST.TableColumn => ({
            type: 'table-column',
            args: [
              {
                type: 'coldef',
                args: [columnName],
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
                            args: [
                              { type: 'def', args: ['columnValue'] },
                              { type: 'def', args: ['totalColumnValue'] },
                            ],
                          },
                          {
                            type: 'block',
                            id: `${aggregationsTableBlockId}-${columnName}`,
                            args: [
                              {
                                type: 'function-call',
                                args: [
                                  // we always call the round(Column, precision) function, but the second argument varies according to the user's choice
                                  { type: 'funcref', args: [functionName] },
                                  {
                                    type: 'argument-list',
                                    args: [
                                      { type: 'ref', args: ['columnValue'] },
                                      {
                                        type: 'ref',
                                        args: ['totalColumnValue'],
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
            ],
          })
        ),
      ],
    },
    true,
    [dataView.id]
  );

  return [
    aggregationsTableBlock,
    ...customFunctionBlocksPerColumn.map((cfb) => cfb[2]),
  ];
};
