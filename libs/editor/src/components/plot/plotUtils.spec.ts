import Fraction from '@decipad/fraction';
import { SerializedType } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import {
  DisplayProps,
  enhanceSpecFromWideData,
  resultToPlotResultData,
  specFromType,
} from './plotUtils';

function F(n: number) {
  return new Fraction(n);
}

const defaultDisplayProps: DisplayProps = {
  sourceVarName: '',
  xColumnName: '',
  yColumnName: '',
  sizeColumnName: '',
  colorColumnName: '',
  thetaColumnName: '',
  markType: 'bar',
};

const displayProps = (props: Partial<DisplayProps> = {}): DisplayProps => {
  return {
    ...defaultDisplayProps,
    ...props,
  };
};

const tableType: SerializedType = {
  kind: 'table',
  tableLength: 3,
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
  [F(1), F(2), F(3)], // simple-number
];

describe('specFromType', () => {
  it('returns no spec if no type is provided', () => {
    expect(specFromType(null, displayProps())).toBeUndefined();
  });

  it('returns no spec if anything other than a table is provided', () => {
    const type: SerializedType = { kind: 'number', unit: null };
    expect(specFromType(type, displayProps())).toBeUndefined();
  });

  it('returns a default spec with default display props', () => {
    expect(specFromType(tableType, displayProps())).toMatchObject({
      data: {
        name: 'table',
      },
      encoding: {},
      mark: {
        tooltip: true,
        type: 'bar',
      },
    });
  });

  it('changes spec mark type accordingly', () => {
    expect(
      specFromType(tableType, displayProps({ markType: 'area' }))
    ).toMatchObject({
      data: {
        name: 'table',
      },
      encoding: {},
      mark: {
        tooltip: true,
        type: 'area',
      },
    });
  });

  it('xColumnName', () => {
    expect(
      specFromType(tableType, displayProps({ xColumnName: 'index' }))
    ).toMatchObject({
      data: {
        name: 'table',
      },
      encoding: {
        x: {
          field: 'index',
          timeUnit: undefined,
          title: 'index',
          type: 'nominal',
        },
      },
      mark: {
        tooltip: true,
        type: 'bar',
      },
    });
  });

  it('yColumnName', () => {
    expect(
      specFromType(tableType, displayProps({ yColumnName: 'index' }))
    ).toMatchObject({
      data: {
        name: 'table',
      },
      encoding: {
        y: {
          field: 'index',
          title: 'index',
        },
      },
      mark: {
        tooltip: true,
        type: 'bar',
      },
    });
  });

  it('sizeColumnName', () => {
    expect(
      specFromType(tableType, displayProps({ sizeColumnName: 'index' }))
    ).toMatchObject({
      data: {
        name: 'table',
      },
      encoding: {
        size: {
          field: 'index',
          title: 'index',
        },
      },
      mark: {
        tooltip: true,
        type: 'bar',
      },
    });
  });

  it('colorColumnName', () => {
    expect(
      specFromType(tableType, displayProps({ colorColumnName: 'index' }))
    ).toMatchObject({
      data: {
        name: 'table',
      },
      encoding: {
        color: {
          field: 'index',
          title: 'index',
        },
      },
      mark: {
        tooltip: true,
        type: 'bar',
      },
    });
  });

  it('thetaColumnName', () => {
    expect(
      specFromType(tableType, displayProps({ thetaColumnName: 'index' }))
    ).toMatchObject({
      data: {
        name: 'table',
      },
      encoding: {
        theta: {
          field: 'index',
          title: 'index',
        },
      },
      mark: {
        tooltip: true,
        type: 'bar',
      },
    });
  });

  it.each(['year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond'])(
    'supports %s time units',
    (unit) => {
      const expectedDateUnitToVegaTimeUnit: Record<string, string> = {
        year: 'utcyear',
        month: 'utcyearmonth',
        day: 'utcyearmonthdate',
        hour: 'utcyearmonthdatehours',
        minute: 'utcyearmonthdatehoursminutes',
        second: 'utcyearmonthdatehoursminutesseconds',
        millisecond: 'utcyearmonthdatehoursminutesseconds',
      };
      expect(
        specFromType(tableType, displayProps({ xColumnName: `date-${unit}` }))
      ).toMatchObject({
        data: {
          name: 'table',
        },
        encoding: {
          x: {
            field: `date-${unit}`,
            timeUnit: expectedDateUnitToVegaTimeUnit[unit],
            title: `date-${unit}`,
            type: 'temporal',
          },
        },
        mark: {
          tooltip: true,
          type: 'bar',
        },
      });
    }
  );
});

describe('resultToPlotResultData', () => {
  it('undefined result gets undefined plot results', () => {
    expect(resultToPlotResultData(undefined, displayProps())).toBeUndefined();
  });
  it('picks columns', () => {
    expect(
      resultToPlotResultData(
        { value: tableData, type: tableType },
        displayProps({
          xColumnName: 'index',
          yColumnName: 'date-year',
          thetaColumnName: 'date-month',
          colorColumnName: 'date-day',
          sizeColumnName: 'simple-number',
        })
      )
    ).toMatchInlineSnapshot(`
      Object {
        "table": Array [
          Object {
            "date-day": 1970-01-01T00:00:00.100Z,
            "date-month": 1970-01-01T00:00:00.100Z,
            "date-year": 1970-01-01T00:00:00.100Z,
            "index": "label 1",
            "simple-number": 1,
          },
          Object {
            "date-day": 1970-01-01T00:00:00.200Z,
            "date-month": 1970-01-01T00:00:00.200Z,
            "date-year": 1970-01-01T00:00:00.200Z,
            "index": "label 2",
            "simple-number": 2,
          },
          Object {
            "date-day": 1970-01-01T00:00:00.300Z,
            "date-month": 1970-01-01T00:00:00.300Z,
            "date-year": 1970-01-01T00:00:00.300Z,
            "index": "label 3",
            "simple-number": 3,
          },
        ],
      }
    `);
  });
});

describe('enhanceSpecFromWideData', () => {
  it('enhances spec when data are numbers', () => {
    const data = {
      table: [
        { a: 1, 'simple-number': 4 },
        { a: 3, 'simple-number': 2 },
        { a: 5, 'simple-number': 8 },
        { a: 7, 'simple-number': 6 },
      ],
    };
    const spec = enhanceSpecFromWideData(
      getDefined(
        specFromType(tableType, displayProps({ xColumnName: 'simple-number' }))
      ),
      data
    );

    expect(spec.encoding.x.scale?.domain).toStrictEqual([0, 9]);
  });
});
