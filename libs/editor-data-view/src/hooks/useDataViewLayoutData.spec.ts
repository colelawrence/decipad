import { Result } from '@decipad/computer';
import { F } from '@decipad/editor-utils';
import { VirtualColumn } from '../types';
import { layoutPowerData } from './useDataViewLayoutData';

describe('layoutPowerData', () => {
  it('lays out an empty table', async () => {
    expect(await layoutPowerData([], [], [])).toEqual([]);
  });

  it('lays out empty a one-column one-cell table', async () => {
    const columns: Array<VirtualColumn> = [
      {
        name: 'columnName',
        blockId: 'A',
        value: Result.Column.fromValues([F(1)]),
        type: { kind: 'number', unit: null },
      },
    ];

    expect(await layoutPowerData(columns, [], [])).toMatchObject([
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(1),
      },
    ]);
  });

  it('lays out an un-groupable one-column multi-cell table', async () => {
    const columns: Array<VirtualColumn> = [
      {
        name: 'columnName',
        blockId: 'A',
        value: Result.Column.fromValues([F(1), F(2), F(3)]),
        type: { kind: 'number', unit: null },
      },
    ];

    expect(await layoutPowerData(columns, [], [])).toMatchObject([
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(1),
      },
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(2),
      },
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(3),
      },
    ]);
  });

  it('lays out a groupable one-column multi-cell table', async () => {
    const columns: Array<VirtualColumn> = [
      {
        name: 'columnName',
        blockId: 'A',
        value: Result.Column.fromValues([F(1), F(2), F(1)]),
        type: { kind: 'number', unit: null },
      },
    ];
    expect(await layoutPowerData(columns, [], [])).toMatchObject([
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(1),
      },
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(2),
      },
    ]);
  });

  it('lays out a un-groupable two-column multi-cell table', async () => {
    const columns: Array<VirtualColumn> = [
      {
        name: 'Column1',
        blockId: 'A',
        value: Result.Column.fromValues([F(1), F(2), F(3)]),
        type: { kind: 'number', unit: null },
      },
      {
        name: 'Column2',
        blockId: 'A',
        value: Result.Column.fromValues([F(4), F(5), F(6)]),
        type: { kind: 'number', unit: null },
      },
    ];

    expect(await layoutPowerData(columns, [], [])).toMatchObject([
      {
        children: [
          {
            children: [],
            collapsible: false,
            columnIndex: 1,
            elementType: 'group',
            type: {
              kind: 'number',
              unit: null,
            },
            value: F(4),
          },
        ],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(1),
      },
      {
        children: [
          {
            children: [],
            collapsible: false,
            columnIndex: 1,
            elementType: 'group',
            type: {
              kind: 'number',
              unit: null,
            },
            value: F(5),
          },
        ],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(2),
      },
      {
        children: [
          {
            children: [],
            collapsible: false,
            columnIndex: 1,
            elementType: 'group',
            type: {
              kind: 'number',
              unit: null,
            },
            value: F(6),
          },
        ],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(3),
      },
    ]);
  });

  it('lays out a groupable two-column multi-cell table', async () => {
    const columns: Array<VirtualColumn> = [
      {
        name: 'Column1',
        blockId: 'A',
        value: Result.Column.fromValues([F(1), F(2), F(1)]),
        type: { kind: 'number', unit: null },
      },
      {
        name: 'Column2',
        blockId: 'A',
        value: Result.Column.fromValues([F(4), F(5), F(6)]),
        type: { kind: 'number', unit: null },
      },
    ];

    expect(await layoutPowerData(columns, [], [])).toMatchObject([
      {
        children: [],
        collapsible: true,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: {
          d: 1n,
          n: 1n,
          s: 1n,
        },
      },
      {
        children: [
          {
            children: [],
            collapsible: false,
            columnIndex: 1,
            elementType: 'group',
            type: {
              kind: 'number',
              unit: null,
            },
            value: F(5),
          },
        ],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: F(2),
      },
    ]);
  });
});
