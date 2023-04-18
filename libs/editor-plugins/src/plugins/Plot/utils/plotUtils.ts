import {
  Computer,
  convertToMultiplierUnit,
  Result,
  SerializedType,
} from '@decipad/computer';
import { PlotElement } from '@decipad/editor-types';
import { formatResult } from '@decipad/format';
import DeciNumber from '@decipad/number';
import { cssVarHex } from '@decipad/ui';
import { ResultTable } from 'libs/language/src/interpreter/interpreter-types';
import {
  AllowedPlotValue,
  comparableChartTypes,
  DisplayType,
  EncodingKey,
  EncodingSpec,
  FieldType,
  PlotData,
  PlotSpec,
  Row,
  TimeUnit,
} from './plotUtils.interface';

export type DisplayProps = {
  sourceVarName: string;
  markType: PlotElement['markType'];
  xColumnName: string;
  yColumnName: string;
  sizeColumnName: string;
  colorColumnName: string;
  thetaColumnName: string;
  y2ColumnName: string;
  colorScheme?: string;
};

const displayPropsToEncoding: Record<string, EncodingKey> = {
  xColumnName: 'x',
  yColumnName: 'y',
  sizeColumnName: 'size',
  colorColumnName: 'color',
  thetaColumnName: 'theta',
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
    displayProps.y2ColumnName,
  ].filter(Boolean);
}

function displayTimeUnitType(type: SerializedType): TimeUnit | undefined {
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
  return undefined;
}

export function encodingFor(
  _computer: Computer,
  columnName: string,
  columnType: SerializedType,
  markType: PlotElement['markType']
): EncodingSpec {
  const type = encodingTypeForColumnType(columnType);
  const spec: EncodingSpec = {
    field: columnName,
    type,
    title: '',
    timeUnit:
      columnType.kind === 'date' ? displayTimeUnitType(columnType) : undefined,
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
          displayProps.markType
        );
      }

      return encodings;
    },
    {} as Record<EncodingKey, EncodingSpec>
  );

  // if we want to compare multiple columns in the same chart
  if (
    displayProps.y2ColumnName &&
    comparableChartTypes.includes(displayProps.markType)
  ) {
    encoding.color = {
      datum: { repeat: 'layer' },
    };

    encoding.y = {
      aggregate: 'sum',
      field: { repeat: 'layer' },
      type: 'quantitative',
      title: '',
      axis: {},
    };

    encoding.xOffset = {
      datum: { repeat: 'layer' },
      type: 'nominal',
    };

    encoding.x = {
      field: encoding.x?.field,
      type: 'nominal',
      title: '',
      axis: {
        labelAngle: 0,
        labelLimit: 100,
      },
    };
  }

  if (encoding.color && !encoding.color.scale) {
    encoding.color.scale = {
      scheme: displayProps.colorScheme,
    };
  }
  if (encoding.y && encoding.y.axis) {
    encoding.y.axis.labelAngle = 0;
    encoding.y.axis.tickColor = cssVarHex('strongHighlightColor');
    encoding.y.axis.labelColor = cssVarHex('weakerTextColor');
    encoding.y.axis.labelFontWeight = 700;
    encoding.y.axis.gridColor = cssVarHex('highlightColor');
  }
  if (encoding.x && encoding.x.axis) {
    encoding.x.axis.domainColor = cssVarHex('strongHighlightColor');
    encoding.x.axis.tickColor = cssVarHex('strongHighlightColor');
    encoding.x.axis.labelColor = cssVarHex('weakerTextColor');
    encoding.x.axis.labelAngle = 0;
    encoding.x.axis.labelFontWeight = 700;
    encoding.x.axis.grid = false;
  }
  if (
    !comparableChartTypes.includes(displayProps.markType) &&
    displayProps.markType !== 'arc'
  ) {
    encoding.color = undefined;
  }

  const markProps =
    displayProps.markType === 'bar' ? { width: { band: 0.8 } } : {};

  return {
    mark: {
      interpolate: 'natural',
      type: displayProps.markType,
      tooltip: true,
      ...markProps,
    },
    encoding,
    config: {
      encoding: {
        color: {
          scheme: displayProps.colorScheme || 'deciblues',
        },
      },
      mark: {
        stroke:
          displayProps.markType !== 'arc' && !encoding.color
            ? cssVarHex('chartThemeMonochromeBlue5')
            : undefined,
        fill: markTypeToFill(displayProps.markType),
        strokeWidth: 3,
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
    return (column as Array<bigint>).map((d) => formatResult('en-US', d, type));
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

function findWideDataDomain(
  key: FieldType | undefined,
  data: Row[]
): [number, number] | void {
  let min = Infinity;
  let max = -Infinity;

  if (typeof key === 'string') {
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
