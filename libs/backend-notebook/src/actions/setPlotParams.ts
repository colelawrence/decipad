import { ELEMENT_PLOT } from '@decipad/editor-types';
import { ActionParams, RequiresNotebookAction } from './types';
import { getElementById } from './utils/getElementById';
import { getPartialPlotParams } from './utils/getPartialPlotParams';
import { setNodes } from '@udecode/plate';

export const setPlotParams: RequiresNotebookAction<'setPlotParams'> = {
  summary: 'changes some of the parameters for a plot',
  parameters: [],
  responses: {
    '200': {
      description: 'OK',
    },
  },
  requiresNotebook: true,
  requestBody: {
    schema: {
      type: 'object',
      properties: {
        plotId: {
          description: 'the id of the plot element to change',
          type: 'string',
        },
        newPlotParams: {
          description:
            'the parameters to change on the plot. Only include those that need to change',
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
      required: ['plotId', 'plotParams'],
    },
  },
  validateParams: (params): params is ActionParams<'setPlotParams'> =>
    typeof params.plotId === 'string' &&
    params.newPlotParams != null &&
    typeof params.newPlotParams === 'object',
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
