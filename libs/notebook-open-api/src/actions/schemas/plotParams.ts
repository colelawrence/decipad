import { z } from 'zod';

export const plotParams = () =>
  z.object({
    plotType: z.enum([
      'bar',
      'circle',
      'square',
      'tick',
      'line',
      'area',
      'point',
      'arc',
    ]),
    xColumnName: z.string().optional(),
    yColumnName: z.string().optional(),
    sizeColumnName: z.string().optional(),
    colorColumnName: z.string().optional(),
    thetaColumnName: z.string().optional(),
    y2ColumnName: z.string().optional(),
  });
