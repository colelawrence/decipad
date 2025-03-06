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
    yAxisLabel: z.string().optional(),
    xAxisLabel: z.string().optional(),
    labelColumnName: z.string().optional(),
    sizeColumnName: z.string().optional(),
    orientation: z.string().optional(),
    barVariant: z.string().optional(),
    lineVariant: z.string().optional(),
    arcVariant: z.string().optional(),
    yColumnNames: z.array(z.string()).optional(),
    yColumnChartTypes: z.array(z.string()).optional(),
    grid: z.boolean().optional(),
    startFromZero: z.boolean().optional(),
    mirrorYAxis: z.boolean().optional(),
    flipTable: z.boolean().optional(),
    groupByX: z.boolean().optional(),
    showDataLabel: z.boolean().optional(),
    size: z.enum(['small', 'medium', 'large']).optional(),
  });
