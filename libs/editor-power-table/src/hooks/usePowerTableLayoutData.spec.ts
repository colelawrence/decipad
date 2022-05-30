import { Interpreter, SerializedType } from '@decipad/computer';
import { F } from '@decipad/editor-utils';
import { layoutPowerData } from './usePowerTableLayoutData';

describe('layoutPowerData', () => {
  it('throws on mismatched values and types', () => {
    const columnValues: Interpreter.ResultTable = [[F(1)]];
    const columnTypes: SerializedType[] = [];

    const table = {
      value: columnValues,
      type: columnTypes,
    };
    expect(() => layoutPowerData(table.value, table.type)).toThrow();
  });

  it('lays out an empty table', () => {
    const columnValues: Interpreter.ResultTable = [];
    const columnTypes: SerializedType[] = [];

    const table = {
      value: columnValues,
      type: columnTypes,
    };
    expect(layoutPowerData(table.value, table.type)).toEqual([]);
  });

  it('lays out empty a one-column one-cell table', () => {
    const columnValues: Interpreter.ResultTable = [[F(1)]];
    const columnTypes: SerializedType[] = [{ kind: 'number', unit: null }];

    const table = {
      value: columnValues,
      type: columnTypes,
    };
    expect(layoutPowerData(table.value, table.type)).toEqual([
      {
        rest: [],
        rowSpan: 1,
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(1),
      },
    ]);
  });

  it('lays out an un-groupable one-column multi-cell table', () => {
    const columnValues: Interpreter.ResultTable = [[F(1), F(2), F(3)]];
    const columnTypes: SerializedType[] = [{ kind: 'number', unit: null }];

    const table = {
      value: columnValues,
      type: columnTypes,
    };
    expect(layoutPowerData(table.value, table.type)).toEqual([
      {
        value: F(1),
        rowSpan: 1,
        type: {
          kind: 'number',
          unit: null,
        },
        rest: [],
      },
      {
        value: F(2),
        rowSpan: 1,
        type: {
          kind: 'number',
          unit: null,
        },
        rest: [],
      },
      {
        value: F(3),
        rowSpan: 1,
        type: {
          kind: 'number',
          unit: null,
        },
        rest: [],
      },
    ]);
  });

  it('lays out a groupable one-column multi-cell table', () => {
    const columnValues: Interpreter.ResultTable = [[F(1), F(2), F(1)]];
    const columnTypes: SerializedType[] = [{ kind: 'number', unit: null }];

    const table = {
      value: columnValues,
      type: columnTypes,
    };
    expect(layoutPowerData(table.value, table.type)).toEqual([
      {
        rest: [],
        rowSpan: 1,
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(1),
      },
      {
        rest: [],
        rowSpan: 1,
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(2),
      },
    ]);
  });

  it('lays out a un-groupable two-column multi-cell table', () => {
    const columnValues: Interpreter.ResultTable = [
      [F(1), F(2), F(3)],
      [F(4), F(5), F(6)],
    ];
    const columnTypes: SerializedType[] = [
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
    ];

    const table = {
      value: columnValues,
      type: columnTypes,
    };
    expect(layoutPowerData(table.value, table.type)).toEqual([
      {
        value: F(1),
        rowSpan: 2,
        type: {
          kind: 'number',
          unit: null,
        },
        rest: [
          {
            rest: [],
            rowSpan: 1,
            type: {
              kind: 'number',
              unit: null,
            },
            value: F(4),
          },
        ],
      },
      {
        value: F(2),
        rowSpan: 2,
        type: {
          kind: 'number',
          unit: null,
        },
        rest: [
          {
            rest: [],
            rowSpan: 1,
            type: {
              kind: 'number',
              unit: null,
            },
            value: F(5),
          },
        ],
      },
      {
        value: F(3),
        rowSpan: 2,
        type: {
          kind: 'number',
          unit: null,
        },
        rest: [
          {
            rest: [],
            rowSpan: 1,
            type: {
              kind: 'number',
              unit: null,
            },
            value: F(6),
          },
        ],
      },
    ]);
  });

  it('lays out a groupable two-column multi-cell table', () => {
    const columnValues: Interpreter.ResultTable = [
      [F(1), F(2), F(1)],
      [F(4), F(5), F(6)],
    ];
    const columnTypes: SerializedType[] = [
      { kind: 'number', unit: null },
      { kind: 'number', unit: null },
    ];

    const table = {
      value: columnValues,
      type: columnTypes,
    };
    expect(layoutPowerData(table.value, table.type)).toEqual([
      {
        rest: [
          {
            rest: [],
            rowSpan: 1,
            type: {
              kind: 'number',
              unit: null,
            },
            value: F(4),
          },
          {
            rest: [],
            rowSpan: 1,
            type: {
              kind: 'number',
              unit: null,
            },
            value: F(6),
          },
        ],
        rowSpan: 3,
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(1),
      },
      {
        rest: [
          {
            rest: [],
            rowSpan: 1,
            type: {
              kind: 'number',
              unit: null,
            },
            value: F(5),
          },
        ],
        rowSpan: 2,
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(2),
      },
    ]);
  });
});
