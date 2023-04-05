import {
  Computer,
  convertToMultiplierUnit,
  Result,
  SerializedType,
} from '@decipad/computer';
import { PlotElement } from '@decipad/editor-types';
import DeciNumber from '@decipad/number';
import { cssVarHex } from '@decipad/ui';
import { ResultTable } from 'libs/language/src/interpreter/interpreter-types';

export type DisplayProps = {
  sourceVarName: string;
  markType: PlotElement['markType'];
  xColumnName: string;
  yColumnName: string;
  sizeColumnName: string;
  colorColumnName: string;
  thetaColumnName: string;
  colorScheme?: string;
};

interface LegendConfig {
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

interface PlotConfig {
  legend?: LegendConfig;
  autosize?: 'fit' | 'pad' | 'none';
  encoding?: {
    color?: {
      scheme?: string;
      legend?: unknown;
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
    interpolate: Interpolate;
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
  };
}

type DisplayType = 'quantitative' | 'temporal' | 'ordinal' | 'nominal';

type Interpolate =
  | 'linear'
  | 'linear-closed'
  | 'step'
  | 'basis'
  | 'basis-open'
  | 'basis-closed'
  | 'cardinal'
  | 'cardinal-closed'
  | 'bundle';

type Point =
  | boolean
  | {
      filled?: boolean;
      fill?: string;
      size?: number;
      strokeWidth?: number;
    };

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
  data: { name: 'table' };
  encoding: Record<EncodingKey, EncodingSpec>;
  config?: PlotConfig;
}

export type AllowedPlotValue = string | boolean | number | Date;

export type Row = Record<string, AllowedPlotValue>;

export type PlotData = {
  table: Row[];
};

type TimeUnit =
  | 'utcyear'
  | 'utcquarter'
  | 'utcyearmonth'
  | 'utcyearmonthdate'
  | 'utcyearmonthdatehours'
  | 'utcyearmonthdatehoursminutes'
  | 'utcyearmonthdatehoursminutesseconds';

type Axis =
  | undefined
  | {
      offset?: number;
      grid?: boolean;
      gridDash?: number[];
      gridColor?: string;
      labelAngle?: number;
      labelBaseline?: string;
      labelAlign?: string;
      labelColor?: string;
      labelFontSize?: number;
      labelFontWeight?: number;
      labelBound?: boolean;
      titleColor?: string;
      domainColor?: string;
      domainOpacity?: number;
      label?: number;
      tickSize?: number;
    };

type EncodingSpec =
  | undefined
  | {
      field: string;
      type: DisplayType;
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
      axis?: Axis;
      legend?: null | undefined;
    };
type EncodingKey = 'x' | 'y' | 'size' | 'color' | 'theta';

const displayPropsToEncoding: Record<string, EncodingKey> = {
  xColumnName: 'x',
  yColumnName: 'y',
  sizeColumnName: 'size',
  colorColumnName: 'color',
  thetaColumnName: 'theta',
};

const hasGrid: Record<EncodingKey, boolean> = {
  x: false,
  y: true,
  size: false,
  color: false,
  theta: false,
};

const relevantDataDisplayProps: Array<keyof DisplayProps> = Object.keys(
  displayPropsToEncoding
) as Array<keyof DisplayProps>;

const markTypeToFill = (
  markType: DisplayProps['markType']
): string | undefined => {
  switch (markType) {
    case 'bar':
    case 'area':
    case 'point':
      return cssVarHex('chartThemeMonochromeBlue5');
    case 'circle':
    case 'square':
      return 'white';
    default:
      return undefined;
  }
};

export function encodingTypeForColumnType(type: SerializedType): DisplayType {
  switch (type.kind) {
    case 'date':
      return 'temporal';
    case 'string':
      return 'nominal';
    default:
      return 'quantitative';
  }
}

function relevantColumnNames(displayProps: DisplayProps): string[] {
  return [
    displayProps.xColumnName,
    displayProps.yColumnName,
    displayProps.sizeColumnName,
    displayProps.colorColumnName,
    displayProps.thetaColumnName,
  ].filter(Boolean);
}

function displayTimeUnitType(type: SerializedType): TimeUnit {
  if (type.kind !== 'date') {
    throw new Error('expected column to be of date type');
  }
  switch (type.date) {
    case 'year': {
      return 'utcyear';
    }
    case 'quarter':
      return 'utcquarter';
    case 'month': {
      return 'utcyearmonth';
    }
    case 'day': {
      return 'utcyearmonthdate';
    }
    case 'hour': {
      return 'utcyearmonthdatehours';
    }
    case 'minute': {
      return 'utcyearmonthdatehoursminutes';
    }
    case 'second':
    case 'millisecond': {
      return 'utcyearmonthdatehoursminutesseconds';
    }
  }
}

export function encodingFor(
  _computer: Computer,
  columnName: string,
  columnType: SerializedType,
  grid: boolean,
  markType: PlotElement['markType']
): EncodingSpec {
  const type = encodingTypeForColumnType(columnType);
  const spec: EncodingSpec = {
    field: columnName,
    type,
    title: '',
    timeUnit:
      columnType.kind === 'date' ? displayTimeUnitType(columnType) : undefined,
    axis: {
      grid,
    },
    legend: markType !== 'arc' ? null : undefined,
  };

  if (type === 'nominal') {
    // remove sort
    spec.sort = null;
  }
  return spec;
}

export function specFromType(
  computer: Computer,
  type: undefined | SerializedType,
  displayProps: DisplayProps
): undefined | PlotSpec {
  if (!displayProps.markType || !type || type.kind !== 'table') {
    return;
  }
  const columnNames = relevantColumnNames(displayProps);
  const columnIndexes = columnNames.map((name) =>
    type.columnNames.indexOf(name)
  );
  const columnTypes = columnIndexes.map(
    (index) => (index >= 0 && type.columnTypes[index]) || undefined
  );

  const encoding = relevantDataDisplayProps.reduce(
    (encodings, specPropName) => {
      const columnName = displayProps[specPropName];
      if (!columnName) {
        return encodings;
      }
      const columnIndex = columnNames.indexOf(columnName);
      const columnType = columnTypes[columnIndex];
      if (columnType) {
        const channelKey = displayPropsToEncoding[specPropName];
        // eslint-disable-next-line no-param-reassign
        encodings[channelKey] = encodingFor(
          computer,
          columnName,
          columnType,
          hasGrid[channelKey],
          displayProps.markType
        );
      }

      return encodings;
    },
    {} as Record<EncodingKey, EncodingSpec>
  );

  if (encoding.color && !encoding.color.scale) {
    encoding.color.scale = {
      scheme: displayProps.colorScheme,
    };
  }
  if (encoding.y && encoding.y.axis) {
    encoding.y.axis.labelAngle = 0;
    encoding.y.axis.labelBaseline = 'line-bottom';
    encoding.y.axis.labelAlign = 'left';
    encoding.y.axis.labelColor = cssVarHex('weakerTextColor');
  }
  if (encoding.x && encoding.x.axis) {
    encoding.x.axis.labelColor = cssVarHex('weakerTextColor');
    encoding.x.axis.labelAngle = 0;
    encoding.x.axis.offset = 5;
    encoding.x.axis.labelFontWeight = 700;
  }
  if (displayProps.markType !== 'bar' && displayProps.markType !== 'arc') {
    encoding.color = undefined;
  }

  const markProps =
    displayProps.markType === 'bar' ? { width: { band: 0.8 } } : {};

  return {
    mark: { type: displayProps.markType, tooltip: true, ...markProps },
    data: { name: 'table' },
    encoding,
    config: {
      encoding: {
        color: {
          scheme: displayProps.colorScheme || 'deciblues',
        },
      },
      symbol: {
        stroke: cssVarHex('chartThemeMonochromeBlue5'),
        fill: '0xfff',
      },
      mark: {
        interpolate: 'cardinal',
        stroke:
          displayProps.markType !== 'arc' && !encoding.color
            ? cssVarHex('chartThemeMonochromeBlue5')
            : undefined,
        fill: markTypeToFill(displayProps.markType),
        strokeWidth: 3,
      },
      axis: {
        gridColor: cssVarHex('highlightColor'),
        labelColor: cssVarHex('weakTextColor'),
        domainOpacity: 0,
        labelAngle: -45,
        labelBound: true,
        tickSize: 0,
      },
      autosize: 'fit',
    },
  };
}

function toPlotColumn(
  type: SerializedType,
  column: Array<Result.OneResult>
): Array<AllowedPlotValue> {
  if (!column || !column.length) {
    return column as Array<AllowedPlotValue>;
  }
  if (type.kind === 'number') {
    return (column as Array<DeciNumber>).map((f) =>
      convertToMultiplierUnit(f, type.unit).valueOf()
    );
  }
  if (type.kind === 'date') {
    return (column as Array<bigint>).map((d) => new Date(Number(d)));
  }
  return column as Array<AllowedPlotValue>;
}

function makeWide(
  table: Record<string, Array<AllowedPlotValue>>
): Array<Record<string, AllowedPlotValue>> {
  const rows: Array<Array<[string, AllowedPlotValue]>> = [];
  let first = true;
  for (const [key, values] of Object.entries(table)) {
    if (!key || !values) {
      continue;
    }
    // eslint-disable-next-line no-loop-func
    values.forEach((value, index) => {
      if (first) {
        rows.push([[key, value]]);
      } else {
        const row = rows[index];
        row.push([key, value]);
      }
    });
    first = false;
  }
  return rows.map((row) => Object.fromEntries(row));
}

export function resultToPlotResultData(
  result: undefined | Result.Result,
  displayProps: DisplayProps
): undefined | PlotData {
  if (!result || result.type.kind !== 'table') {
    return;
  }
  const type = result?.type;
  if (!type || type.kind !== 'table') {
    return undefined;
  }
  const value = result?.value;
  if (!value) {
    return;
  }
  const tableValue = value as ResultTable;
  const columnNames = relevantColumnNames(displayProps);
  const columnsTypesAndResults: Array<[SerializedType, Result.OneResult[]]> =
    columnNames.map((columnName): [SerializedType, Result.OneResult[]] => {
      const index = type.columnNames.indexOf(columnName);
      return [type.columnTypes[index], tableValue[index]];
    });
  const returnValue: Record<string, Array<AllowedPlotValue>> = {};
  columnNames.forEach((columnName, index) => {
    const [columnType, values] = columnsTypesAndResults[index];
    returnValue[columnName] = toPlotColumn(columnType, values);
  });
  return { table: makeWide(returnValue) };
}

function findWideDataDomain(key: string, data: Row[]): [number, number] | void {
  let min = Infinity;
  let max = -Infinity;

  for (const row of data) {
    const value = row[key];
    if (value) {
      if (typeof value === 'number') {
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      }
    }
  }

  if (Number.isFinite(min) && Number.isFinite(max)) {
    const range = max - min;
    return [Math.min(min, 0), Math.ceil(max + range / 10)];
  }
}

export function enhanceSpecFromWideData(
  spec: PlotSpec,
  data: PlotData
): PlotSpec {
  if (spec.mark.type !== 'arc') {
    for (const encValue of Object.values(spec?.encoding)) {
      if (encValue) {
        const { field } = encValue;
        const domain = findWideDataDomain(field, data.table);
        if (domain) {
          if (!encValue.scale) {
            encValue.scale = {};
          }
          encValue.scale.domain = domain;
        }
      }
    }
  }

  return spec;
}
