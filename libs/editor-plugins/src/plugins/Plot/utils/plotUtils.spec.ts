import { expect, describe, it } from 'vitest';
import { BasePlotProps } from '@decipad/editor-types';
import type { SerializedType } from '@decipad/language-interfaces';
import { N } from '@decipad/number';
import { resultToPlotResultData } from './plotUtils';

const defaultDisplayProps: BasePlotProps = {
  sourceVarName: '',
  xColumnName: '',
  xAxisLabel: '',
  yAxisLabel: '',
  yColumnNames: [],
  sizeColumnName: '',
  markType: 'bar',
  yColumnChartTypes: [],
  orientation: 'horizontal',
  grid: false,
  startFromZero: true,
  mirrorYAxis: false,
  flipTable: false,
  groupByX: false,
  showDataLabel: true,
  barVariant: 'grouped',
  lineVariant: 'simple',
  arcVariant: 'donut',
  schema: 'jun-2024',
};

const displayProps = (props: Partial<BasePlotProps> = {}): BasePlotProps => {
  return {
    ...defaultDisplayProps,
    ...props,
  };
};

const tableType: SerializedType = {
  kind: 'table',
  indexName: 'index',
  columnTypes: [
    { kind: 'string' },
    { kind: 'date', date: 'year' },
    { kind: 'date', date: 'month' },
    { kind: 'date', date: 'day' },
    { kind: 'date', date: 'hour' },
    { kind: 'date', date: 'minute' },
    { kind: 'date', date: 'second' },
    { kind: 'date', date: 'millisecond' },
    { kind: 'number', unit: null },
  ],
  columnNames: [
    'index',
    'date-year',
    'date-month',
    'date-day',
    'date-hour',
    'date-minute',
    'date-second',
    'date-millisecond',
    'simple-number',
  ],
};

const tableData = [
  ['label 1', 'label 2', 'label 3'], // index
  [100n, 200n, 300n], // date-year
  [100n, 200n, 300n], // date-month
  [100n, 200n, 300n], // date-day
  [100n, 200n, 300n], // date-hour
  [100n, 200n, 300n], // date-minute
  [100n, 200n, 300n], // date-second
  [100n, 200n, 300n], // date-millisecond
  [N(1), N(2), N(3)], // simple-number
];
describe('resultToPlotResultData', () => {
  it('undefined result gets undefined plot results', async () => {
    expect(
      await resultToPlotResultData(undefined, displayProps())
    ).toBeUndefined();
  });
  it('picks columns', async () => {
    expect(
      await resultToPlotResultData(
        { value: tableData, type: tableType, meta: undefined },
        displayProps({
          xColumnName: 'index',
          yColumnNames: ['date-day', 'date-month', 'date-year'],
          sizeColumnName: 'simple-number',
        })
      )
    ).toMatchInlineSnapshot(`
      {
        "data": {
          "table": [
            {
              "date-day": "1970-01-01",
              "date-month": "1970-01",
              "date-year": "1970",
              "index": "label 1",
              "simple-number": 1,
            },
            {
              "date-day": "1970-01-01",
              "date-month": "1970-01",
              "date-year": "1970",
              "index": "label 2",
              "simple-number": 2,
            },
            {
              "date-day": "1970-01-01",
              "date-month": "1970-01",
              "date-year": "1970",
              "index": "label 3",
              "simple-number": 3,
            },
          ],
        },
        "unfiltered": {
          "table": [
            {
              "date-day": "1970-01-01",
              "date-hour": "1970-01-01 00:00",
              "date-millisecond": "1970-01-01 00:00",
              "date-minute": "1970-01-01 00:00",
              "date-month": "1970-01",
              "date-second": "1970-01-01 00:00",
              "date-year": "1970",
              "index": "label 1",
              "simple-number": 1,
            },
            {
              "date-day": "1970-01-01",
              "date-hour": "1970-01-01 00:00",
              "date-millisecond": "1970-01-01 00:00",
              "date-minute": "1970-01-01 00:00",
              "date-month": "1970-01",
              "date-second": "1970-01-01 00:00",
              "date-year": "1970",
              "index": "label 2",
              "simple-number": 2,
            },
            {
              "date-day": "1970-01-01",
              "date-hour": "1970-01-01 00:00",
              "date-millisecond": "1970-01-01 00:00",
              "date-minute": "1970-01-01 00:00",
              "date-month": "1970-01",
              "date-second": "1970-01-01 00:00",
              "date-year": "1970",
              "index": "label 3",
              "simple-number": 3,
            },
          ],
        },
      }
    `);
  });
});
