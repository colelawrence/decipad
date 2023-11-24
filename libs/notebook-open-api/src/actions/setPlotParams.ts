import { ELEMENT_PLOT } from '@decipad/editor-types';
import { setNodes } from '@udecode/plate-common';
import { z } from 'zod';
import { RequiresNotebookAction } from './types';
import { getElementById } from './utils/getElementById';
import { getPartialPlotParams } from './utils/getPartialPlotParams';
import { plotParams } from './schemas/plotParams';

export const setPlotParams: RequiresNotebookAction<'setPlotParams'> = {
  summary: 'changes some of the parameters for a plot',
  parameters: {
    plotId: {
      description: 'the id of the plot element to change',
      required: true,
      schema: {
        type: 'string',
      },
    },
    newPlotParams: {
      description:
        'the parameters to change on the plot. Only include those that need to change',
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
  returnsActionResultWithNotebookError: true,
  requiresNotebook: true,
  parameterSchema: () =>
    z.object({
      polotId: z.string(),
      newPlotParams: plotParams(),
    }),
  handler: (editor, { plotId, newPlotParams }) => {
    const [plot, plotPath] = getElementById(editor, plotId, ELEMENT_PLOT);

    const updateParams = getPartialPlotParams(newPlotParams);
    const newPlot = {
      ...updateParams,
      markType: updateParams.markType ?? plot.markType,
    };
    setNodes(editor, newPlot, { at: plotPath });
  },
};
