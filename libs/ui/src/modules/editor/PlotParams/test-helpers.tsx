import { noop } from '@decipad/utils';
import { ComponentProps } from 'react';
import { PlotParams } from './PlotParams';

const plotParamProps: Record<string, string> = {};

const setter = (prop: string) => (value: string) => {
  plotParamProps[prop] = value;
};

export const plotParams: ComponentProps<typeof PlotParams> = {
  sourceVarName: 'source var name',
  sourceVarNameOptions: [
    'source var name option 1',
    'source var name option 2',
  ],
  sourceExprRefOptions: ['123', '456'],
  columnNameOptions: ['column name option 1', 'column name option 2'],
  markType: 'line',
  xColumnName: 'x column name',
  sizeColumnName: 'size column name',
  colorScheme: 'monochrome_blue',
  setSourceVarName: setter('sourceVarName'),
  setMarkType: setter('markType'),
  setXColumnName: setter('xColumnName'),
  setSizeColumnName: setter('sizeColumnName'),
  setColorScheme: setter('colorScheme'),
  schema: 'jun-2024',
  yColumnNames: [],
  setYColumnNames: noop,
  setXAxisLabel: noop,
  setYAxisLabel: noop,
  yColumnChartTypes: [],
  setYColumnChartTypes: noop,
  columnTypeOptions: [],
  setArcVariant: setter('arcVariant'),
  arcVariant: 'simple',
  orientation: 'vertical',
  setOrientation: noop,
  barVariant: 'grouped',
  setBarVariant: noop,
  lineVariant: 'area',
  setLineVariant: noop,
  grid: true,
  setGrid: noop,
  showDataLabel: false,
  setShowDataLabel: noop,
  startFromZero: true,
  mirrorYAxis: false,
  flipTable: false,
  groupByX: true,
  setStartFromZero: noop,
  setGroupByX: noop,
  setLabelColumnName: noop,
  setFlipTable: noop,
  setMirrorYAxis: noop,
};
