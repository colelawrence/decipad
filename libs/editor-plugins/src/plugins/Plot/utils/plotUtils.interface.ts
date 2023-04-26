import { PlotElement } from '@decipad/editor-types';

export interface LegendConfig {
  direction: 'horizontal' | 'vertical';
  orient:
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'none';
}

export interface PlotConfig {
  legend?: LegendConfig;
  autosize?: 'fit' | 'pad' | 'none';
  encoding?: {
    color?: {
      scheme?: string;
      legend?: unknown;
      field?: string;
    };
  };
  style?: {
    cell?: {
      stroke?: string;
    };
  };
  symbol?: {
    stroke?: string;
    fill?: string;
  };
  axis?: Axis;
  mark?: {
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
    interpolate?: Interpolate;
  };
}

export interface PlotSpec {
  mark: {
    type: PlotElement['markType'];
    tooltip: boolean;
    cornerRadiusEnd?: number;
    interpolate?: Interpolate;
    theta?: number;
    innerRadius?: number;
    point?: Point;
  };
  encoding: Record<EncodingKey, EncodingSpec>;
  config?: PlotConfig;
}

export type DisplayType = 'quantitative' | 'temporal' | 'ordinal' | 'nominal';

export type Interpolate =
  | 'linear'
  | 'linear-closed'
  | 'step'
  | 'basis'
  | 'basis-open'
  | 'basis-closed'
  | 'cardinal'
  | 'natural'
  | 'cardinal-closed'
  | 'bundle'
  | 'cardinal';

export type Point =
  | boolean
  | {
      filled?: boolean;
      fill?: string;
      size?: number;
      strokeWidth?: number;
    };

export type AllowedPlotValue = string | boolean | number | Date;

export type Row = Record<string, AllowedPlotValue>;

export type PlotData = {
  table: Row[];
};

export type TimeUnit =
  | 'utcyear'
  | 'utcquarter'
  | 'utcyearmonth'
  | 'utcyearmonthdate'
  | 'utcyearmonthdatehours'
  | 'utcyearmonthdatehoursminutes'
  | 'utcyearmonthdatehoursminutesseconds';

export type Axis =
  | undefined
  | {
      grid?: boolean;
      gridDash?: number[];
      gridColor?: string;
      labelAngle?: number;
      labelOverlap?: string | boolean;
      labelBaseline?: string;
      labelAlign?: string;
      labelColor?: string;
      labelFontSize?: number;
      labelFontWeight?: number;
      labelBound?: boolean;
      tickColor?: string;
      titleColor?: string;
      domainColor?: string;
      domainOpacity?: number;
      label?: number;
      tickSize?: number;
      offset?: number;
    };

export type FieldType = string | { repeat: string };

export type EncodingSpec =
  | undefined
  | {
      field?: FieldType;
      type?: DisplayType;
      sort?: null;
      timeUnit?: TimeUnit;
      title?: string;
      scale?: {
        scheme?: string;
        range?: Array<string>;
        domain?: [number, number];
        domainMin?: number;
        domainMax?: number;
      };
      datum?: unknown;
      aggregate?: string;
      axis?: Axis;
      legend?: null | undefined;
    };
export type EncodingKey =
  | 'x'
  | 'y'
  | 'size'
  | 'color'
  | 'theta'
  | 'y2'
  | 'xOffset'
  | 'column'
  | 'aggregate'
  | 'datum';

export const comparableChartTypes = [
  'bar',
  'line',
  'point',
  'area',
  'circle',
  'square',
  'tick',
];
