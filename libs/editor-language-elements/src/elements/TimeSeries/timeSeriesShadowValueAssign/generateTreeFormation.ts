import { type TimeSeriesElement } from '@decipad/editor-types';
import {
  shadowExprRef,
  statementToIdentifiedBlock,
} from '@decipad/remote-computer';

export const generateTreeFormation = (
  timeSeries: TimeSeriesElement,
  assembledTableRef: string,
  filtersTableRef: string,
  roundingsTableRef: string,
  aggregationsTableRef: string
) =>
  statementToIdentifiedBlock(`${timeSeries.id}_shadow`, {
    type: 'assign',
    args: [
      {
        type: 'def',
        args: [shadowExprRef(timeSeries.id ?? '')],
      },
      {
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: ['tree'],
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'ref',
                args: [assembledTableRef],
              },
              {
                type: 'ref',
                args: [filtersTableRef],
              },
              {
                type: 'ref',
                args: [roundingsTableRef],
              },
              {
                type: 'ref',
                args: [aggregationsTableRef],
              },
            ],
          },
        ],
      },
    ],
  });
