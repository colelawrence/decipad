import { PlotSize } from '@decipad/editor-types';

export const calculateChartHeight = (size: PlotSize, chartHeight: number) => {
  switch (size) {
    case 'small':
      return chartHeight * 0.6;
    case 'medium':
      return chartHeight;
    case 'large':
      return chartHeight * 2;
  }
};
