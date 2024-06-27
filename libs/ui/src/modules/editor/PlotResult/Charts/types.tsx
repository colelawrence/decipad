import type {
  BasePlotProps,
  ChartColorSchemeKeys,
  PlotArcVariant,
  PlotBarVariant,
  PlotLineVariant,
  PlotOrientation,
} from '@decipad/editor-types';

export interface ChartProps extends BasePlotProps {
  readonly table: any[];
  readonly stackOffset?: 'expand' | 'none' | 'wiggle' | 'silhouette';
  readonly isExporting?: boolean;
  readonly colorScheme: ChartColorSchemeKeys; // required
}

export interface WithAxisLabels {
  readonly xAxisLabel?: string;
  readonly yAxisLabel?: string;
  readonly setXAxisLabel?: (label: string) => void;
  readonly setYAxisLabel?: (label: string) => void;
}
export interface PieChartProps
  extends WithAxisLabels,
    Pick<
      ChartProps,
      'table' | 'xColumnName' | 'yColumnNames' | 'colorScheme' | 'isExporting'
    > {
  readonly arcVariant?: PlotArcVariant;
  readonly showDataLabel?: boolean;
}

export interface RadarChartProps
  extends Pick<
    ChartProps,
    'table' | 'xColumnName' | 'yColumnNames' | 'colorScheme' | 'isExporting'
  > {
  readonly grid?: boolean;
}

export interface AreaChartProps
  extends WithAxisLabels,
    Pick<
      ChartProps,
      | 'table'
      | 'xColumnName'
      | 'yColumnNames'
      | 'colorScheme'
      | 'stackOffset'
      | 'lineVariant'
      | 'isExporting'
    > {
  readonly orientation?: PlotOrientation;
  readonly grid?: boolean;
  readonly startFromZero?: boolean;
  readonly showDataLabel?: boolean;
}

export interface ScatterChartProps
  extends WithAxisLabels,
    Pick<
      ChartProps,
      | 'table'
      | 'xColumnName'
      | 'yColumnNames'
      | 'colorScheme'
      | 'sizeColumnName'
      | 'isExporting'
    > {
  readonly orientation?: PlotOrientation;
  readonly grid?: boolean;
  readonly isExporting?: boolean;
  readonly startFromZero?: boolean;
  readonly showDataLabel?: boolean;
  readonly labelColumnName?: string;
}
export interface LineChartProps
  extends WithAxisLabels,
    Pick<
      ChartProps,
      'table' | 'xColumnName' | 'yColumnNames' | 'colorScheme' | 'isExporting'
    > {
  readonly lineVariant?: PlotLineVariant;
  readonly orientation?: PlotOrientation;
  readonly grid?: boolean;
  readonly startFromZero?: boolean;
  readonly showDataLabel?: boolean;
}

export interface BarChartProps
  extends WithAxisLabels,
    Pick<
      ChartProps,
      'table' | 'xColumnName' | 'yColumnNames' | 'colorScheme' | 'isExporting'
    > {
  readonly barVariant?: PlotBarVariant;
  readonly orientation?: PlotOrientation;
  readonly grid?: boolean;
  readonly startFromZero?: boolean;
  readonly showDataLabel?: boolean;
}

export interface ComboChartProps
  extends WithAxisLabels,
    Pick<
      ChartProps,
      'table' | 'xColumnName' | 'yColumnNames' | 'colorScheme' | 'isExporting'
    > {
  readonly yColumnChartType?: string[];
  readonly orientation?: 'horizontal' | 'vertical';
  readonly grid?: boolean;
  readonly startFromZero?: boolean;
  readonly showDataLabel?: boolean;
}

export interface BarLabelProps {
  readonly orientation: PlotOrientation;
  readonly barVariant: PlotBarVariant;
  readonly referenceValue: number;
}

export interface FunnelChartProps
  extends Pick<
    ChartProps,
    'table' | 'xColumnName' | 'yColumnNames' | 'colorScheme' | 'isExporting'
  > {
  readonly orientation?: PlotOrientation;
  readonly mirrorYAxis?: boolean;
  readonly grid?: boolean;
  readonly showDataLabel?: boolean;
}
