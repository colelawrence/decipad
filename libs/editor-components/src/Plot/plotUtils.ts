import { PlotElement } from '@decipad/editor-types';
import Fraction from '@decipad/fraction';
import {
  convertToMultiplierUnit,
  OneResult,
  Result,
  SerializedType,
  stringifyUnits,
} from '@decipad/language';

export type DisplayProps = {
  sourceVarName: string;
  markType: PlotElement['markType'];
  xColumnName: string;
  yColumnName: string;
  sizeColumnName: string;
  colorColumnName: string;
  thetaColumnName: string;
};

type DisplayType = 'quantitative' | 'temporal' | 'ordinal' | 'nominal';

interface PlotSpec {
  mark: { type: PlotElement['markType']; tooltip: boolean };
  data: { name: 'table' };
  encoding: Record<EncodingKey, EncodingSpec>;
}

type AllowedPlotValue = string | boolean | number | Date;

type Row = Record<string, AllowedPlotValue>;

type PlotData = {
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

type EncodingSpec = {
  field: string;
  type: DisplayType;
  timeUnit?: TimeUnit;
  title?: string;
  scale?: {
    domain?: [number, number];
    domainMin?: number;
    domainMax?: number;
  };
};
type EncodingKey = 'x' | 'y' | 'size' | 'color' | 'theta';

const displayPropsToEncoding: Record<string, EncodingKey> = {
  xColumnName: 'x',
  yColumnName: 'y',
  sizeColumnName: 'size',
  colorColumnName: 'color',
  thetaColumnName: 'theta',
};

const relevantDataDisplayProps: Array<keyof DisplayProps> = [
  'xColumnName',
  'yColumnName',
  'sizeColumnName',
  'colorColumnName',
  'thetaColumnName',
];

function encodingTypeForColumnType(type: SerializedType): DisplayType {
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

function columnTitle(columnName: string, columnType: SerializedType): string {
  return columnType.kind === 'number' && columnType.unit != null
    ? `${columnName} (${stringifyUnits(columnType.unit)})`
    : columnName;
}

export function specFromType(
  type: null | SerializedType,
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

  const encoding = relevantDataDisplayProps.reduce((encodings, key) => {
    const channelKey = displayPropsToEncoding[key];
    const columnName = displayProps[key];
    if (!columnName) {
      return encodings;
    }
    const columnIndex = columnNames.indexOf(columnName);
    const columnType = columnTypes[columnIndex];
    if (columnType) {
      // eslint-disable-next-line no-param-reassign
      encodings[channelKey] = {
        field: columnNames[columnIndex],
        type: encodingTypeForColumnType(columnType),
        title: columnTitle(columnName, columnType),
        timeUnit:
          columnType.kind === 'date'
            ? displayTimeUnitType(columnType)
            : undefined,
      };
    }

    return encodings;
  }, {} as Record<EncodingKey, EncodingSpec>);

  return {
    mark: { type: displayProps.markType, tooltip: true },
    data: { name: 'table' },
    encoding,
  };
}

function toPlotColumn(
  type: SerializedType,
  column: Array<OneResult>
): Array<AllowedPlotValue> {
  if (!column || !column.length) {
    return column as Array<AllowedPlotValue>;
  }
  if (type.kind === 'number') {
    return (column as Array<Fraction>).map((f) =>
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
  result: undefined | Result<'table'>,
  displayProps: DisplayProps
): undefined | PlotData {
  if (!result || result.type.kind !== 'table') {
    return;
  }
  const columnNames = relevantColumnNames(displayProps);
  const columnsTypesAndResults: Array<[SerializedType, OneResult[]]> =
    columnNames.map((columnName): [SerializedType, OneResult[]] => {
      const index = result.type.columnNames.indexOf(columnName);
      return [result.type.columnTypes[index], result.value[index]];
    });
  const returnValue: Record<string, Array<AllowedPlotValue>> = {};
  columnNames.forEach((columnName, index) => {
    const [type, values] = columnsTypesAndResults[index];
    returnValue[columnName] = toPlotColumn(type, values);
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
  for (const encValue of Object.values(spec?.encoding)) {
    const { field } = encValue;
    const domain = findWideDataDomain(field, data.table);
    if (domain) {
      if (!encValue.scale) {
        encValue.scale = {};
      }
      encValue.scale.domain = domain;
    }
  }
  return spec;
}
