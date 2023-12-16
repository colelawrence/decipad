import { RequiresNotebookAction } from './types';
import { appendPath } from '../utils/appendPath';
import { insertNodes } from '@udecode/plate-common';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { getDefined } from '@decipad/utils';
import { getTableById } from './utils/getTablebyId';
import { getPlotParams } from './utils/getPlotParams';
import { plotParams as plotParamsSchema } from './schemas/plotParams';

extendZodWithOpenApi(z);

export const appendPlot: RequiresNotebookAction<'appendPlot'> = {
  summary: 'appends a plot (or graph) to the notebook',
  description:
    'plots or graphs can be cartesian or pie charts (plot type "arc"). Cartesian chart types can be bar, line, area, tick or point.',
  response: {
    schema: {
      ref: '#/components/schemas/CreateResult',
    },
  },
  returnsActionResultWithNotebookError: true,
  requiresNotebook: true,
  requiresRootEditor: false,
  parameterSchema: () =>
    z.object({
      tableId: z
        .string()
        .openapi({ description: 'the id of the source table for this plot' }),
      plotParams: plotParamsSchema().openapi({
        description: 'parameters for the plot',
      }),
    }),
  handler: (editor, { tableId, plotParams }) => {
    const [table] = getTableById(editor, tableId);

    const newPlot = getPlotParams(plotParams, table);
    insertNodes(editor, [newPlot], { at: appendPath(editor) });
    return {
      summary: `Added a new plot`,
      createdElementId: newPlot.id,
      createdElementType: getDefined(newPlot.type),
      createdElementName: getDefined(newPlot.title),
    };
  },
};
