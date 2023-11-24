import { insertNodes } from '@udecode/plate-common';
import { z } from 'zod';
import { getDefined } from '@decipad/utils';
import { RequiresNotebookAction } from './types';
import { appendPath } from '../utils/appendPath';
import { getTableById } from './utils/getTablebyId';
import { getPlotParams } from './utils/getPlotParams';
import { plotParams as plotParamsSchema } from './schemas/plotParams';

export const appendPlot: RequiresNotebookAction<'appendPlot'> = {
  summary: 'appends a plot (or graph) to the notebook',
  description:
    'plots or graphs can be cartesian or pie charts (plot type "arc"). Cartesian chart types can be bar, line, area, tick or point.',
  parameters: {
    tableId: {
      description: 'the id of the source table for this plot',
      required: true,
      schema: {
        type: 'string',
      },
    },
    plotParams: {
      description: 'parameters for the plot',
      required: true,
      schema: {
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
  },
  response: {
    schemaName: 'CreateResult',
  },
  returnsActionResultWithNotebookError: true,
  requiresNotebook: true,
  parameterSchema: () =>
    z.object({
      tableId: z.string(),
      plotParams: plotParamsSchema(),
    }),
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
