import { PlotElement } from '@decipad/editor-types';
import { PlotParams } from '../../types';

export const getPartialPlotParams = (
  plotParams: Partial<PlotParams>
): Partial<PlotElement> => ({
  ...plotParams,
  markType: plotParams.plotType,
});
