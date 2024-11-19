import {
  type AST,
  type IdentifiedBlock,
  getExprRef,
  statementToIdentifiedBlock,
} from '@decipad/remote-computer';
import type { DataViewElement } from '@decipad/editor-types';
import { getAggregationById } from '@decipad/language-aggregations';
import { getColumnRef } from './getColumnRef';

export const generateAggregationDefs = (
  dataView: DataViewElement
): IdentifiedBlock[] => {
  const [, headerRow] = dataView.children;
  const aggregationsTableBlockId = `${dataView.id}-aggregations`;
  const aggregationEntriesPerColumn: [string, string][] =
    headerRow.children.flatMap((header, headerIndex) => {
      if (!header.aggregation) {
        return [];
      }
      const aggregation = getAggregationById(header.aggregation);
      if (!aggregation) {
        return [];
      }

      const columnRef = getColumnRef(header);
      return [[`${columnRef}_${headerIndex}`, aggregation.id]];
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
        ...aggregationEntriesPerColumn.map(
          ([columnName, aggId]): AST.TableColumn => ({
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
                    args: [{ type: 'literal', args: ['string', aggId] }],
                  },
                ],
              },
            ],
          })
        ),
      ],
    }
  );

  return [
    aggregationsTableBlock,
    // ...aggregationEntriesPerColumn.map((cfb) => cfb[2]),
  ];
};
