import type { PlotElement } from '@decipad/editor-types';
import type { PlotParams } from '../../types';

export const getPartialPlotParams = (
  plotParams: Partial<PlotParams>
): Partial<PlotElement> => ({
  ...plotParams,
  markType: plotParams.plotType,
});
