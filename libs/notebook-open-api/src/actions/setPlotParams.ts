import { ELEMENT_PLOT } from '@decipad/editor-types';
import { setNodes } from '@udecode/plate-common';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { RequiresNotebookAction } from './types';
import { getElementById } from './utils/getElementById';
import { getPartialPlotParams } from './utils/getPartialPlotParams';
import { plotParams } from './schemas/plotParams';

extendZodWithOpenApi(z);

export const setPlotParams: RequiresNotebookAction<'setPlotParams'> = {
  summary: 'changes some of the parameters for a plot',
  returnsActionResultWithNotebookError: true,
  requiresNotebook: true,
  parameterSchema: () =>
    z.object({
      polotId: z
        .string()
        .openapi({ description: 'the id of the plot element to change' }),
      newPlotParams: plotParams().openapi({
        description:
          'the parameters to change on the plot. Only include those that need to change',
      }),
    }),
  handler: (editor, { plotId, newPlotParams }) => {
    const [plot, plotPath] = getElementById(editor, plotId, ELEMENT_PLOT);

    const updateParams = getPartialPlotParams(newPlotParams);
    const newPlot = {
      ...updateParams,
      markType: updateParams.markType ?? plot.markType,
    };
    setNodes(editor, newPlot, { at: plotPath });

    return {
      summary: `Changed plot params`,
    };
  },
};
