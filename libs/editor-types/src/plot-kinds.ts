import { SerializedType } from '@decipad/language-interfaces';
import { BasePlotProps } from '.';

export const ChartColorSchemeKeysArr = [
  'monochrome_purple',
  'monochrome_red',
  'monochrome_gray',
  'monochrome_yellow',
  'monochrome_blue',
  'monochrome_brand',
  'monochrome_orange',
  'monochrome_teal',
  'multicolor_purple',
  'multicolor_red',
  'multicolor_gray',
  'multicolor_yellow',
  'multicolor_blue',
  'multicolor_green',
  'multicolor_orange',
] as const;

export type ChartColorSchemeKeys = typeof ChartColorSchemeKeysArr[number];

export const PlotDefaultColorScheme: ChartColorSchemeKeys = 'monochrome_gray';

export type PlotOrientation = 'vertical' | 'horizontal';
export type PlotBarVariant = 'grouped' | 'stacked' | 'stacked100';
export type PlotLineVariant = 'simple' | 'area' | 'area100';
export type PlotArcVariant = 'simple' | 'donut';

export type PlotParams = BasePlotProps & {
  readonly sourceVarNameOptions: string[];
  readonly sourceExprRefOptions: string[];
  columnNameOptions: string[];
  columnTypeOptions: SerializedType[];
  readonly setSourceVarName: (value: string) => void;
  readonly setMarkType: (value: string) => void;
  readonly setXColumnName: (value: string) => void;
  readonly setXAxisLabel: (value: string) => void;
  readonly setYAxisLabel: (value: string) => void;
  readonly setSizeColumnName: (value: string) => void;
  readonly setColorScheme: (value: string) => void;
  readonly setYColumnNames: (columnNames: string[]) => void;
  readonly setYColumnChartTypes: (columnNames: string[]) => void;
  readonly setOrientation: (orientation: PlotOrientation) => void;
  readonly setBarVariant: (variant: PlotBarVariant) => void;
  readonly setLineVariant: (variant: PlotLineVariant) => void;
  readonly setArcVariant: (variant: PlotArcVariant) => void;
  readonly setGrid: (grid: boolean) => void;
  readonly setShowDataLabel: (show: boolean) => void;
  readonly setStartFromZero: (start: boolean) => void;
  readonly setFlipTable: (flip: boolean) => void;
  readonly setMirrorYAxis: (mirror: boolean) => void;
  readonly setGroupByX: (group: boolean) => void;
  readonly setLabelColumnName: (value: string) => void;
};

export const defaultPlotParams: Pick<
  BasePlotProps,
  | 'barVariant'
  | 'lineVariant'
  | 'arcVariant'
  | 'grid'
  | 'showDataLabel'
  | 'startFromZero'
  | 'groupByX'
  | 'orientation'
  | 'colorScheme'
  | 'mirrorYAxis'
  | 'flipTable'
> = {
  barVariant: 'grouped',
  lineVariant: 'simple',
  arcVariant: 'simple',
  orientation: 'horizontal',
  grid: true,
  startFromZero: true,
  mirrorYAxis: false,
  flipTable: false,
  showDataLabel: false,
  groupByX: false,
  colorScheme: PlotDefaultColorScheme,
};

export const markTypes = [
  'line',
  'bar',
  'arc',
  'combo',
  'area',
  'point',
  'funnel',
  'radar',
  //  'cohort',
] as const;

export const markTypesThatCanFlip = ['arc', 'radar'];

export type MarkType = typeof markTypes[number];
export type AcceptableChartShapesForCombo = 'bar' | 'line';
