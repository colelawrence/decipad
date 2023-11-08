import { ActionParams, RequiresNotebookAction } from './types';
import { appendPath } from '../utils/appendPath';
import { insertNodes } from '@udecode/plate';
import { getTableById } from './utils/getTablebyId';
import { getDefined } from '@decipad/utils';
import { getPlotParams } from './utils/getPlotParams';

export const appendPlot: RequiresNotebookAction<'appendPlot'> = {
  summary: 'appends a plot (or graph) to the notebook',
  description:
    'plots or graphs can be cartesian or pie charts (plot type "arc"). Cartesian chart types can be bar, line, area, tick or point.',
  parameters: [],
  responses: {
    '200': {
      description: 'OK',
      schemaName: 'CreateResult',
    },
  },
  requiresNotebook: true,
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        tableId: {
          description: 'the id of the source table for this plot',
          type: 'string',
        },
        plotParams: {
          description: 'parameters for the plot',
          type: 'object',
          properties: {
            plotType: {
              type: 'string',
              enum: [
                'bar',
                'circle',
                'square',
                'tick',
                'line',
                'area',
                'point',
                'arc',
              ],
            },
            xColumnName: {
              type: 'string',
            },
            yColumnName: {
              type: 'string',
            },
            sizeColumnName: {
              type: 'string',
            },
            colorColumnName: {
              type: 'string',
            },
            thetaColumnName: {
              type: 'string',
            },
            y2ColumnName: {
              type: 'string',
            },
          },
        },
      },
      required: ['tableId', 'plotParams'],
    },
  },
  validateParams: (params): params is ActionParams<'appendPlot'> =>
    typeof params.tableId === 'string' &&
    params.plotParams != null &&
    typeof params.plotParams === 'object',
  handler: (editor, { tableId, plotParams }) => {
    const [table] = getTableById(editor, tableId);

    const newPlot = getPlotParams(plotParams, table);
    insertNodes(editor, [newPlot], { at: appendPath(editor) });
    return {
      createdElementId: newPlot.id,
      createdElementType: getDefined(newPlot.type),
      createdElementName: getDefined(newPlot.title),
    };
  },
};
