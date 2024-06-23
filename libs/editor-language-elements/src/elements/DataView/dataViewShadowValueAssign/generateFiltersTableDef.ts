import type { AST } from '@decipad/language-interfaces';
import {
  getExprRef,
  statementToIdentifiedBlock,
  parseExpression,
} from '@decipad/remote-computer';
import type { DataViewElement } from '@decipad/editor-types';
import { getFilterExpression } from '@decipad/language-filters';
import { getColumnRef } from './getColumnRef';

export const generateFiltersTableDef = (dataView: DataViewElement) => {
  const { varName: sourceVarName } = dataView;
  const [, headerRow] = dataView.children;
  const filtersTableBlockId = `${dataView.id}-filters`;

  return statementToIdentifiedBlock(filtersTableBlockId, {
    type: 'table',
    args: [
      {
        type: 'tabledef',
        args: [getExprRef(filtersTableBlockId)],
      },
      ...headerRow.children.flatMap(
        (header, headerIndex): AST.TableColumn[] => {
          if (!header.filter || !sourceVarName) {
            return [];
          }
          const {
            filter: { operation, valueOrValues },
          } = header;

          const filterExpression = getFilterExpression(
            operation,
            `columnValue`,
            valueOrValues,
            header.cellType
          );
          if (!filterExpression) {
            return [];
          }
          const parsedFilterExpression = parseExpression(filterExpression);
          if (parsedFilterExpression.error) {
            console.error(
              `Error parsing aggregation expression "${filterExpression}"`,
              parsedFilterExpression,
              parsedFilterExpression.error
            );
            return [];
          }

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
                              id: `${filtersTableBlockId}-${columnRef}-${headerIndex}`,
                              args: [parsedFilterExpression.solution],
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
  });
};
