import { normalizePlotSpec } from './normalizePlotSpec';

describe('normalizePlotSpec', () => {
  it('returns undefined when undefined', () => {
    expect(normalizePlotSpec(undefined)).toBeUndefined();
  });

  it('removes extra encodings when mark type is arc', () => {
    expect(
      normalizePlotSpec({
        mark: { type: 'arc', tooltip: true },
        encoding: {
          theta: {
            field: 'field1',
            type: 'nominal',
          },
          x: {
            field: 'field2',
            type: 'quantitative',
          },
          y: {
            field: 'field3',
            type: 'quantitative',
          },
          y2: {
            field: 'field31',
            type: 'quantitative',
          },
          size: {
            field: 'field4',
            type: 'quantitative',
          },
          color: {
            field: 'field5',
            type: 'nominal',
          },
          column: {},
          xOffset: {},
          aggregate: {},
          datum: {},
        },
      })
    ).toMatchObject({
      mark: { type: 'arc', tooltip: true },
      encoding: {
        theta: {
          field: 'field1',
          type: 'nominal',
        },
        x: undefined,
        y: undefined,
        y2: {
          field: 'field31',
          type: 'quantitative',
        },
        size: undefined,
        color: {
          field: 'field5',
          type: 'nominal',
        },
        column: {},
        xOffset: {},
        aggregate: {},
        datum: {},
      },
    });
  });

  it('removes theta and size encoding when mark type is bar', () => {
    expect(
      normalizePlotSpec({
        mark: { type: 'bar', tooltip: true },
        encoding: {
          theta: {
            field: 'field1',
            type: 'nominal',
          },
          x: {
            field: 'field2',
            type: 'quantitative',
          },
          y: {
            field: 'field3',
            type: 'quantitative',
          },
          y2: {
            field: 'field31',
            type: 'quantitative',
          },
          size: {
            field: 'field4',
            type: 'quantitative',
          },
          color: {
            field: 'field5',
            type: 'nominal',
          },
          column: {},
          xOffset: {},
          aggregate: {},
          datum: {},
        },
      })
    ).toMatchObject({
      mark: { type: 'bar', tooltip: true },
      encoding: {
        theta: undefined,
        x: {
          field: 'field2',
          type: 'quantitative',
        },
        y: {
          field: 'field3',
          type: 'quantitative',
        },
        size: undefined,
        color: {
          field: 'field5',
          type: 'nominal',
        },
        column: {},
        xOffset: {},
        aggregate: {},
        datum: {},
      },
    });
  });
});
